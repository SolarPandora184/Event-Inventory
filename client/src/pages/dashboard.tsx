import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestForm } from "@/components/inventory/request-form";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { AdminPanel } from "@/components/inventory/admin-panel";
import { PendingRequests } from "@/components/inventory/pending-requests";
import { PasswordPrompt } from "@/components/auth/password-prompt";
import { Shield, Plus, Package, Settings, Clock } from "lucide-react";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("request");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
    setShowPasswordPrompt(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleCancelAuth = () => {
    setShowPasswordPrompt(false);
    setPendingTab(null);
  };

  const handleTabChange = (value: string) => {
    if (value !== "request" && !isAuthenticated) {
      // Show password prompt for protected tabs
      setPendingTab(value);
      setShowPasswordPrompt(true);
      return;
    }
    setActiveTab(value);
  };

  const isProtectedTab = (tab: string) => {
    return tab !== "request" && !isAuthenticated;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Password Prompt Overlay */}
      {showPasswordPrompt && (
        <PasswordPrompt onAuthenticate={handleAuthenticate} onCancel={handleCancelAuth} />
      )}

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-aesa-blue rounded-lg flex items-center justify-center">
                <Shield className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">AESA Squadron 72</h1>
                <p className="text-sm text-text-muted">Inventory Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-secondary px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-text-secondary">System Online</span>
              </div>
              {isAuthenticated && (
                <div className="flex items-center space-x-2 bg-aesa-blue/20 px-3 py-2 rounded-lg">
                  <Shield className="h-4 w-4 text-aesa-accent" />
                  <span className="text-sm text-aesa-accent">Admin Access</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6" data-testid="main-tabs">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger 
              value="request" 
              className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-aesa-accent"
              data-testid="tab-request"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Request Items</span>
              <span className="sm:hidden">Request</span>
            </TabsTrigger>
            <TabsTrigger 
              value="inventory" 
              className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-aesa-accent"
              data-testid="tab-inventory"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory Tracking</span>
              <span className="sm:hidden">Inventory</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-aesa-accent"
              data-testid="tab-admin"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Panel</span>
              <span className="sm:hidden">Admin</span>
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="flex items-center space-x-2 data-[state=active]:bg-background data-[state=active]:text-aesa-accent"
              data-testid="tab-pending"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pending Requests</span>
              <span className="sm:hidden">Pending</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request" data-testid="tab-content-request">
            <RequestForm />
          </TabsContent>

          <TabsContent value="inventory" data-testid="tab-content-inventory">
            <InventoryTable />
          </TabsContent>

          <TabsContent value="admin" data-testid="tab-content-admin">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="pending" data-testid="tab-content-pending">
            <PendingRequests />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
