
import { useParams } from "react-router-dom";
import TicketPurchase from "@/components/TicketPurchase";

const EventPage = () => {
  const { eventId } = useParams();
  
  // Mock event data - this would come from your database
  const event = {
    id: Number(eventId),
    title: "Summer Music Festival 2024",
    description: "Join us for an unforgettable night of music under the stars with amazing artists and great vibes!",
    date: "2024-07-15",
    time: "18:00",
    location: "Central Park, New York",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop",
    ticketTypes: [
      { 
        name: "Early Bird", 
        price: 45, 
        quantity: 100, 
        sold: 23,
        description: "Limited time offer - save 25% on regular price"
      },
      { 
        name: "Regular", 
        price: 60, 
        quantity: 200, 
        sold: 45,
        description: "Standard admission with full access to all areas"
      },
      { 
        name: "VIP", 
        price: 120, 
        quantity: 50, 
        sold: 12,
        description: "Premium experience with backstage access and complimentary drinks"
      },
      { 
        name: "Friends & Family", 
        price: 35, 
        quantity: 30, 
        sold: 8,
        description: "Special discount for friends and family members"
      }
    ]
  };

  return <TicketPurchase event={event} />;
};

export default EventPage;
