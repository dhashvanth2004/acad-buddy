import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AdminSupportPanel } from "@/components/support/AdminSupportPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
export default function AdminDashboard() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) return;
            const { data } = await supabase.from("profiles").select("is_admin").eq("user_id", user.id).single() as any;

            if (!data?.is_admin) {
                toast({
                    title: "Access Denied",
                    description: "You must be an administrator to access this console.",
                    variant: "destructive",
                });
                navigate("/dashboard");
                return;
            }
            setIsAdmin(true);
        };
        checkAdmin();
    }, [user, navigate]);

    const { data: apps, isLoading } = useQuery({
        queryKey: ["admin_applications"],
        queryFn: async () => {
            const { data, error } = await (supabase as any).from("mentor_applications").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: isAdmin,
    });

    const updateAppMutation = useMutation({
        mutationFn: async ({ id, action }: { id: string, action: 'approve' | 'reject' }) => {
            const rpcName = action === 'approve' ? 'approve_mentor_application' : 'reject_mentor_application';
            const { error } = await (supabase as any).rpc(rpcName, { app_id: id });
            if (error) throw error;
            return action;
        },
        onSuccess: (action) => {
            toast({ title: `Application ${action}d` });
            queryClient.invalidateQueries({ queryKey: ["admin_applications"] });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    if (!user) return null;

    if (!isAdmin && !isLoading) {
        return (
            <div className="min-h-screen bg-background pt-24 text-center">
                <h1 className="text-2xl font-bold">Unauthorized</h1>
                <p>You must be an administrator to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="container mx-auto px-4 py-8 mt-16 flex-1">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Mentor Applications</h1>

                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : !apps || apps.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            No mentor applications found.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {apps.map((app: any) => (
                            <Card key={app.id}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center text-xl">
                                        <span>{app.full_name}</span>
                                        <Badge variant={app.status === 'pending' ? 'default' : app.status === 'approved' ? 'success' : 'destructive'}
                                            className={app.status === 'approved' ? 'bg-success hover:bg-success' : ''}>
                                            {app.status}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Department</p>
                                            <p className="font-medium">{app.department}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Year</p>
                                            <p className="font-medium">{app.year}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-muted-foreground">Bio</p>
                                            <p className="text-sm border p-3 rounded bg-muted/30 whitespace-pre-wrap">{app.bio}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between mt-4 pb-4 border-b">
                                        <div className="flex flex-wrap gap-2">
                                            {app.subjects?.map((s: string) => <Badge variant="secondary" key={s}>{s}</Badge>)}
                                        </div>
                                        <div className="text-right text-sm">
                                            <p><strong>Rate:</strong> ${app.hourly_rate}/hr</p>
                                            <p><strong>Availability:</strong> {app.availability}</p>
                                        </div>
                                    </div>

                                    {app.status === 'pending' && (
                                        <div className="mt-4 flex gap-4">
                                            <Button onClick={() => updateAppMutation.mutate({ id: app.id, action: 'approve' })} disabled={updateAppMutation.isPending}>
                                                Approve
                                            </Button>
                                            <Button variant="destructive" onClick={() => updateAppMutation.mutate({ id: app.id, action: 'reject' })} disabled={updateAppMutation.isPending}>
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Support Tickets Section */}
                <h2 className="text-2xl font-bold mt-12 mb-6">Support Tickets</h2>
                <AdminSupportPanel />
            </main>
            <Footer />
        </div>
    );
}
