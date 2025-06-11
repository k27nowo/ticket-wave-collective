
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Calendar, DollarSign, Users, TrendingUp } from "lucide-react";
import { Event } from "@/types/event";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalSales: 0,
    totalTicketsSold: 0,
    activeEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch upcoming events
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            ticket_types (
              id, name, price, quantity, sold
            )
          `)
          .eq('user_id', user.id)
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(3);

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
        } else {
          setUpcomingEvents(events || []);
        }

        // Fetch all events for stats
        const { data: allEvents, error: allEventsError } = await supabase
          .from('events')
          .select(`
            *,
            ticket_types (
              id, price, quantity, sold
            )
          `)
          .eq('user_id', user.id);

        if (allEventsError) {
          console.error("Error fetching all events:", allEventsError);
        } else {
          // Calculate stats
          const totalEvents = allEvents?.length || 0;
          const activeEvents = allEvents?.filter(event => new Date(event.date) >= new Date()).length || 0;
          
          let totalSales = 0;
          let totalTicketsSold = 0;
          
          allEvents?.forEach(event => {
            event.ticket_types?.forEach(ticket => {
              totalSales += ticket.price * ticket.sold;
              totalTicketsSold += ticket.sold;
            });
          });

          setStats({
            totalEvents,
            totalSales,
            totalTicketsSold,
            activeEvents
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleCreateEvent = () => {
    navigate('/event/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your events.</p>
        </div>
        <Button onClick={handleCreateEvent} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEvents} active events
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all events
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground">
              Total attendees
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents > 0 ? Math.round((stats.totalSales / stats.activeEvents) * 100) / 100 : 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg. sales per event
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Upcoming Events
            {upcomingEvents.length > 0 && (
              <Badge variant="outline">{upcomingEvents.length} upcoming</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-500 mb-4">Create your first event to get started!</p>
              <Button onClick={handleCreateEvent} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const totalTickets = event.ticket_types?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
                const soldTickets = event.ticket_types?.reduce((sum, ticket) => sum + ticket.sold, 0) || 0;
                const salesPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/event/${event.id}`)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-500">{event.location}</p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(event.date), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {soldTickets}/{totalTickets} tickets sold
                      </div>
                      <div className="text-xs text-gray-500">
                        {salesPercentage.toFixed(1)}% sold
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
