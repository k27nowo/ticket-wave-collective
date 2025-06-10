
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
  isPasswordProtected?: boolean;
  password?: string;
}

interface PasswordProtectedTicketProps {
  ticket: TicketType;
  onUnlock: () => void;
  children: React.ReactNode;
}

const PasswordProtectedTicket = ({ ticket, onUnlock, children }: PasswordProtectedTicketProps) => {
  const [enteredPassword, setEnteredPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(!ticket.isPasswordProtected);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === ticket.password) {
      setIsUnlocked(true);
      setError("");
      onUnlock();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  if (!ticket.isPasswordProtected || isUnlocked) {
    return <>{children}</>;
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-yellow-200">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Lock className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-800">Protected Ticket</h3>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge className="bg-purple-100 text-purple-700">{ticket.name}</Badge>
            <Badge className="bg-green-100 text-green-700">${ticket.price}</Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <Lock className="h-3 w-3 mr-1" />
              Password Required
            </Badge>
          </div>

          {ticket.description && (
            <p className="text-gray-600 text-sm mb-4">{ticket.description}</p>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm mx-auto">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password to access this ticket"
                value={enteredPassword}
                onChange={(e) => {
                  setEnteredPassword(e.target.value);
                  setError("");
                }}
                className={error ? "border-red-300 focus:border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={!enteredPassword}
            >
              <Lock className="h-4 w-4 mr-2" />
              Unlock Ticket
            </Button>
          </form>
          
          <p className="text-xs text-gray-500">
            This ticket type requires a password to purchase. Contact the event organizer if you need access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordProtectedTicket;
