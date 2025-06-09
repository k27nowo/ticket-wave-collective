
import { useState } from "react";
import { Plus, Calendar, Ticket, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import CreateEventModal from "@/components/CreateEventModal";

const Index = () => {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock events data - this would come from your database
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Summer Music Festival 2024",
      description: "Join us for an unforgettable night of music under the stars",
      date: "2024-07-15",
      time: "18:00",
      location: "Central Park, New York",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=300&fit=crop",
      ticketTypes: [
        { name: "Early Bird", price: 45, quantity: 100, sold: 23 },
        { name: "Regular", price: 60, quantity: 200, sold: 45 },
        { name: "VIP", price: 120, quantity: 50, sold: 12 }
      ]
    },
    {
      id: 2,
      title: "Tech Conference 2024",
      description: "Explore the latest in technology and innovation",
      date: "2024-08-22",
      time: "09:00",
      location: "Convention Center, San Francisco",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop",
      ticketTypes: [
        { name: "Student", price: 25, quantity: 50, sold: 15 },
        { name: "Regular", price: 150, quantity: 300, sold: 89 },
        { name: "Premium", price: 300, quantity: 100, sold: 34 }
      ]
    }
  ]);

  const stats = {
    totalEvents: events.length,
    totalTicketsSold: events.reduce((acc, event) => 
      acc + event.ticketTypes.reduce((sum, ticket) => sum + ticket.sold, 0), 0
    ),
    totalRevenue: events.reduce((acc, event) => 
      acc + event.ticketTypes.reduce((sum, ticket) => sum + (ticket.sold * ticket.price), 0), 0
    )
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                TicketPro
              </h1>
            </div>
            <Button 
              onClick={() => setShowCreateEvent(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalEvents}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tickets Sold</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalTicketsSold}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <Ticket className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.totalRevenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Your Events</h2>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {filteredEvents.length} events
            </Badge>
          </div>

          {filteredEvents.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No events found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Create your first event to get started"}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowCreateEvent(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal 
        open={showCreateEvent} 
        onOpenChange={setShowCreateEvent}
        onEventCreated={(newEvent) => {
          setEvents([...events, { ...newEvent, id: Date.now() }]);
          setShowCreateEvent(false);
        }}
      />
    </div>
  );
};

export default Index;
