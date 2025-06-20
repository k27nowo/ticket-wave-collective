
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Ticket {
  id: string;
  ticket_number: string;
  qr_code: string;
  is_used: boolean;
  used_at: string | null;
  pdf_url: string | null;
  created_at: string;
  orders: {
    id: string;
    total_amount: number;
    created_at: string;
    events: {
      title: string;
      date: string;
      location: string;
    };
  };
  ticket_types: {
    name: string;
    price: number;
  };
}

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTickets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching tickets for user:', user.id);

      const { data: ticketsData, error } = await supabase
        .from('tickets')
        .select(`
          *,
          orders!inner(
            id,
            total_amount,
            created_at,
            events(
              title,
              date,
              location
            )
          ),
          ticket_types(
            name,
            price
          )
        `)
        .eq('orders.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }

      console.log('Tickets data:', ticketsData);
      setTickets(ticketsData || []);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicketPDF = async (ticket: Ticket) => {
    try {
      // In a real implementation, you would fetch the PDF from storage
      // For now, we'll generate it on the fly
      const { generateTicketPDF } = await import('@/services/ticketGenerationService');
      
      const ticketData = {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        qrCode: ticket.qr_code,
        eventTitle: ticket.orders.events.title,
        eventDate: ticket.orders.events.date,
        eventLocation: ticket.orders.events.location,
        ticketTypeName: ticket.ticket_types.name,
        price: ticket.ticket_types.price,
        orderDate: ticket.orders.created_at
      };

      const pdfBlob = await generateTicketPDF(ticketData);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticket.ticket_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Ticket downloaded successfully!');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  return {
    tickets,
    loading,
    downloadTicketPDF,
    refetch: fetchTickets
  };
};
