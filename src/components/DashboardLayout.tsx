
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header with trigger */}
          <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
