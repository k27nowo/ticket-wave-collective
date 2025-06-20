
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { createOrderInDatabase } from '@/services/orderService';
import { createEventInDatabase } from '@/services/eventDatabaseService';
import { useTickets } from '@/hooks/useTickets';
import { toast } from 'sonner';
import { Ticket, ShoppingCart, Plus, Mail } from 'lucide-react';

const TestingEnvironment = () => {
  const { user } = useAuth();
  const { tickets, refetch } = useTickets();
  const [testEvent, setTestEvent] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const createTestEvent = async () => {
    if (!user) {
      toast.error('Please log in to create test events');
      return;
    }

    setCreating(true);
    try {
      const eventData = {
        title: 'Test Event - ' + new Date().toLocaleString(),
        description: 'This is a test event for ticket validation',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        location: 'Test Venue',
        image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=400&fit=crop',
        ticketTypes: [
          {
            name: 'General Admission',
            price: 25,
            quantity: 100,
            description: 'Standard entry ticket'
          },
          {
            name: 'VIP',
            price: 75,
            quantity: 20,
            description: 'VIP access with perks'
          }
        ]
      };

      const newEvent = await createEventInDatabase(eventData, user.id);
      setTestEvent(newEvent);
      toast.success('Test event created successfully!');
    } catch (error) {
      console.error('Error creating test event:', error);
      toast.error('Failed to create test event');
    } finally {
      setCreating(false);
    }
  };

  const placeTestOrder = async (ticketTypeId: string, ticketTypeName: string, price: number) => {
    if (!testEvent || !user) {
      toast.error('Please create a test event first');
      return;
    }

    setOrdering(true);
    try {
      console.log('Starting test order process...');
      const orderData = {
        eventId: testEvent.id,
        userId: user.id,
        totalAmount: price * selectedQuantity,
        items: [
          {
            ticketTypeId,
            quantity: selectedQuantity,
            pricePerTicket: price
          }
        ],
        sendEmailTo: 'nowotny.konstantin@gmail.com' // Your email for testing
      };

      console.log('Order data prepared:', orderData);
      const orderId = await createOrderInDatabase(orderData);
      console.log(`Test order placed successfully! Order ID: ${orderId}`);
      
      // Show immediate feedback
      toast.success(`Order placed! Check console logs and your email: nowotny.konstantin@gmail.com`);
      
      // Refresh tickets to show the new ones
      setTimeout(() => {
        refetch();
      }, 2000); // Give more time for email processing
      
    } catch (error) {
      console.error('Error placing test order:', error);
      toast.error('Failed to place test order');
    } finally {
      setOrdering(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            Please log in to use the testing environment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Ticket Testing Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Email Notifications Enabled</span>
            </div>
            <p className="text-sm text-blue-700">
              Ticket PDFs with QR codes will be automatically sent to: <strong>nowotny.konstantin@gmail.com</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Check your browser console for detailed logs about the email sending process.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={createTestEvent}
              disabled={creating}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {creating ? 'Creating...' : 'Create Test Event'}
            </Button>
            
            {testEvent && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Test Event Ready
              </Badge>
            )}
          </div>

          {testEvent && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">{testEvent.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{testEvent.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-4 mb-4">
                  <Label htmlFor="quantity">Quantity:</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                </div>

                {testEvent.ticket_types?.map((ticketType: any) => (
                  <div key={ticketType.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div>
                      <div className="font-medium">{ticketType.name}</div>
                      <div className="text-sm text-gray-600">{ticketType.description}</div>
                      <div className="text-sm font-medium text-green-600">${ticketType.price}</div>
                    </div>
                    <Button
                      onClick={() => placeTestOrder(ticketType.id, ticketType.name, ticketType.price)}
                      disabled={ordering}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {ordering ? 'Ordering...' : `Order ${selectedQuantity}x`}
                      <Mail className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Generated Tickets ({tickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{ticket.ticket_number}</div>
                      <div className="text-sm text-gray-600">
                        {ticket.orders.events.title} - {ticket.ticket_types.name}
                      </div>
                      <div className="text-sm text-green-600">
                        ${ticket.ticket_types.price}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={ticket.is_used ? "destructive" : "default"}>
                        {ticket.is_used ? 'Used' : 'Valid'}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(ticket.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {tickets.length > 5 && (
                <div className="text-center text-sm text-gray-500">
                  ... and {tickets.length - 5} more tickets
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestingEnvironment;
