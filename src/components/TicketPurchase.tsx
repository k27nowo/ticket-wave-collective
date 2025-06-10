
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Clock, Users, Minus, Plus, CreditCard, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PasswordProtectedTicket from "./PasswordProtectedTicket";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
  isPasswordProtected?: boolean;
  password?: string;
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

interface TicketPurchaseProps {
  event: Event;
}

const TicketPurchase = ({ event }: TicketPurchaseProps) => {
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [unlockedTickets, setUnlockedTickets] = useState<Record<string, boolean>>({});

  const updateTicketQuantity = (ticketName: string, quantity: number) => {
    if (quantity === 0) {
      const { [ticketName]: removed, ...rest } = selectedTickets;
      setSelectedTickets(rest);
    } else {
      setSelectedTickets({ ...selectedTickets, [ticketName]: quantity });
    }
  };

  const handleTicketUnlock = (ticketName: string) => {
    setUnlockedTickets({ ...unlockedTickets, [ticketName]: true });
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketName, quantity]) => {
      const ticket = event.ticketTypes.find(t => t.name === ticketName);
      return total + (ticket ? ticket.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handlePurchase = () => {
    // This would integrate with your payment processing
    console.log("Processing payment with:", paymentMethod);
    console.log("Selected tickets:", selectedTickets);
    console.log("Total amount:", getTotalPrice());
    
    // For now, show an alert - this would be replaced with actual payment processing
    alert(`Payment processing would be handled here!\nTotal: $${getTotalPrice()}\nMethod: ${paymentMethod.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <Card className="mb-8 overflow-hidden bg-white/90 backdrop-blur-sm">
          <div className="relative h-64 md:h-80">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-lg opacity-90">{event.description}</p>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3 text-purple-500" />
                <div>
                  <p className="font-medium">{formatDate(event.date)}</p>
                  <p className="text-sm">{event.time}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-purple-500" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-3 text-purple-500" />
                <div>
                  <p className="font-medium">Availability</p>
                  <p className="text-sm">
                    {event.ticketTypes.reduce((sum, t) => sum + (t.quantity - t.sold), 0)} tickets remaining
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Selection */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Tickets</h2>
            
            {event.ticketTypes.map((ticket) => {
              const available = ticket.quantity - ticket.sold;
              const selected = selectedTickets[ticket.name] || 0;
              const isUnlocked = !ticket.isPasswordProtected || unlockedTickets[ticket.name];
              
              return (
                <PasswordProtectedTicket
                  key={ticket.name}
                  ticket={ticket}
                  onUnlock={() => handleTicketUnlock(ticket.name)}
                >
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{ticket.name}</h3>
                            <Badge className="bg-green-100 text-green-700">
                              ${ticket.price}
                            </Badge>
                            <Badge variant="outline">
                              {available} left
                            </Badge>
                            {ticket.isPasswordProtected && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <Lock className="h-3 w-3 mr-1" />
                                Protected
                              </Badge>
                            )}
                          </div>
                          {ticket.description && (
                            <p className="text-gray-600 text-sm">{ticket.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateTicketQuantity(ticket.name, Math.max(0, selected - 1))}
                              disabled={selected === 0}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                              {selected}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateTicketQuantity(ticket.name, selected + 1)}
                              disabled={selected >= available}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </PasswordProtectedTicket>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(selectedTickets).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tickets selected</p>
                ) : (
                  <>
                    {Object.entries(selectedTickets).map(([ticketName, quantity]) => {
                      const ticket = event.ticketTypes.find(t => t.name === ticketName);
                      if (!ticket) return null;
                      
                      return (
                        <div key={ticketName} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{ticketName}</p>
                            <p className="text-sm text-gray-600">${ticket.price} × {quantity}</p>
                          </div>
                          <p className="font-semibold">${ticket.price * quantity}</p>
                        </div>
                      );
                    })}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total ({getTotalTickets()} tickets)</span>
                      <span>${getTotalPrice()}</span>
                    </div>
                  </>
                )}
                
                {getTotalPrice() > 0 && (
                  <>
                    <Separator />
                    
                    {/* Payment Method Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Payment Method</label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paypal">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              PayPal
                            </div>
                          </SelectItem>
                          <SelectItem value="stripe">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Credit/Debit Card (Stripe)
                            </div>
                          </SelectItem>
                          <SelectItem value="apple-pay">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Apple Pay
                            </div>
                          </SelectItem>
                          <SelectItem value="google-pay">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Google Pay
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      onClick={handlePurchase}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      size="lg"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Purchase Tickets
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Secure payment processing via {paymentMethod.toUpperCase()}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase;
