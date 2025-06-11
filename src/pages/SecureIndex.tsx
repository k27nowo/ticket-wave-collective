import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import PageNavigation from "@/components/PageNavigation";

const SecureIndex = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching events:", error);
        } else {
          setEvents(data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Event Dashboard</h1>
              <PageNavigation />
            </div>
            <div className="flex items-center space-x-4">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Events</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                All Events
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Manage and view all your events.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/event/new"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                Create Event
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Create a new event.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Finance</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/payment-settings"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                Payment Settings
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Configure payment methods.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/ticket-tracking"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                Ticket Tracking
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Track ticket sales and attendance.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Marketing</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/newsletter"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                Newsletter
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Manage and send newsletters to your audience.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Team</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/team"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                Team Management
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Manage your team members and their roles.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Settings</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/settings"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                Account Settings
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Manage your account settings.
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="bg-white/90 backdrop-blur-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center">Loading events...</div>
          ) : events.length > 0 ? (
            events.map(event => (
              <div key={event.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold text-gray-900">{event.name}</h2>
                <p className="text-gray-600">{event.description}</p>
                <Link to={`/event/${event.id}`} className="text-blue-600 hover:underline block mt-2">
                  View Event Details
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center">No events found.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SecureIndex;
