import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ComingSoon = () => {
    const location = useLocation();
    const pathName = location.pathname.replace("/", "").replace("-", " ");
    const title = pathName ? pathName.charAt(0).toUpperCase() + pathName.slice(1) : "Feature";

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center mt-16">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Hammer className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-foreground">
                    {title} is Coming Soon
                </h1>
                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                    We're working hard to bring you this feature. Check back later for updates!
                </p>
                <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all h-12 px-8">
                    <Link to="/home">Return to Home</Link>
                </Button>
            </div>
            <Footer />
        </div>
    );
};

export default ComingSoon;
