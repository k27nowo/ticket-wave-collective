
import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Clock, Ticket, Shield } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Event } from "@/types/event";
import { sanitizeInput } from "@/utils/security";
import { createOrderInDatabase, verifyTicketPasswordInDatabase } from "@/services/eventService";
import { toast } from "sonner";
import PasswordProtectedTicket from "./PasswordProtectedTicket";

interface PublicEventPageProps {
  event: Event;
}

const PublicEventPage = ({ event }: PublicEventPageProps) => {
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [unlockedTickets, setUnlockedTickets] = useState<{ [key: string]: boolean }>({});
  const [purchasing, setPurchasing] = useState(false);

  const totalTickets = event.ticket_types?.reduce((sum, ticket) => sum + ticket.quantity, 0) || 0;
  const soldTickets = event.ticket_types?.reduce((sum, ticket) => sum + ticket.sold, 0) || 0;
  const soldPercentage = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleTicketQuantityChange = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }));
  };

  const handleTicketUnlock = async (ticketId: string, password: string) => {
    try {
      const isValid = await verifyTicketPasswordInDatabase(ticketId, password);
      if (isValid) {
        setUnlockedTickets(prev => ({
          ...prev,
          [ticketId]: true
        }));
        toast.success('Ticket unlocked successfully!');
        return true;
      } else {
        toast.error('Invalid password');
        return false;
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      toast.error('Error verifying password');
      return false;
    }
  };

  const getTotalCost = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = event.ticket_types?.find(t => t.id === ticketId);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const getTotalSelectedTickets = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  };

  const handlePurchase = async () => {
    const totalSelected = getTotalSelectedTickets();
    if (totalSelected === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    setPurchasing(true);

    try {
      const orderItems = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketId, quantity]) => {
          const ticket = event.ticket_types?.find(t => t.id === ticketId);
          return {
            ticketTypeId: ticketId,
            quantity,
            pricePerTicket: ticket?.price || 0
          };
        });

      const orderId = await createOrderInDatabase({
        eventId: event.id,
        totalAmount: getTotalCost(),
        items: orderItems
      });

      toast.success(`Purchase successful! Order ID: ${orderId.slice(0, 8)}...`);
      
      // Reset selections
      setSelectedTickets({});
      
      // Refresh the page to show updated sold counts
      window.location.reload();
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  // Sanitize display data
  const safeTitle = sanitizeInput.text(event.title);
  const safeDescription = sanitizeInput.text(event.description || '');
  const safeLocation = sanitizeInput.text(event.location);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">TicketHub</h1>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="mb-8">
          {event.image_url && (
            <div className="relative h-64 md:h-80 mb-6 rounded-xl overflow-hidden">
              <img 
                src={event.image_url} 
                alt={safeTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop";
                }}
              />
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {safeTitle}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3 text-purple-500" />
              <div>
                <div className="font-medium">{formatDate(event.date)}</div>
                <div className="text-sm">{formatTime(event.date)}</div>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3 text-purple-500" />
              <div className="font-medium">{safeLocation}</div>
            </div>

            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3 text-purple-500" />
              <div>
                <div className="font-medium">{soldTickets}/{totalTickets} sold</div>
                <Progress value={soldPercentage} className="h-2 mt-1" />
              </div>
            </div>
          </div>

          {safeDescription && (
            <p className="text-gray-700 text-lg leading-relaxed">
              {safeDescription}
            </p>
          )}
        </div>

        {/* Ticket Selection */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="h-6 w-6 text-purple-600" />
              Select Tickets
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.ticket_types && event.ticket_types.length > 0 ? (
              <>
                {event.ticket_types.map((ticket) => {
                  const available = ticket.quantity - ticket.sold;
                  const selectedQuantity = selectedTickets[ticket.id] || 0;
                  const isUnlocked = !ticket.is_password_protected || unlockedTickets[ticket.id];
                  
                  // Convert ticket to the format expected by PasswordProtectedTicket
                  const ticketForComponent = {
                    name: ticket.name,
                    price: ticket.price,
                    quantity: ticket.quantity,
                    sold: ticket.sold,
                    description: ticket.description,
                    isPasswordProtected: ticket.is_password_protected,
                    password: ticket.password_hash || ""
                  };

                  return (
                    <PasswordProtectedTicket
                      key={ticket.id}
                      ticket={ticketForComponent}
                      onUnlock={(password) => handleTicketUnlock(ticket.id, password)}
                    >
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {sanitizeInput.text(ticket.name)}
                              {ticket.is_password_protected && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Protected
                                </Badge>
                              )}
                            </h3>
                            {ticket.description && (
                              <p className="text-gray-600 text-sm mt-1">
                                {sanitizeInput.text(ticket.description)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              ${ticket.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {available} available
                            </div>
                          </div>
                        </div>

                        {available > 0 && isUnlocked ? (
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTicketQuantityChange(ticket.id, selectedQuantity - 1)}
                              disabled={selectedQuantity <= 0}
                            >
                              -
                            </Button>
                            <span className="min-w-[2rem] text-center font-medium">
                              {selectedQuantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTicketQuantityChange(ticket.id, selectedQuantity + 1)}
                              disabled={selectedQuantity >= available}
                            >
                              +
                            </Button>
                            {selectedQuantity > 0 && (
                              <div className="ml-auto text-right">
                                <div className="font-medium">
                                  ${(ticket.price * selectedQuantity).toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : available === 0 ? (
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            Sold Out
                          </Badge>
                        ) : !isUnlocked ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            Password Required
                          </Badge>
                        ) : null}
                      </div>
                    </PasswordProtectedTicket>
                  );
                })}

                {getTotalSelectedTickets() > 0 && (
                  <div className="border-t pt-4 mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-lg font-semibold">
                          Total: {getTotalSelectedTickets()} tickets
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          ${getTotalCost().toFixed(2)}
                        </div>
                      </div>
                      <Button
                        onClick={handlePurchase}
                        disabled={purchasing}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Ticket className="h-4 w-4 mr-2" />
                        {purchasing ? "Processing..." : "Purchase Tickets"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tickets available for this event.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PublicEventPage;
