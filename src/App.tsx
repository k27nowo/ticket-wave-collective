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
import DashboardLayout from "./components/DashboardLayout";

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
            <Route path="/events" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900">All Events</h1>
                    {/* This will show the events list - can be enhanced later */}
                    <p className="text-gray-600">Events list will be displayed here.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/event/new" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
                    {/* Event creation form will be here */}
                    <p className="text-gray-600">Event creation form will be displayed here.</p>
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/event/:eventId" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EventPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/payment-settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PaymentSettings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/ticket-tracking" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TicketTracking />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/newsletter" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Newsletter />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/team" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Team />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
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
