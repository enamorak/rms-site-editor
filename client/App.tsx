import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Index from "./pages/Index";
import Robots from "./pages/Robots";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { Button } from "@/components/ui/button";
import { Robot, MapPin, BarChart3 } from "lucide-react";

const queryClient = new QueryClient();

function NavBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b">
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Robot className="w-6 h-6 text-primary" />
          RMF Suite
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant={isActive("/dashboard") ? "default" : "ghost"}
            asChild
            size="sm"
          >
            <Link to="/dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant={isActive("/") ? "default" : "ghost"}
            asChild
            size="sm"
          >
            <Link to="/">
              <MapPin className="w-4 h-4 mr-2" />
              Site Editor
            </Link>
          </Button>
          <Button
            variant={isActive("/robots") ? "default" : "ghost"}
            asChild
            size="sm"
          >
            <Link to="/robots">
              <Robot className="w-4 h-4 mr-2" />
              Fleet Manager
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="pt-16">{children}</div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/robots" element={<Robots />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
