
import { CreateEventData, Event } from '@/types/event';
import { toast } from 'sonner';

export const createMockEvent = (eventData: CreateEventData, userId: string): Event => {
  const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
  
  const newEvent: Event = {
    id: crypto.randomUUID(),
    title: eventData.title.trim(),
    description: eventData.description?.trim() || '',
    date: eventDateTime.toISOString(),
    location: eventData.location.trim(),
    image_url: eventData.image_url || '',
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ticket_types: eventData.ticketTypes.map(ticket => ({
      id: crypto.randomUUID(),
      event_id: '', // Will be set after event creation
      name: ticket.name.trim(),
      price: ticket.price,
      quantity: ticket.quantity,
      sold: 0,
      description: ticket.description?.trim() || '',
      is_password_protected: ticket.isPasswordProtected || false,
      password_hash: ticket.password || '', // In real implementation, this would be hashed
      created_at: new Date().toISOString()
    }))
  };

  return newEvent;
};

export const validateEventData = (eventData: CreateEventData): string | null => {
  if (!eventData.title.trim()) {
    return 'Event title is required';
  }
  
  if (!eventData.location.trim()) {
    return 'Event location is required';
  }
  
  if (!eventData.date || !eventData.time) {
    return 'Event date and time are required';
  }
  
  if (eventData.ticketTypes.length === 0) {
    return 'At least one ticket type is required';
  }
  
  for (const ticket of eventData.ticketTypes) {
    if (!ticket.name.trim()) {
      return 'All ticket types must have a name';
    }
    if (ticket.price < 0) {
      return 'Ticket prices cannot be negative';
    }
    if (ticket.quantity <= 0) {
      return 'Ticket quantities must be greater than 0';
    }
  }
  
  return null;
};
