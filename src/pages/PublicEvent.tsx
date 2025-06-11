
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Event } from "@/types/event";
import { getMockEvents } from "@/services/eventService";
import PublicEventPage from "@/components/PublicEventPage";
import NotFound from "./NotFound";

const PublicEvent = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        // In a real implementation, this would fetch from the database
        const events = getMockEvents();
        const foundEvent = events.find(e => e.id === eventId);
        setEvent(foundEvent || null);
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
