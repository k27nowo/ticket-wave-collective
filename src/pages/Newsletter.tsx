
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import NewsletterHeader from "@/components/newsletter/NewsletterHeader";
import TemplateManager from "@/components/newsletter/TemplateManager";
import NewsletterComposer from "@/components/newsletter/NewsletterComposer";
import CustomerSelector from "@/components/newsletter/CustomerSelector";
import CampaignStats from "@/components/newsletter/CampaignStats";
import { NewsletterTemplate, Customer, Event } from "@/types/newsletter";

// Mock data for events and previous customers
const mockEvents: Event[] = [
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

const mockCustomers: Customer[] = [
  { id: 1, email: "john@example.com", name: "John Doe", lastPurchase: "Summer Music Festival 2024", eventsAttended: 3, totalTickets: 5 },
  { id: 2, email: "jane@example.com", name: "Jane Smith", lastPurchase: "Tech Conference 2024", eventsAttended: 2, totalTickets: 3 },
  { id: 3, email: "mike@example.com", name: "Mike Johnson", lastPurchase: "Summer Music Festival 2024", eventsAttended: 4, totalTickets: 7 },
  { id: 4, email: "sarah@example.com", name: "Sarah Wilson", lastPurchase: "Tech Conference 2024", eventsAttended: 1, totalTickets: 2 },
];

const Newsletter = () => {
  const [newsletterTitle, setNewsletterTitle] = useState("Early Access Newsletter");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<number[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
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

  const handleSaveTemplate = (templateData: Omit<NewsletterTemplate, 'id'>) => {
    const newTemplate: NewsletterTemplate = {
      id: templates.length + 1,
      ...templateData
    };

    setTemplates([...templates, newTemplate]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <NewsletterHeader 
        title={newsletterTitle}
        onTitleChange={setNewsletterTitle}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Newsletter Composition */}
          <div className="lg:col-span-2 space-y-6">
            <TemplateManager
              templates={templates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              currentTitle={newsletterTitle}
              currentSubject={subject}
              currentMessage={message}
            />

            <NewsletterComposer
              events={mockEvents}
              selectedEvent={selectedEvent}
              onEventChange={setSelectedEvent}
              subject={subject}
              onSubjectChange={setSubject}
              message={message}
              onMessageChange={setMessage}
              selectedCustomersCount={selectedCustomers.length}
              isSending={isSending}
              onSend={handleSendNewsletter}
              onSaveAsTemplate={() => {/* This will be handled by TemplateManager */}}
            />
          </div>

          {/* Customer Selection */}
          <div className="space-y-6">
            <CustomerSelector
              customers={mockCustomers}
              selectedCustomers={selectedCustomers}
              sentEmails={sentEmails}
              onCustomerToggle={handleCustomerToggle}
              onSelectAll={handleSelectAll}
            />

            <CampaignStats
              totalCustomers={mockCustomers.length}
              selectedCustomersCount={selectedCustomers.length}
              sentEmailsCount={sentEmails.length}
              templatesCount={templates.length}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Newsletter;
