
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateTicketRequest {
  qrCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { qrCode }: ValidateTicketRequest = await req.json();

    if (!qrCode) {
      return new Response(
        JSON.stringify({ error: 'QR code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Validating ticket with QR code:', qrCode);

    // Find the ticket by QR code
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        orders(*),
        ticket_types(
          name,
          events(
            title,
            date,
            location
          )
        )
      `)
      .eq('qr_code', qrCode)
      .single();

    if (ticketError || !ticket) {
      console.log('Ticket not found:', ticketError);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid ticket - not found' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if ticket is already used
    if (ticket.is_used) {
      console.log('Ticket already used:', ticket.ticket_number);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Ticket already used',
          usedAt: ticket.used_at,
          ticketInfo: {
            ticketNumber: ticket.ticket_number,
            eventTitle: ticket.ticket_types.events.title,
            ticketType: ticket.ticket_types.name
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark ticket as used
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        is_used: true,
        used_at: new Date().toISOString()
      })
      .eq('id', ticket.id);

    if (updateError) {
      console.error('Error updating ticket:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate ticket' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Ticket validated successfully:', ticket.ticket_number);

    return new Response(
      JSON.stringify({
        valid: true,
        message: 'Ticket validated successfully',
        ticketInfo: {
          ticketNumber: ticket.ticket_number,
          eventTitle: ticket.ticket_types.events.title,
          eventDate: ticket.ticket_types.events.date,
          eventLocation: ticket.ticket_types.events.location,
          ticketType: ticket.ticket_types.name,
          validatedAt: new Date().toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-ticket function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
