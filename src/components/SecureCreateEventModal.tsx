import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Calendar, MapPin, Clock, Lock, Upload, X, Shield, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEvents } from "@/hooks/useEvents";
import { sanitizeInput, validateInput, rateLimiter } from "@/utils/security";
import { toast } from "sonner";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  description?: string;
  isPasswordProtected?: boolean;
  password?: string;
}

interface SecureCreateEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SecureCreateEventModal = ({ open, onOpenChange }: SecureCreateEventModalProps) => {
  const { createEvent } = useEvents();
  const [submitting, setSubmitting] = useState(false);
  
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop"
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");

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

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Validate title
    if (!validateInput.eventTitle(eventData.title)) {
      errors.push("Event title must be between 3 and 100 characters");
    }

    // Validate date
    if (!eventData.date || !eventData.time) {
      errors.push("Date and time are required");
    } else {
      const eventDateTime = `${eventData.date}T${eventData.time}`;
      if (!validateInput.eventDate(eventDateTime)) {
        errors.push("Event date must be in the future");
      }
    }

    // Validate location
    if (!eventData.location.trim()) {
      errors.push("Location is required");
    }

    // Validate ticket types
    if (ticketTypes.length === 0) {
      errors.push("At least one ticket type is required");
    }

    for (const ticket of ticketTypes) {
      if (!validateInput.price(ticket.price)) {
        errors.push(`Invalid price for ticket "${ticket.name}"`);
      }
      if (!validateInput.quantity(ticket.quantity)) {
        errors.push(`Invalid quantity for ticket "${ticket.name}"`);
      }
      if (ticket.isPasswordProtected && (!ticket.password || ticket.password.length < 4)) {
        errors.push(`Password for "${ticket.name}" must be at least 4 characters`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are allowed");
        return;
      }

      setBannerFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBannerPreview(result);
        setEventData({...eventData, image: result});
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview("");
    setEventData({...eventData, image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop"});
  };

  const addTicketType = () => {
    if (!newTicket.name.trim()) {
      toast.error("Ticket name is required");
      return;
    }

    if (!validateInput.price(newTicket.price)) {
      toast.error("Invalid ticket price");
      return;
    }

    if (!validateInput.quantity(newTicket.quantity)) {
      toast.error("Invalid ticket quantity");
      return;
    }

    const sanitizedTicket: TicketType = {
      name: sanitizeInput.text(newTicket.name),
      price: newTicket.price,
      quantity: newTicket.quantity,
      description: newTicket.description ? sanitizeInput.text(newTicket.description) : undefined,
      isPasswordProtected: newTicket.isPasswordProtected,
      password: newTicket.password
    };

    setTicketTypes([...ticketTypes, sanitizedTicket]);
    setNewTicket({ 
      name: "", 
      price: 0, 
      quantity: 0, 
      description: "", 
      isPasswordProtected: false, 
      password: "" 
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!rateLimiter.isAllowed('create-event', 3, 60000)) {
      toast.error("Too many attempts. Please wait a minute before trying again.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setSubmitting(true);

    try {
      // Sanitize all inputs
      const sanitizedEventData = {
        title: sanitizeInput.text(eventData.title),
        description: sanitizeInput.text(eventData.description),
        date: eventData.date,
        time: eventData.time,
        location: sanitizeInput.text(eventData.location),
        image_url: eventData.image,
        ticketTypes: ticketTypes.map(ticket => ({
          name: sanitizeInput.text(ticket.name),
          price: ticket.price,
          quantity: ticket.quantity,
          description: ticket.description ? sanitizeInput.text(ticket.description) : undefined,
          isPasswordProtected: ticket.isPasswordProtected,
          password: ticket.password
        }))
      };

      await createEvent(sanitizedEventData);
      
      // Reset form
      setEventData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop"
      });
      setBannerFile(null);
      setBannerPreview("");
      setTicketTypes([
        { name: "Early Bird", price: 50, quantity: 100, description: "Limited time offer" },
        { name: "Regular", price: 75, quantity: 200, description: "Standard admission" }
      ]);
      setValidationErrors([]);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center">
            <Shield className="h-6 w-6 mr-2 text-purple-600" />
            Create Secure Event
          </DialogTitle>
        </DialogHeader>

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) => setEventData({...eventData, title: e.target.value})}
                    placeholder="Summer Music Festival 2024"
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="banner">Upload Event Banner</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="banner"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('banner')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Image
                      </Button>
                      {bannerFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeBanner}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {bannerPreview && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                        <img 
                          src={bannerPreview} 
                          alt="Banner preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
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
                  maxLength={1000}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventData.date}
                    onChange={(e) => setEventData({...eventData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Time *
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
                    Location *
                  </Label>
                  <Input
                    id="location"
                    value={eventData.location}
                    onChange={(e) => setEventData({...eventData, location: e.target.value})}
                    placeholder="Central Park, New York"
                    maxLength={200}
                    required
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
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {submitting ? "Creating..." : "Create Secure Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SecureCreateEventModal;
