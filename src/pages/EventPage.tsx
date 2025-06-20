
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import TicketPurchase from "@/components/TicketPurchase";
import NotFound from "./NotFound";

const EventPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching event for EventPage:', eventId);
        
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
          console.log('Event fetched successfully:', eventData);
          setEvent(eventData);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
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

  // Convert the database event to the format expected by TicketPurchase
  const eventForTicketPurchase = {
    id: Number(event.id), // TicketPurchase expects a number
    title: event.title,
    description: event.description || '',
    date: event.date.split('T')[0], // Extract just the date part
    time: event.date.split('T')[1]?.substring(0, 5) || '18:00', // Extract time part
    location: event.location,
    image: event.image_url || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
    ticketTypes: event.ticket_types?.map(ticket => ({
      name: ticket.name,
      price: ticket.price,
      quantity: ticket.quantity,
      sold: ticket.sold,
      description: ticket.description || ''
    })) || []
  };

  return <TicketPurchase event={eventForTicketPurchase} />;
};

export default EventPage;
