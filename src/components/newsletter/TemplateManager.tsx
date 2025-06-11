
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { NewsletterTemplate } from "@/types/newsletter";
import { useToast } from "@/hooks/use-toast";

interface TemplateManagerProps {
  templates: NewsletterTemplate[];
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onSaveTemplate: (template: Omit<NewsletterTemplate, 'id'>) => void;
  onDeleteTemplate: (templateId: number) => void;
  currentTitle: string;
  currentSubject: string;
  currentMessage: string;
}

const TemplateManager = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onSaveTemplate,
  onDeleteTemplate,
  currentTitle,
  currentSubject,
  currentMessage
}: TemplateManagerProps) => {
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateRules, setNewTemplateRules] = useState<string[]>(["Previous customers"]);
  const { toast } = useToast();

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for your template.",
        variant: "destructive",
      });
      return;
    }

    onSaveTemplate({
      name: newTemplateName,
      title: currentTitle,
      subject: currentSubject,
      message: currentMessage,
      rules: newTemplateRules
    });

    setIsCreateTemplateOpen(false);
    setNewTemplateName("");
    setNewTemplateRules(["Previous customers"]);
    
    toast({
      title: "Template Saved",
      description: `Template "${newTemplateName}" has been saved successfully.`,
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Newsletter Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={selectedTemplate} onValueChange={onTemplateSelect}>
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
                    onClick={() => onTemplateSelect(template.id.toString())}
                  >
                    Use
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 w-full">
              Save Current as Template
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
      </CardContent>
    </Card>
  );
};

export default TemplateManager;
