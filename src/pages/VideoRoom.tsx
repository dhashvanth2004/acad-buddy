import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const VideoRoom = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isValidating, setIsValidating] = useState(true);
    const [roomName, setRoomName] = useState("");

    useEffect(() => {
        const validateSession = async () => {
            if (!user || !sessionId) {
                navigate("/");
                return;
            }

            // Check if session exists and user is part of it
            const { data: session, error } = await supabase
                .from("sessions")
                .select("*")
                .eq("id", sessionId)
                .single();

            if (error || !session) {
                console.error("Video Room Load failed. Postgrest Error:", error, "Session dump:", session);
                toast({ title: "Session Not Found", description: "Invalid meeting link.", variant: "destructive" });
                navigate("/dashboard");
                return;
            }

            if (user.id !== session.student_id && user.id !== session.mentor_id) {
                toast({ title: "Access Denied", description: "You are not a participant in this session.", variant: "destructive" });
                navigate("/dashboard");
                return;
            }

            // Generate a secure, deterministic room name based on the session ID
            setRoomName(`AcadBuddy-Session-${sessionId.replace(/-/g, "")}`);
            setIsValidating(false);
        };

        validateSession();
    }, [user, sessionId, navigate]);

    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 mt-16 relative">
                <JitsiMeeting
                    domain="meet.ffmuc.net"
                    roomName={roomName}
                    configOverwrite={{
                        startWithAudioMuted: true,
                        disableModeratorIndicator: true,
                        startScreenSharing: true,
                        enableEmailInStats: false,
                    }}
                    interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    }}
                    userInfo={{
                        displayName: user?.user_metadata?.full_name || "AcadBuddy User",
                        email: user?.email || "user@acadbuddy.local"
                    }}
                    onApiReady={(externalApi) => {
                        // Can be used to hook into meeting ending
                        externalApi.addListener("videoConferenceLeft", () => {
                            navigate("/dashboard");
                        });
                    }}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = "100%";
                        iframeRef.style.width = "100%";
                        iframeRef.style.position = "absolute";
                        iframeRef.style.top = "0";
                        iframeRef.style.left = "0";
                    }}
                />
            </main>
        </div>
    );
};

export default VideoRoom;
