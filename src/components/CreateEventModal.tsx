
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Calendar, MapPin, Clock, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  description?: string;
  isPasswordProtected?: boolean;
  password?: string;
}

interface CreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: (event: any) => void;
}

const CreateEventModal = ({ open, onOpenChange, onEventCreated }: CreateEventModalProps) => {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop"
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: "Early Bird", price: 50, quantity: 100, description: "Limited time offer" },
    { name: "Regular", price: 75, quantity: 200, description: "Standard admission" }
  ]);

  const [newTicket, setNewTicket] = useState<TicketType>({
    name: "",
    price: 0,
    quantity: 0,
    description: "",
    isPasswordProtected: false,
    password: ""
  });

  const addTicketType = () => {
    if (newTicket.name && newTicket.price > 0 && newTicket.quantity > 0) {
      setTicketTypes([...ticketTypes, newTicket]);
      setNewTicket({ 
        name: "", 
        price: 0, 
        quantity: 0, 
        description: "", 
        isPasswordProtected: false, 
        password: "" 
      });
    }
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const updateTicketPassword = (index: number, field: keyof TicketType, value: any) => {
    const updatedTickets = ticketTypes.map((ticket, i) => 
      i === index ? { ...ticket, [field]: value } : ticket
    );
    setTicketTypes(updatedTickets);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventData.title && eventData.date && eventData.time && ticketTypes.length > 0) {
      onEventCreated({
        ...eventData,
        ticketTypes: ticketTypes.map(ticket => ({ ...ticket, sold: 0 }))
      });
      // Reset form
      setEventData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop"
      });
      setTicketTypes([
        { name: "Early Bird", price: 50, quantity: 100, description: "Limited time offer" },
        { name: "Regular", price: 75, quantity: 200, description: "Standard admission" }
      ]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create New Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) => setEventData({...eventData, title: e.target.value})}
                    placeholder="Summer Music Festival 2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image">Event Image URL</Label>
                  <Input
                    id="image"
                    value={eventData.image}
                    onChange={(e) => setEventData({...eventData, image: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => setEventData({...eventData, description: e.target.value})}
                  placeholder="Tell people about your event..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventData.date}
                    onChange={(e) => setEventData({...eventData, date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={eventData.time}
                    onChange={(e) => setEventData({...eventData, time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={eventData.location}
                    onChange={(e) => setEventData({...eventData, location: e.target.value})}
                    placeholder="Central Park, New York"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Types */}
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Ticket Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Ticket Types */}
              <div className="space-y-3">
                {ticketTypes.map((ticket, index) => (
                  <div key={index} className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-700">{ticket.name}</Badge>
                          <span className="font-semibold text-green-600">${ticket.price}</span>
                          <span className="text-sm text-gray-600">• {ticket.quantity} available</span>
                          {ticket.isPasswordProtected && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <Lock className="h-3 w-3 mr-1" />
                              Protected
                            </Badge>
                          )}
                        </div>
                        {ticket.description && (
                          <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTicketType(index)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Password Protection Controls */}
                    <div className="flex items-center space-x-4 pt-2 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`password-${index}`}
                          checked={ticket.isPasswordProtected || false}
                          onCheckedChange={(checked) => 
                            updateTicketPassword(index, 'isPasswordProtected', checked)
                          }
                        />
                        <Label htmlFor={`password-${index}`} className="text-sm">
                          Password Protected
                        </Label>
                      </div>
                      {ticket.isPasswordProtected && (
                        <Input
                          placeholder="Enter password"
                          value={ticket.password || ""}
                          onChange={(e) => updateTicketPassword(index, 'password', e.target.value)}
                          className="flex-1 max-w-xs"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Ticket Type */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Add New Ticket Type</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Ticket name"
                      value={newTicket.name}
                      onChange={(e) => setNewTicket({...newTicket, name: e.target.value})}
                    />
                    <Input
                      type="number"
                      placeholder="Price ($)"
                      value={newTicket.price || ""}
                      onChange={(e) => setNewTicket({...newTicket, price: Number(e.target.value)})}
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={newTicket.quantity || ""}
                      onChange={(e) => setNewTicket({...newTicket, quantity: Number(e.target.value)})}
                    />
                    <Button
                      type="button"
                      onClick={addTicketType}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  <Input
                    placeholder="Description (optional)"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  />
                  
                  {/* Password Protection for New Ticket */}
                  <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-ticket-password"
                        checked={newTicket.isPasswordProtected || false}
                        onCheckedChange={(checked) => 
                          setNewTicket({...newTicket, isPasswordProtected: checked as boolean})
                        }
                      />
                      <Label htmlFor="new-ticket-password" className="text-sm">
                        Password Protected
                      </Label>
                    </div>
                    {newTicket.isPasswordProtected && (
                      <Input
                        placeholder="Enter password"
                        value={newTicket.password || ""}
                        onChange={(e) => setNewTicket({...newTicket, password: e.target.value})}
                        className="flex-1 max-w-xs"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;
