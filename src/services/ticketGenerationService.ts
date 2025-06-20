
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

export interface TicketData {
  id: string;
  ticketNumber: string;
  qrCode: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketTypeName: string;
  price: number;
  orderDate: string;
}

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const generateTicketPDF = async (ticketData: TicketData): Promise<Blob> => {
  const doc = new jsPDF();
  
  try {
    // Add title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('EVENT TICKET', 105, 30, { align: 'center' });
    
    // Add event details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(ticketData.eventTitle, 20, 60);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(ticketData.eventDate).toLocaleDateString()}`, 20, 75);
    doc.text(`Location: ${ticketData.eventLocation}`, 20, 85);
    doc.text(`Ticket Type: ${ticketData.ticketTypeName}`, 20, 95);
    doc.text(`Price: $${ticketData.price.toFixed(2)}`, 20, 105);
    
    // Add ticket info
    doc.setFontSize(10);
    doc.text(`Ticket #: ${ticketData.ticketNumber}`, 20, 125);
    doc.text(`Order Date: ${new Date(ticketData.orderDate).toLocaleDateString()}`, 20, 135);
    
    // Generate and add QR code
    const qrCodeDataUrl = await generateQRCode(ticketData.qrCode);
    doc.addImage(qrCodeDataUrl, 'PNG', 140, 60, 50, 50);
    
    // Add QR code label
    doc.setFontSize(8);
    doc.text('Scan for validation', 152, 120, { align: 'center' });
    
    // Add footer
    doc.setFontSize(8);
    doc.text('Present this ticket at the venue for entry', 105, 250, { align: 'center' });
    doc.text('This ticket is non-transferable', 105, 260, { align: 'center' });
    
    // Add border
    doc.rect(10, 10, 190, 270);
    
    return doc.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate ticket PDF');
  }
};

export const createTicketsForOrder = async (orderId: string): Promise<string[]> => {
  try {
    console.log('Creating tickets for order:', orderId);
    
    // Get order details with event and ticket types
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        events(*),
        order_items(
          *,
          ticket_types(*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      throw new Error('Failed to fetch order details');
    }

    const ticketIds: string[] = [];

    // Create individual tickets for each order item
    for (const item of orderData.order_items) {
      for (let i = 0; i < item.quantity; i++) {
        // Generate unique ticket number and QR code
        const { data: ticketNumberData } = await supabase.rpc('generate_ticket_number');
        const ticketNumber = ticketNumberData || `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const qrCodeData = `${ticketNumber}|${orderId}|${item.ticket_type_id}`;
        
        // Create ticket record
        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .insert({
            order_id: orderId,
            ticket_type_id: item.ticket_type_id,
            ticket_number: ticketNumber,
            qr_code: qrCodeData
          })
          .select()
          .single();

        if (ticketError || !ticket) {
          console.error('Error creating ticket:', ticketError);
          continue;
        }

        ticketIds.push(ticket.id);

        // Generate PDF for this ticket
        const ticketData: TicketData = {
          id: ticket.id,
          ticketNumber: ticketNumber,
          qrCode: qrCodeData,
          eventTitle: orderData.events.title,
          eventDate: orderData.events.date,
          eventLocation: orderData.events.location,
          ticketTypeName: item.ticket_types.name,
          price: item.price_per_ticket,
          orderDate: orderData.created_at
        };

        try {
          const pdfBlob = await generateTicketPDF(ticketData);
          console.log(`Generated PDF for ticket ${ticketNumber}, size: ${pdfBlob.size} bytes`);
          
          // In a real implementation, you would upload the PDF to storage
          // For now, we'll just log that it was generated
        } catch (pdfError) {
          console.error('Error generating PDF for ticket:', ticketNumber, pdfError);
        }
      }
    }

    return ticketIds;
  } catch (error) {
    console.error('Error creating tickets:', error);
    throw error;
  }
};
