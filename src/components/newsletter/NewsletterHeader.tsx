
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Edit3, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsletterHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
}

const NewsletterHeader = ({ title, onTitleChange }: NewsletterHeaderProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const { toast } = useToast();

  const handleTitleSave = () => {
    onTitleChange(tempTitle);
    setIsEditingTitle(false);
    toast({
      title: "Title Updated",
      description: "Newsletter title has been saved.",
    });
  };

  const handleTitleCancel = () => {
    setTempTitle(title);
    setIsEditingTitle(false);
  };

  return (
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
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
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
  );
};

export default NewsletterHeader;
