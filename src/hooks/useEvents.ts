
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Event, CreateEventData } from '@/types/event';
import { 
  fetchEventsFromDatabase, 
  verifyTicketPasswordInDatabase, 
  createEventInDatabase, 
  updateEventInDatabase 
} from '@/services/eventService';
import { validateEventData } from '@/utils/eventHelpers';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsData = await fetchEventsFromDatabase(user?.id);
      setEvents(eventsData);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: CreateEventData) => {
    if (!user) {
      toast.error('You must be logged in to create events');
      return;
    }

    // Validate event data
    const validationError = validateEventData(eventData);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const newEvent = await createEventInDatabase(eventData, user.id);
      console.log('Event created successfully:', newEvent);
      toast.success('Event created successfully!');
      
      // Add to local state
      setEvents(prevEvents => [newEvent, ...prevEvents]);
      
      return newEvent;
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<CreateEventData>) => {
    if (!user) {
      toast.error('You must be logged in to update events');
      return;
    }

    try {
      const updatedEvent = await updateEventInDatabase(eventId, eventData);
      console.log('Event updated successfully:', updatedEvent);
      toast.success('Event updated successfully!');
      
      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId ? updatedEvent : event
        )
      );
      
      return updatedEvent;
    } catch (error: any) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const verifyTicketPassword = async (ticketTypeId: string, password: string) => {
    return await verifyTicketPasswordInDatabase(ticketTypeId, password);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    verifyTicketPassword,
    refetchEvents: fetchEvents
  };
};

// Re-export types for convenience
export type { Event, TicketType } from '@/types/event';
