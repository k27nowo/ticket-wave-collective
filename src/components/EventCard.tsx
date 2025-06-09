
import { Calendar, MapPin, Users, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  sold: number;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  ticketTypes: TicketType[];
}

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const totalTickets = event.ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const soldTickets = event.ticketTypes.reduce((sum, ticket) => sum + ticket.sold, 0);
  const soldPercentage = (soldTickets / totalTickets) * 100;
  const minPrice = Math.min(...event.ticketTypes.map(t => t.price));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/90 text-gray-800 hover:bg-white">
            From ${minPrice}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
            {formatDate(event.date)} at {event.time}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-purple-500" />
            {event.location}
          </div>
        </div>

        {/* Ticket Sales Progress */}
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

        {/* Ticket Types Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ticket Types</span>
            <Badge variant="outline" className="text-xs">
              {event.ticketTypes.length} types
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {event.ticketTypes.slice(0, 3).map((ticket) => (
              <Badge 
                key={ticket.name} 
                variant="secondary" 
                className="text-xs bg-purple-100 text-purple-700"
              >
                {ticket.name}
              </Badge>
            ))}
            {event.ticketTypes.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{event.ticketTypes.length - 3} more
              </Badge>
            )}
          </div>
        </div>

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

export default EventCard;
