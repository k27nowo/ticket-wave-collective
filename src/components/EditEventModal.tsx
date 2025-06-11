
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, Clock, Plus, Trash2 } from "lucide-react";
import { Event, TicketType } from "@/types/event";
import { toast } from "sonner";
import { sanitizeInput } from "@/utils/security";

interface EditEventModalProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventUpdated: (updatedEvent: Event) => void;
}

const EditEventModal = ({ event, open, onOpenChange, onEventUpdated }: EditEventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);

  useEffect(() => {
    if (event && open) {
      setTitle(event.title);
      setDescription(event.description || "");
      
      const eventDate = new Date(event.date);
      setDate(eventDate.toISOString().split('T')[0]);
      setTime(eventDate.toTimeString().slice(0, 5));
      
      setLocation(event.location);
      setImageUrl(event.image_url || "");
      setTicketTypes(event.ticket_types || []);
    }
  }, [event, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !location.trim() || !date || !time) {
      toast.error("Please fill in all required fields");
      return;
    }

    const eventDateTime = new Date(`${date}T${time}`);
    
    const updatedEvent: Event = {
      ...event,
      title: sanitizeInput.text(title.trim()),
      description: sanitizeInput.text(description.trim()),
      date: eventDateTime.toISOString(),
      location: sanitizeInput.text(location.trim()),
      image_url: imageUrl.trim(),
      ticket_types: ticketTypes,
      updated_at: new Date().toISOString()
    };

    onEventUpdated(updatedEvent);
    toast.success("Event updated successfully!");
    onOpenChange(false);
  };

  const addTicketType = () => {
    const newTicket: TicketType = {
      id: crypto.randomUUID(),
      event_id: event.id,
      name: "",
      price: 0,
      quantity: 0,
      sold: 0,
      description: "",
      is_password_protected: false,
      created_at: new Date().toISOString()
    };
    setTicketTypes([...ticketTypes, newTicket]);
  };

  const updateTicketType = (index: number, field: keyof TicketType, value: any) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Edit Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(sanitizeInput.text(e.target.value))}
                placeholder="Enter event title"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(sanitizeInput.text(e.target.value))}
                  placeholder="Enter event location"
                  className="pl-10"
                  maxLength={200}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(sanitizeInput.text(e.target.value))}
              placeholder="Describe your event..."
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Event Image URL</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ticket Types</Label>
              <Button type="button" onClick={addTicketType} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Ticket Type
              </Button>
            </div>

            {ticketTypes.map((ticket, index) => (
              <div key={ticket.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Ticket Type {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTicketType(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={ticket.name}
                      onChange={(e) => updateTicketType(index, 'name', sanitizeInput.text(e.target.value))}
                      placeholder="e.g., General Admission"
                      maxLength={50}
                      required
                    />
                  </div>
                  <div>
                    <Label>Price ($) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ticket.price}
                      onChange={(e) => updateTicketType(index, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={ticket.quantity}
                      onChange={(e) => updateTicketType(index, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={ticket.description || ''}
                    onChange={(e) => updateTicketType(index, 'description', sanitizeInput.text(e.target.value))}
                    placeholder="Optional description for this ticket type"
                    maxLength={200}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Update Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventModal;
