
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import SecureIndex from "./pages/SecureIndex";
import Auth from "./pages/Auth";
import EventPage from "./pages/EventPage";
import PublicEvent from "./pages/PublicEvent";
import PaymentSettings from "./pages/PaymentSettings";
import TicketTracking from "./pages/TicketTracking";
import Newsletter from "./pages/Newsletter";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/public/event/:eventId" element={<PublicEvent />} />
            <Route path="/" element={
              <ProtectedRoute>
                <SecureIndex />
              </ProtectedRoute>
            } />
            <Route path="/event/:eventId" element={
              <ProtectedRoute>
                <EventPage />
              </ProtectedRoute>
            } />
            <Route path="/payment-settings" element={
              <ProtectedRoute>
                <PaymentSettings />
              </ProtectedRoute>
            } />
            <Route path="/ticket-tracking" element={
              <ProtectedRoute>
                <TicketTracking />
              </ProtectedRoute>
            } />
            <Route path="/newsletter" element={
              <ProtectedRoute>
                <Newsletter />
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <Team />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
