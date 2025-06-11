
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, Eye, Clock, Plus } from "lucide-react";
import { Event } from "@/types/newsletter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface NewsletterComposerProps {
  events: Event[];
  selectedEvent: string;
  onEventChange: (eventId: string) => void;
  subject: string;
  onSubjectChange: (subject: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  selectedCustomersCount: number;
  isSending: boolean;
  onSend: () => void;
  onSaveAsTemplate: () => void;
}

const NewsletterComposer = ({
  events,
  selectedEvent,
  onEventChange,
  subject,
  onSubjectChange,
  message,
  onMessageChange,
  selectedCustomersCount,
  isSending,
  onSend,
  onSaveAsTemplate
}: NewsletterComposerProps) => {
  const generateEarlyAccessLink = () => {
    if (!selectedEvent) return "";
    const event = events.find(e => e.id.toString() === selectedEvent);
    return `${window.location.origin}/event/${selectedEvent}?early_access=true&token=${btoa(event?.title || "")}`;
  };

  const selectedEventData = events.find(e => e.id.toString() === selectedEvent);

  const processedSubject = subject
    .replace("{EVENT_NAME}", selectedEventData?.title || "[Event Name]");
  
  const processedMessage = message
    .replace("{EVENT_NAME}", selectedEventData?.title || "[Event Name]")
    .replace("{EARLY_ACCESS_LINK}", generateEarlyAccessLink());

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Newsletter
          </div>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600" onClick={onSaveAsTemplate}>
            <Plus className="h-4 w-4 mr-1" />
            Save as Template
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Event for Early Access</label>
          <Select value={selectedEvent} onValueChange={onEventChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an event..." />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
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
            onChange={(e) => onSubjectChange(e.target.value)}
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
            onChange={(e) => onMessageChange(e.target.value)}
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
          onClick={onSend}
          disabled={isSending || !selectedEvent || !subject || !message || selectedCustomersCount === 0}
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
              Send to {selectedCustomersCount} Customer{selectedCustomersCount !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NewsletterComposer;
