
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getCurrentSoldCount } from './ticketService';
import { createTicketsForOrder } from './ticketGenerationService';

export const createOrderInDatabase = async (orderData: {
  eventId: string;
  userId?: string;
  totalAmount: number;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    pricePerTicket: number;
  }>;
  sendEmailTo?: string; // Add optional email parameter for testing
}): Promise<string> => {
  try {
    console.log('Creating order in database:', orderData);

    // Check overall ticket limit before creating order
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('overall_ticket_limit')
      .eq('id', orderData.eventId)
      .single();

    if (eventError) throw eventError;

    if (event.overall_ticket_limit) {
      // Calculate total tickets already sold for this event
      const { data: ticketTypes, error: ticketTypesError } = await supabase
        .from('ticket_types')
        .select('sold')
        .eq('event_id', orderData.eventId);

      if (ticketTypesError) throw ticketTypesError;

      const totalSold = ticketTypes.reduce((sum, ticket) => sum + ticket.sold, 0);
      const totalOrderQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0);

      if (totalSold + totalOrderQuantity > event.overall_ticket_limit) {
        throw new Error(`Order exceeds overall ticket limit. Only ${event.overall_ticket_limit - totalSold} tickets remaining.`);
      }
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        event_id: orderData.eventId,
        user_id: orderData.userId || null,
        total_amount: orderData.totalAmount,
        status: 'completed'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = orderData.items.map(item => ({
      order_id: order.id,
      ticket_type_id: item.ticketTypeId,
      quantity: item.quantity,
      price_per_ticket: item.pricePerTicket
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // Update sold count for each ticket type using direct SQL update
    for (const item of orderData.items) {
      const { error: updateError } = await supabase
        .from('ticket_types')
        .update({ 
          sold: await getCurrentSoldCount(item.ticketTypeId) + item.quantity 
        })
        .eq('id', item.ticketTypeId);

      if (updateError) {
        console.error('Error updating sold count:', updateError);
        throw updateError;
      }
    }

    // Generate tickets with PDFs and QR codes
    try {
      const ticketIds = await createTicketsForOrder(order.id);
      console.log(`Generated ${ticketIds.length} tickets for order ${order.id}`);
      
      // Send email if recipient email is provided (for testing environment)
      if (orderData.sendEmailTo) {
        console.log(`Sending ticket email to: ${orderData.sendEmailTo}`);
        
        try {
          const { data, error: emailError } = await supabase.functions.invoke('send-ticket-email', {
            body: {
              orderId: order.id,
              recipientEmail: orderData.sendEmailTo
            }
          });

          if (emailError) {
            console.error('Error sending ticket email:', emailError);
            toast.error('Order completed but failed to send email. Tickets are available in your account.');
          } else {
            console.log('Ticket email sent successfully:', data);
            toast.success(`Order completed! ${ticketIds.length} tickets generated and sent to ${orderData.sendEmailTo}`);
          }
        } catch (emailError) {
          console.error('Error invoking email function:', emailError);
          toast.error('Order completed but failed to send email. Tickets are available in your account.');
        }
      } else {
        toast.success(`Order completed! ${ticketIds.length} tickets generated.`);
      }
    } catch (ticketError) {
      console.error('Error generating tickets:', ticketError);
      toast.error('Order completed but ticket generation failed. Please contact support.');
    }

    return order.id;
  } catch (error: any) {
    console.error('Error creating order:', error);
    toast.error('Failed to process order: ' + error.message);
    throw error;
  }
};
