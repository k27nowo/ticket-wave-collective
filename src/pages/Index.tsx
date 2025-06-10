
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Calendar, MapPin, Users, Settings, CreditCard } from "lucide-react";
import EventCard from "@/components/EventCard";
import CreateEventModal from "@/components/CreateEventModal";
import { Link } from "react-router-dom";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Mock events data
  const events = [
    {
      id: 1,
      title: "Summer Music Festival 2024",
      description: "Join us for an unforgettable night of music under the stars with amazing artists and great vibes!",
      date: "2024-07-15",
      time: "18:00",
      location: "Central Park, New York",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
      ticketsAvailable: 150,
      totalTickets: 200,
      price: 45
    },
    {
      id: 2,
      title: "Tech Conference 2024",
      description: "Learn from industry leaders and network with fellow professionals in this exciting tech event.",
      date: "2024-08-22",
      time: "09:00",
      location: "Convention Center, San Francisco",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      ticketsAvailable: 75,
      totalTickets: 100,
      price: 299
    }
  ];

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">TicketHub</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/payment-settings">
                <Button variant="outline" className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Payment Settings</span>
                </Button>
              </Link>
              
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">Active events</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {events.reduce((sum, event) => sum + (event.totalTickets - event.ticketsAvailable), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {events.reduce((sum, event) => {
                  const soldTickets = event.totalTickets - event.ticketsAvailable;
                  return sum + (soldTickets * event.price);
                }, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/90 backdrop-blur-sm"
            />
          </div>
          <Button variant="outline" className="bg-white/90 backdrop-blur-sm">
            <MapPin className="h-4 w-4 mr-2" />
            Filter by Location
          </Button>
        </div>

        {/* Events Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
            <Badge variant="secondary" className="bg-white/90">
              {filteredEvents.length} events
            </Badge>
          </div>
          
          {filteredEvents.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {searchTerm ? "No events found" : "No events yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? "Try adjusting your search criteria" 
                    : "Create your first event to get started"
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Event Modal */}
      <CreateEventModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen} 
      />
    </div>
  );
};

export default Index;
