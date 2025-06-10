
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, Users, Calendar, Eye, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for events and previous customers
const mockEvents = [
  {
    id: 1,
    title: "Summer Music Festival 2024",
    date: "2024-07-15",
  },
  {
    id: 2,
    title: "Tech Conference 2024", 
    date: "2024-08-22",
  },
  {
    id: 3,
    title: "Art Gallery Opening",
    date: "2024-09-10",
  }
];

const mockCustomers = [
  { id: 1, email: "john@example.com", name: "John Doe", lastPurchase: "Summer Music Festival 2024" },
  { id: 2, email: "jane@example.com", name: "Jane Smith", lastPurchase: "Tech Conference 2024" },
  { id: 3, email: "mike@example.com", name: "Mike Johnson", lastPurchase: "Summer Music Festival 2024" },
  { id: 4, email: "sarah@example.com", name: "Sarah Wilson", lastPurchase: "Tech Conference 2024" },
];

const Newsletter = () => {
  const [selectedEvent, setSelectedEvent] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<number[]>([]);
  const { toast } = useToast();

  const handleCustomerToggle = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === mockCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(mockCustomers.map(c => c.id));
    }
  };

  const generateEarlyAccessLink = () => {
    if (!selectedEvent) return "";
    const event = mockEvents.find(e => e.id.toString() === selectedEvent);
    return `${window.location.origin}/event/${selectedEvent}?early_access=true&token=${btoa(event?.title || "")}`;
  };

  const handleSendNewsletter = async () => {
    if (!selectedEvent || !subject || !message || selectedCustomers.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one customer.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending emails
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSentEmails(selectedCustomers);
      
      toast({
        title: "Newsletter Sent!",
        description: `Successfully sent early access invitations to ${selectedCustomers.length} customers.`,
      });

      // Reset form
      setSelectedEvent("");
      setSubject("");
      setMessage("");
      setSelectedCustomers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectedEventData = mockEvents.find(e => e.id.toString() === selectedEvent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Newsletter Composition */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Compose Early Access Newsletter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Event for Early Access</label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{event.title}</span>
                            <Badge variant="outline" className="ml-2">
                              {new Date(event.date).toLocaleDateString()}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Early Access Link Preview */}
                {selectedEvent && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Early Access Link Preview</span>
                    </div>
                    <code className="text-xs text-blue-700 break-all">
                      {generateEarlyAccessLink()}
                    </code>
                  </div>
                )}

                {/* Subject Line */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Line</label>
                  <Input
                    placeholder={selectedEventData ? `Early Access: ${selectedEventData.title}` : "Enter email subject..."}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder={`Hi there!

We're excited to give you early access to our upcoming event: ${selectedEventData?.title || '[Event Name]'}

As a valued customer, you get exclusive early bird pricing and first pick of tickets before they go public.

Use this special link to secure your tickets:
${generateEarlyAccessLink()}

Don't wait - early access is limited!

Best regards,
The TicketHub Team`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={12}
                  />
                </div>

                {/* Send Button */}
                <Button 
                  onClick={handleSendNewsletter}
                  disabled={isSending || !selectedEvent || !subject || !message || selectedCustomers.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Sending Newsletter...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send to {selectedCustomers.length} Customer{selectedCustomers.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Customer Selection */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Previous Customers
                  </div>
                  <Badge variant="secondary">
                    {selectedCustomers.length}/{mockCustomers.length} selected
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Select All Button */}
                <Button 
                  variant="outline" 
                  onClick={handleSelectAll}
                  className="w-full"
                >
                  {selectedCustomers.length === mockCustomers.length ? "Deselect All" : "Select All"}
                </Button>

                <Separator />

                {/* Customer List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {mockCustomers.map((customer) => {
                    const isSelected = selectedCustomers.includes(customer.id);
                    const wasSent = sentEmails.includes(customer.id);
                    
                    return (
                      <div
                        key={customer.id}
                        onClick={() => handleCustomerToggle(customer.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected 
                            ? "border-purple-200 bg-purple-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{customer.name}</p>
                              {wasSent && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{customer.email}</p>
                            <p className="text-xs text-gray-500">Last: {customer.lastPurchase}</p>
                          </div>
                          <div className={`w-4 h-4 border-2 rounded ${
                            isSelected ? "bg-purple-600 border-purple-600" : "border-gray-300"
                          }`}>
                            {isSelected && (
                              <CheckCircle className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Campaign Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Customers</span>
                  <Badge variant="secondary">{mockCustomers.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selected</span>
                  <Badge className="bg-purple-100 text-purple-700">
                    {selectedCustomers.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Emails Sent</span>
                  <Badge className="bg-green-100 text-green-700">
                    {sentEmails.length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Newsletter;
