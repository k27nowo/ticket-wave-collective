
import { Calendar, Users } from "lucide-react";

export const TeamHeader = () => {
  return (
    <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">TicketHub</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-lg font-semibold text-gray-700">Team Management</span>
          </div>
        </div>
      </div>
    </header>
  );
};
