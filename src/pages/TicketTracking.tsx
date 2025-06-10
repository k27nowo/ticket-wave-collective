
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Calendar, Download, Filter, Eye, UserCheck } from "lucide-react";

interface TicketPurchase {
  id: string;
  eventId: number;
  eventTitle: string;
  userName: string;
  userEmail: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  attended: boolean;
  paymentMethod: string;
}

interface AttendanceStats {
  userName: string;
  userEmail: string;
  totalTickets: number;
  eventsAttended: number;
  totalSpent: number;
  lastPurchase: string;
}

const TicketTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [viewMode, setViewMode] = useState<"purchases" | "attendance">("purchases");

  // Mock data - this would come from your database
  const mockPurchases: TicketPurchase[] = [
    {
      id: "1",
      eventId: 1,
      eventTitle: "Summer Music Festival 2024",
      userName: "John Doe",
      userEmail: "john@example.com",
      ticketType: "VIP",
      quantity: 2,
      totalPrice: 240,
      purchaseDate: "2024-06-01",
      attended: true,
      paymentMethod: "PayPal"
    },
    {
      id: "2",
      eventId: 1,
      eventTitle: "Summer Music Festival 2024",
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      ticketType: "Regular",
      quantity: 1,
      totalPrice: 45,
      purchaseDate: "2024-06-02",
      attended: true,
      paymentMethod: "Stripe"
    },
    {
      id: "3",
      eventId: 2,
      eventTitle: "Tech Conference 2024",
      userName: "John Doe",
      userEmail: "john@example.com",
      ticketType: "Standard",
      quantity: 1,
      totalPrice: 299,
      purchaseDate: "2024-06-03",
      attended: false,
      paymentMethod: "PayPal"
    },
    {
      id: "4",
      eventId: 1,
      eventTitle: "Summer Music Festival 2024",
      userName: "Mike Johnson",
      userEmail: "mike@example.com",
      ticketType: "Early Bird",
      quantity: 3,
      totalPrice: 105,
      purchaseDate: "2024-05-28",
      attended: true,
      paymentMethod: "Apple Pay"
    },
    {
      id: "5",
      eventId: 2,
      eventTitle: "Tech Conference 2024",
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      ticketType: "VIP",
      quantity: 1,
      totalPrice: 499,
      purchaseDate: "2024-06-04",
      attended: true,
      paymentMethod: "Stripe"
    }
  ];

  const events = [
    { id: 1, title: "Summer Music Festival 2024" },
    { id: 2, title: "Tech Conference 2024" }
  ];

  const filteredPurchases = mockPurchases.filter(purchase => {
    const matchesSearch = purchase.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === "all" || purchase.eventId.toString() === selectedEvent;
    
    return matchesSearch && matchesEvent;
  });

  const attendanceStats: AttendanceStats[] = mockPurchases.reduce((acc, purchase) => {
    const existingUser = acc.find(user => user.userEmail === purchase.userEmail);
    
    if (existingUser) {
      existingUser.totalTickets += purchase.quantity;
      existingUser.totalSpent += purchase.totalPrice;
      if (purchase.attended) {
        existingUser.eventsAttended += 1;
      }
      if (new Date(purchase.purchaseDate) > new Date(existingUser.lastPurchase)) {
        existingUser.lastPurchase = purchase.purchaseDate;
      }
    } else {
      acc.push({
        userName: purchase.userName,
        userEmail: purchase.userEmail,
        totalTickets: purchase.quantity,
        eventsAttended: purchase.attended ? 1 : 0,
        totalSpent: purchase.totalPrice,
        lastPurchase: purchase.purchaseDate
      });
    }
    
    return acc;
  }, [] as AttendanceStats[]);

  const filteredAttendanceStats = attendanceStats.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalRevenue = () => {
    return filteredPurchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
  };

  const getTotalTicketsSold = () => {
    return filteredPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  };

  const getAttendanceRate = () => {
    const attended = filteredPurchases.filter(p => p.attended).length;
    return filteredPurchases.length > 0 ? ((attended / filteredPurchases.length) * 100).toFixed(1) : "0";
  };

  const markAttendance = (purchaseId: string, attended: boolean) => {
    // This would update the attendance in your database
    console.log(`Marking purchase ${purchaseId} as ${attended ? 'attended' : 'not attended'}`);
  };

  const exportData = () => {
    // This would generate and download a CSV/Excel file
    console.log("Exporting ticket data...");
    alert("Export functionality would be implemented here!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Tracking</h1>
          <p className="text-gray-600">Monitor ticket purchases and attendance for your events</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalRevenue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From ticket sales</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalTicketsSold()}</div>
              <p className="text-xs text-muted-foreground">Total tickets</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <UserCheck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAttendanceRate()}%</div>
              <p className="text-xs text-muted-foreground">Attended events</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
              <Eye className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.length}</div>
              <p className="text-xs text-muted-foreground">Different users</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by user name, email, or event..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "purchases" ? "default" : "outline"}
                  onClick={() => setViewMode("purchases")}
                  size="sm"
                >
                  Purchases
                </Button>
                <Button
                  variant={viewMode === "attendance" ? "default" : "outline"}
                  onClick={() => setViewMode("attendance")}
                  size="sm"
                >
                  Attendance Stats
                </Button>
                <Button onClick={exportData} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              {viewMode === "purchases" ? "Ticket Purchases" : "User Attendance Statistics"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "purchases" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{purchase.userName}</p>
                          <p className="text-sm text-gray-500">{purchase.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{purchase.eventTitle}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{purchase.ticketType}</Badge>
                      </TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell>${purchase.totalPrice}</TableCell>
                      <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{purchase.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={purchase.attended ? "default" : "destructive"}>
                          {purchase.attended ? "Attended" : "No Show"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAttendance(purchase.id, !purchase.attended)}
                        >
                          Mark as {purchase.attended ? "Absent" : "Present"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Tickets</TableHead>
                    <TableHead>Events Attended</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Last Purchase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendanceStats.map((user) => (
                    <TableRow key={user.userEmail}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.userName}</p>
                          <p className="text-sm text-gray-500">{user.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.totalTickets}</TableCell>
                      <TableCell>{user.eventsAttended}</TableCell>
                      <TableCell>${user.totalSpent}</TableCell>
                      <TableCell>
                        <Badge variant={user.eventsAttended > 0 ? "default" : "destructive"}>
                          {user.totalTickets > 0 ? ((user.eventsAttended / user.totalTickets) * 100).toFixed(1) : "0"}%
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.lastPurchase).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketTracking;
