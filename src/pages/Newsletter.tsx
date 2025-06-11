import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Mail, Send, Users, Calendar, Eye, CheckCircle, Clock, Save, Edit3, Plus, Trash2, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  { id: 1, email: "john@example.com", name: "John Doe", lastPurchase: "Summer Music Festival 2024", eventsAttended: 3, totalTickets: 5 },
  { id: 2, email: "jane@example.com", name: "Jane Smith", lastPurchase: "Tech Conference 2024", eventsAttended: 2, totalTickets: 3 },
  { id: 3, email: "mike@example.com", name: "Mike Johnson", lastPurchase: "Summer Music Festival 2024", eventsAttended: 4, totalTickets: 7 },
  { id: 4, email: "sarah@example.com", name: "Sarah Wilson", lastPurchase: "Tech Conference 2024", eventsAttended: 1, totalTickets: 2 },
];

interface NewsletterTemplate {
  id: number;
  name: string;
  title: string;
  subject: string;
  message: string;
  rules: string[];
}

const Newsletter = () => {
  const [newsletterTitle, setNewsletterTitle] = useState("Early Access Newsletter");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<number[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(newsletterTitle);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<number | null>(null);
  
  // Template management state
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([
    {
      id: 1,
      name: "Early Access",
      title: "Early Access Newsletter",
      subject: "Early Access: {EVENT_NAME}",
      message: `Hi there!

We're excited to give you early access to our upcoming event: {EVENT_NAME}

As a valued customer, you get exclusive early bird pricing and first pick of tickets before they go public.

Use this special link to secure your tickets:
{EARLY_ACCESS_LINK}

Don't wait - early access is limited!

Best regards,
The TicketHub Team`,
      rules: ["Previous customers"]
    }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateRules, setNewTemplateRules] = useState<string[]>(["Previous customers"]);
  
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

  const handleTitleSave = () => {
    setNewsletterTitle(tempTitle);
    setIsEditingTitle(false);
    toast({
      title: "Title Updated",
      description: "Newsletter title has been saved.",
    });
  };

  const handleTitleCancel = () => {
    setTempTitle(newsletterTitle);
    setIsEditingTitle(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (template) {
      setNewsletterTitle(template.title);
      setSubject(template.subject);
      setMessage(template.message);
      setSelectedTemplate(templateId);
      
      // Auto-select customers based on template rules
      if (template.rules.includes("Previous customers")) {
        setSelectedCustomers(mockCustomers.map(c => c.id));
      }
      
      toast({
        title: "Template Applied",
        description: `Applied "${template.name}" template successfully.`,
      });
    }
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for your template.",
        variant: "destructive",
      });
      return;
    }

    const newTemplate: NewsletterTemplate = {
      id: templates.length + 1,
      name: newTemplateName,
      title: newsletterTitle,
      subject,
      message,
      rules: newTemplateRules
    };

    setTemplates([...templates, newTemplate]);
    setIsCreateTemplateOpen(false);
    setNewTemplateName("");
    setNewTemplateRules(["Previous customers"]);
    
    toast({
      title: "Template Saved",
      description: `Template "${newTemplateName}" has been saved successfully.`,
    });
  };

  const handleDeleteTemplate = (templateId: number) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast({
      title: "Template Deleted",
      description: "Template has been removed.",
    });
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
      setSelectedTemplate("");
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

  // Replace placeholders in templates
  const processedSubject = subject
    .replace("{EVENT_NAME}", selectedEventData?.title || "[Event Name]");
  
  const processedMessage = message
    .replace("{EVENT_NAME}", selectedEventData?.title || "[Event Name]")
    .replace("{EARLY_ACCESS_LINK}", generateEarlyAccessLink());

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-purple-600" />
              <div className="flex items-center space-x-2">
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      className="text-xl font-bold bg-white border-purple-300 focus:border-purple-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSave();
                        if (e.key === 'Escape') handleTitleCancel();
                      }}
                    />
                    <Button size="sm" onClick={handleTitleSave}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleTitleCancel}>
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-gray-900">{newsletterTitle}</h1>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingTitle(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Newsletter Composition */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selection */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Newsletter Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{template.name}</span>
                            <div className="flex items-center gap-1 ml-2">
                              {template.rules.map((rule, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {rule}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Template List */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Saved Templates</Label>
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {template.rules.map((rule, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {rule}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTemplateSelect(template.id.toString())}
                          >
                            Use
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Compose Newsletter
                  </div>
                  <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600">
                        <Plus className="h-4 w-4 mr-1" />
                        Save as Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Newsletter Template</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="template-name">Template Name</Label>
                          <Input
                            id="template-name"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="e.g., Early Access, Event Reminder"
                          />
                        </div>
                        <div>
                          <Label>Auto-apply to customers</Label>
                          <div className="mt-2 space-y-2">
                            <Badge 
                              variant="secondary" 
                              className="mr-2 cursor-pointer"
                            >
                              Previous customers
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveAsTemplate}>
                            Save Template
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                  {processedSubject !== subject && (
                    <p className="text-xs text-gray-600">Preview: {processedSubject}</p>
                  )}
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
                  {processedMessage !== message && (
                    <div className="p-3 bg-gray-50 rounded border">
                      <p className="text-xs font-medium text-gray-700 mb-1">Message Preview:</p>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">{processedMessage}</p>
                    </div>
                  )}
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
                        className={`p-3 rounded-lg border transition-colors ${
                          isSelected 
                            ? "border-purple-200 bg-purple-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => handleCustomerToggle(customer.id)}
                          >
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{customer.name}</p>
                              {wasSent && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{customer.email}</p>
                            <p className="text-xs text-gray-500">Last: {customer.lastPurchase}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Dialog open={selectedCustomerDetails === customer.id} onOpenChange={(open) => setSelectedCustomerDetails(open ? customer.id : null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <Info className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Customer Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium">{customer.name}</h4>
                                    <p className="text-sm text-gray-600">{customer.email}</p>
                                  </div>
                                  <Separator />
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">Events Attended</p>
                                      <p className="text-2xl font-bold text-blue-600">{customer.eventsAttended}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Total Tickets</p>
                                      <p className="text-2xl font-bold text-purple-600">{customer.totalTickets}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Last Purchase</p>
                                    <p className="text-sm text-gray-600">{customer.lastPurchase}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Attendance Rate</p>
                                    <Badge variant="secondary">
                                      {((customer.eventsAttended / customer.totalTickets) * 100).toFixed(1)}%
                                    </Badge>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <div 
                              className={`w-4 h-4 border-2 rounded cursor-pointer ${
                                isSelected ? "bg-purple-600 border-purple-600" : "border-gray-300"
                              }`}
                              onClick={() => handleCustomerToggle(customer.id)}
                            >
                              {isSelected && (
                                <CheckCircle className="h-3 w-3 text-white" />
                              )}
                            </div>
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
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Templates Saved</span>
                  <Badge variant="outline">
                    {templates.length}
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
