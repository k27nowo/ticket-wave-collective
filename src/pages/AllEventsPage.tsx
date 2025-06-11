
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar, MapPin, Users } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import SecureCreateEventModal from "@/components/SecureCreateEventModal";

const AllEventsPage = () => {
  const { events, loading } = useEvents();
  const navigate = useNavigate();
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);

  const handleCreateEvent = () => {
    setCreateEventModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Event Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Events</h1>
          <p className="text-gray-600 mt-1">Manage and view all your events</p>
        </div>
        <Button 
          onClick={handleCreateEvent}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No events yet</h3>
              <p className="text-gray-500 mb-6">Create your first event to get started!</p>
              <Button 
                onClick={handleCreateEvent}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const totalTickets = event.ticket_types?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
            const soldTickets = event.ticket_types?.reduce((sum, ticket) => sum + ticket.sold, 0) || 0;
            const salesPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;
            const totalRevenue = event.ticket_types?.reduce((sum, ticket) => sum + (ticket.price * ticket.sold), 0) || 0;

            return (
              <Card 
                key={event.id}
                className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop"} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                      {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {soldTickets}/{totalTickets} tickets sold ({salesPercentage.toFixed(1)}%)
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="text-lg font-semibold text-green-600">${totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Available Tickets</p>
                      <p className="text-lg font-semibold">{totalTickets - soldTickets}</p>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{event.description}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      <SecureCreateEventModal 
        open={createEventModalOpen}
        onOpenChange={setCreateEventModalOpen}
      />
    </div>
  );
};

export default AllEventsPage;
