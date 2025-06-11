
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const PageNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pages = [
    { path: '/', label: 'Dashboard' },
    { path: '/payment-settings', label: 'Payment Settings' },
    { path: '/ticket-tracking', label: 'Ticket Tracking' },
    { path: '/newsletter', label: 'Newsletter' },
    { path: '/team', label: 'Team' },
    { path: '/settings', label: 'Settings' }
  ];

  const currentIndex = pages.findIndex(page => page.path === location.pathname);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < pages.length - 1;

  const goToPrevious = () => {
    if (canGoBack) {
      navigate(pages[currentIndex - 1].path);
    }
  };

  const goToNext = () => {
    if (canGoForward) {
      navigate(pages[currentIndex + 1].path);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPrevious}
        disabled={!canGoBack}
        className="h-8 w-8 p-0"
        title={canGoBack ? `Go to ${pages[currentIndex - 1].label}` : 'No previous page'}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={goToNext}
        disabled={!canGoForward}
        className="h-8 w-8 p-0"
        title={canGoForward ? `Go to ${pages[currentIndex + 1].label}` : 'No next page'}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PageNavigation;
