
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Event } from "@/types/event";
import { supabase } from "@/integrations/supabase/client";
import PublicEventPage from "@/components/PublicEventPage";
import NotFound from "./NotFound";

const PublicEvent = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log('Fetching public event:', eventId);
        
        const { data: eventData, error } = await supabase
          .from('events')
          .select(`
            *,
            ticket_types(*)
          `)
          .eq('id', eventId)
          .single();

        if (error) {
          console.error('Error fetching event:', error);
          setEvent(null);
        } else {
          setEvent(eventData);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    } else {
      setLoading(false);
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return <NotFound />;
  }

  return <PublicEventPage event={event} />;
};

export default PublicEvent;
