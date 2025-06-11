
import { Calendar, MapPin, Users, Ticket, Shield } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Event } from "@/hooks/useEvents";
import { sanitizeInput } from "@/utils/security";

interface SecureEventCardProps {
  event: Event;
}

const SecureEventCard = ({ event }: SecureEventCardProps) => {
  const totalTickets = event.ticket_types?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
  const soldTickets = event.ticket_types?.reduce((sum, ticket) => sum + ticket.sold, 0) || 0;
  const soldPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;
  const minPrice = event.ticket_types?.length 
    ? Math.min(...event.ticket_types.map(t => t.price))
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Sanitize display data
  const safeTitle = sanitizeInput.text(event.title);
  const safeDescription = sanitizeInput.text(event.description || '');
  const safeLocation = sanitizeInput.text(event.location);

  const hasPasswordProtectedTickets = event.ticket_types?.some(t => t.is_password_protected) || false;

  return (
    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop"} 
          alt={safeTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop";
          }}
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge className="bg-white/90 text-gray-800 hover:bg-white">
            From ${minPrice}
          </Badge>
          {hasPasswordProtectedTickets && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Shield className="h-3 w-3 mr-1" />
              Protected
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {safeTitle}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{safeDescription}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
            {formatDate(event.date)} at {formatTime(event.date)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-purple-500" />
            {safeLocation}
          </div>
        </div>

        {/* Ticket Sales Progress */}
        {totalTickets > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Tickets sold
              </span>
              <span className="font-medium">{soldTickets}/{totalTickets}</span>
            </div>
            <Progress value={soldPercentage} className="h-2" />
          </div>
        )}

        {/* Ticket Types Preview */}
        {event.ticket_types && event.ticket_types.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ticket Types</span>
              <Badge variant="outline" className="text-xs">
                {event.ticket_types.length} types
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {event.ticket_types.slice(0, 3).map((ticket) => (
                <Badge 
                  key={ticket.id} 
                  variant="secondary" 
                  className="text-xs bg-purple-100 text-purple-700"
                >
                  {sanitizeInput.text(ticket.name)}
                </Badge>
              ))}
              {event.ticket_types.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.ticket_types.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-purple-200 hover:bg-purple-50"
          >
            Edit Event
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Ticket className="h-4 w-4 mr-1" />
            View Tickets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureEventCard;
