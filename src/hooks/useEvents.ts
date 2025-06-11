
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Event, CreateEventData } from '@/types/event';
import { fetchEventsFromDatabase, verifyTicketPasswordInDatabase } from '@/services/eventService';
import { createMockEvent, validateEventData } from '@/utils/eventHelpers';

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
      console.log('Creating event with data:', eventData);

      // For now, we'll create a mock event since the database tables don't exist yet
      // In a real implementation, this would be:
      // const { data: newEvent, error: eventError } = await supabase
      //   .from('events')
      //   .insert({
      //     title: eventData.title.trim(),
      //     description: eventData.description?.trim() || '',
      //     date: eventDateTime.toISOString(),
      //     location: eventData.location.trim(),
      //     image_url: eventData.image_url || '',
      //     user_id: user.id
      //   })
      //   .select()
      //   .single();

      const newEvent = createMockEvent(eventData, user.id);

      console.log('Mock event created:', newEvent);
      toast.success('Event created successfully! (Note: This is mock data until database is set up)');
      
      // Add to local state
      setEvents(prevEvents => [newEvent, ...prevEvents]);
      
      return newEvent;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event: ' + error.message);
      throw error;
    }
  };

  const verifyTicketPassword = async (ticketTypeId: string, password: string) => {
    return await verifyTicketPasswordInDatabase(ticketTypeId, password);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    verifyTicketPassword,
    refetchEvents: fetchEvents
  };
};

// Re-export types for convenience
export type { Event, TicketType } from '@/types/event';
