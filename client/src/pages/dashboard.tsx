import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RequestForm } from "@/components/inventory/request-form";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { MobileInventorySlider } from "@/components/inventory/mobile-inventory-slider";
import { AdminPanel } from "@/components/inventory/admin-panel";
import { PendingRequests } from "@/components/inventory/pending-requests";
import { PasswordPrompt } from "@/components/auth/password-prompt";
import { CookieConsent } from "@/components/auth/cookie-consent";
import { SurveyDialog } from "@/components/survey/survey-dialog";

import { useAuth, useEventName } from "@/hooks/use-auth";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Shield, Plus, Package, Settings, Clock, Smartphone, Monitor, ClipboardList } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("request");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [useMobileView, setUseMobileView] = useState(false);
  const [surveyEnabled, setSurveyEnabled] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(true);

  const { isAuthenticated, showCookieConsent, authenticate, acceptCookies, declineCookies } = useAuth();
  const { eventName } = useEventName();

  const handleAuthenticate = () => {
    authenticate();
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

  useEffect(() => {
    // Listen to survey settings
    const surveyRef = ref(database, "surveySettings/enabled");
    const unsubscribeSurvey = onValue(surveyRef, (snapshot) => {
      setSurveyEnabled(snapshot.val() || false);
    });

    // Listen to password requirement settings
    const passwordRef = ref(database, "settings/passwordRequired");
    const unsubscribePassword = onValue(passwordRef, (snapshot) => {
      setPasswordRequired(snapshot.val() ?? true);
    });

    return () => {
      unsubscribeSurvey();
      unsubscribePassword();
    };
  }, []);

  const handleTabChange = (value: string) => {
    if (value !== "request" && !isAuthenticated && passwordRequired) {
      // Show password prompt for protected tabs only if password is required
      setPendingTab(value);
      setShowPasswordPrompt(true);
      return;
    }
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Password Prompt Overlay */}
      {showPasswordPrompt && (
        <PasswordPrompt onAuthenticate={handleAuthenticate} onCancel={handleCancelAuth} />
      )}

      {/* Cookie Consent */}
      {showCookieConsent && (
        <CookieConsent onAccept={acceptCookies} onDecline={declineCookies} />
      )}

      {/* Survey Dialog */}
      <SurveyDialog isOpen={showSurvey} onClose={() => setShowSurvey(false)} />

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-aesa-blue rounded-lg flex items-center justify-center">
                <Shield className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">{eventName}</h1>
                <p className="text-sm text-text-muted">Inventory Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {surveyEnabled && (
                <Button
                  onClick={() => setShowSurvey(true)}
                  data-testid="button-survey"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2"
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Please take this quick survey
                </Button>
              )}
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
            <div className="space-y-4">
              {useMobileView ? <MobileInventorySlider /> : <InventoryTable />}
              
              {/* View Toggle Switch */}
              <div className="flex items-center justify-center py-3 border-t border-border">
                <div className="flex items-center space-x-3 bg-secondary/30 px-4 py-2 rounded-lg">
                  <Monitor className="h-4 w-4 text-text-muted" />
                  <Label htmlFor="view-toggle" className="text-sm text-text-secondary cursor-pointer">
                    Desktop
                  </Label>
                  <Switch
                    id="view-toggle"
                    checked={useMobileView}
                    onCheckedChange={setUseMobileView}
                    data-testid="view-toggle-switch"
                  />
                  <Label htmlFor="view-toggle" className="text-sm text-text-secondary cursor-pointer">
                    Mobile
                  </Label>
                  <Smartphone className="h-4 w-4 text-text-muted" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="admin" data-testid="tab-content-admin">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="pending" data-testid="tab-content-pending">
            <PendingRequests />
          </TabsContent>
        </Tabs>
      </main>

      {/* Tech Support Footer - Subtle and unobtrusive */}
      <footer className="border-t border-border bg-card/30 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="text-center text-xs text-muted-foreground">
            <span className="opacity-70">
              Tech Support & Owner: C/CMSgt Kendrick Uhles • (661) 381-3184 • 
              <a 
                href="mailto:Kendrick.Uhles@CawgCap.org" 
                className="hover:text-aesa-accent transition-colors ml-1"
                data-testid="support-email"
              >
                Kendrick.Uhles@CawgCap.org
              </a>
            </span>
            <div className="mt-2 opacity-60">
              If you want to use this system for your own events, contact me at my email
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
