
import { useState } from "react";
import { Calendar, DollarSign, Users, Settings, Mail, TrendingUp, Home, FlaskConical } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "All Events", url: "/events", icon: Calendar },
  { title: "Payment Settings", url: "/payment-settings", icon: DollarSign },
  { title: "Ticket Tracking", url: "/ticket-tracking", icon: TrendingUp },
  { title: "Newsletter", url: "/newsletter", icon: Mail },
  { title: "Team", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Testing", url: "/testing", icon: FlaskConical },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-8 w-8 text-purple-600" />
          {state === "expanded" && (
            <h2 className="text-xl font-bold text-gray-900">Event Manager</h2>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {state === "expanded" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user && (
          <div className="space-y-2">
            {state === "expanded" && (
              <div className="text-sm text-gray-600 mb-2">
                {user.email}
              </div>
            )}
            <Button 
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
