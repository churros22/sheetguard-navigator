
import { useState, useEffect } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { BarChart3, FileText, FolderTree, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { clearAuthState, getAuthState } from "@/utils/authUtils";
import { appSettings } from "@/configs/appConfig";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check authentication on load
  useEffect(() => {
    if (!getAuthState()) {
      navigate("/login");
    }
    
    // Check for mobile view
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [navigate]);
  
  const handleLogout = () => {
    clearAuthState();
    toast({
      title: "Logged out successfully",
      duration: 3000,
    });
    navigate("/login");
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link to={to} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 py-6 rounded-none border-l-4 border-transparent transition-all",
          "hover:bg-accent hover:border-l-4 hover:border-primary",
          location.pathname === to && "bg-accent/50 border-l-4 border-primary"
        )}
      >
        <Icon className="h-5 w-5" />
        {(isSidebarOpen || isMobileView) && <span>{label}</span>}
      </Button>
    </Link>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-4 bg-background z-10">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            {appSettings.appName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside 
          className={cn(
            "h-[calc(100vh-4rem)] border-r bg-background w-64 transition-all duration-300 ease-in-out overflow-hidden hidden md:block",
            !isSidebarOpen && "w-16",
          )}
        >
          <nav className="h-full py-4 flex flex-col">
            <div className="space-y-1">
              <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
              <NavItem to="/diagrammes" icon={FolderTree} label="Diagrammes" />
              <NavItem to="/documents" icon={FileText} label="Documents" />
              <NavItem to="/tableaux" icon={BarChart3} label="Tableaux" />
            </div>
          </nav>
        </aside>
        
        {/* Sidebar - Mobile */}
        {isMobileView && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsSidebarOpen(false)}
          >
            <aside 
              className="h-full w-64 border-r bg-background transition-all duration-300 ease-in-out overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="h-full py-4 flex flex-col">
                <div className="space-y-1">
                  <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                  <NavItem to="/diagrammes" icon={FolderTree} label="Diagrammes" />
                  <NavItem to="/documents" icon={FileText} label="Documents" />
                  <NavItem to="/tableaux" icon={BarChart3} label="Tableaux" />
                </div>
              </nav>
            </aside>
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
