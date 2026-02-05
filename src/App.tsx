 import { ThemeProvider } from "@/components/ThemeProvider";
 import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import NotificationsPage from "./pages/NotificationsPage";
import MessagesPage from "./pages/MessagesPage";
import Search from "./pages/Search";
import EditProfile from "./pages/EditProfile";
 import Auth from "./pages/Auth";
 import HashtagPage from "./pages/HashtagPage";
 import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Feed />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile/:username" element={<Profile />} />
 
       <Route path="/search" element={<Search />} />
       <Route path="/hashtag/:tag" element={<HashtagPage />} />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

 const App = () => (
   <ThemeProvider defaultTheme="system" storageKey="socialhub-ui-theme">
     <QueryClientProvider client={queryClient}>
       <TooltipProvider>
         <AuthProvider>
           <Toaster />
           <Sonner />
           <BrowserRouter>
             <AppRoutes />
           </BrowserRouter>
         </AuthProvider>
       </TooltipProvider>
     </QueryClientProvider>
   </ThemeProvider>
 );

export default App;
