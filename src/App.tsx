
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import DiagrammesPage from "./pages/DiagrammesPage";
import DocumentsPage from "./pages/DocumentsPage";
import TableauxPage from "./pages/TableauxPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { getAuthState } from "./utils/authUtils";
import { appSettings } from "./configs/appConfig";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = getAuthState();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [basePath, setBasePath] = useState("");
  
  // Set base path for GitHub Pages deployment
  useEffect(() => {
    if (appSettings.deployment.isProduction) {
      setBasePath(appSettings.deployment.basePath);
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>