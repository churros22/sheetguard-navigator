
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { validatePassword, setAuthState, getAuthState } from "@/utils/authUtils";

// Import framer-motion
<lov-add-dependency>framer-motion@^10.16.4</lov-add-dependency>

const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  // Check if already authenticated
  useEffect(() => {
    if (getAuthState()) {
      navigate("/");
    }
  }, [navigate]);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simulate network delay
    setTimeout(() => {
      if (validatePassword(password)) {
        setAuthState(true);
        navigate("/");
      } else {
        setError("Invalid password. Please try again.");
        setIsLoading(false);
      }
    }, 1000);
  };
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-background to-secondary/30 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <LockKeyhole className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Authentication Required
              </CardTitle>
              <CardDescription>
                Please enter your password to access the application
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      autoComplete="current-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-destructive text-sm"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"
                    />
                  ) : null}
                  {isLoading ? "Authenticating..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </AnimatePresence>
      
      {/* Logo placeholder */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <img 
          src="/placeholder.svg" 
          alt="Company Logo" 
          className="h-8 opacity-40"
        />
      </div>
    </div>
  );
};

export default LoginPage;
