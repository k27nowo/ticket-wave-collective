
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import jsPDF from "npm:jspdf@2.5.1";
import QRCode from "npm:qrcode@1.5.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  orderId: string;
  recipientEmail: string;
}

const generateQRCode = async (data: string): Promise<string> => {
  return await QRCode.toDataURL(data, {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
};

const generateTicketPDF = async (ticketData: any): Promise<Uint8Array> => {
  const doc = new jsPDF();
  
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
  
  return doc.output('arraybuffer');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, recipientEmail }: TicketEmailRequest = await req.json();
    
    console.log(`Processing ticket email for order: ${orderId}`);

    // Get order details with tickets
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        events(*),
        tickets(
          *,
          ticket_types(*)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !orderData) {
      throw new Error('Failed to fetch order details');
    }

    console.log(`Found ${orderData.tickets.length} tickets for order`);

    // Generate PDFs for all tickets
    const ticketAttachments = [];
    
    for (const ticket of orderData.tickets) {
      const ticketData = {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        qrCode: ticket.qr_code,
        eventTitle: orderData.events.title,
        eventDate: orderData.events.date,
        eventLocation: orderData.events.location,
        ticketTypeName: ticket.ticket_types.name,
        price: ticket.ticket_types.price,
        orderDate: orderData.created_at
      };

      const pdfBuffer = await generateTicketPDF(ticketData);
      
      ticketAttachments.push({
        filename: `ticket-${ticket.ticket_number}.pdf`,
        content: Array.from(new Uint8Array(pdfBuffer)),
        type: 'application/pdf',
        disposition: 'attachment'
      });
    }

    // Send email with ticket attachments
    const emailResponse = await resend.emails.send({
      from: "Event Tickets <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Your tickets for ${orderData.events.title}`,
      html: `
        <h1>Your Event Tickets</h1>
        <p>Thank you for your purchase! Please find your tickets attached to this email.</p>
        
        <h2>Event Details:</h2>
        <ul>
          <li><strong>Event:</strong> ${orderData.events.title}</li>
          <li><strong>Date:</strong> ${new Date(orderData.events.date).toLocaleDateString()}</li>
          <li><strong>Location:</strong> ${orderData.events.location}</li>
          <li><strong>Total Amount:</strong> $${orderData.total_amount}</li>
        </ul>
        
        <p>Please present your tickets at the venue for entry. Each ticket contains a unique QR code for validation.</p>
        
        <p>See you at the event!</p>
      `,
      attachments: ticketAttachments
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
