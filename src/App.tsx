import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocialProvider } from "@/context/SocialContext";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SocialProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SocialProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
