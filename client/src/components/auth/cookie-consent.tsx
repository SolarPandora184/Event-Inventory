import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Check, X } from "lucide-react";

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-text-primary flex items-center">
            <Cookie className="mr-2 h-5 w-5" />
            Remember Admin Access
          </CardTitle>
          <CardDescription className="text-text-secondary text-sm">
            Would you like us to remember your admin authentication for this session?
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onAccept}
              data-testid="button-accept-cookies"
              className="bg-aesa-blue hover:bg-aesa-accent text-white flex-1"
            >
              <Check className="mr-1 h-4 w-4" />
              Remember
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDecline}
              data-testid="button-decline-cookies"
              className="border-border text-text-secondary hover:text-text-primary flex-1"
            >
              <X className="mr-1 h-4 w-4" />
              Don't Save
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-2">
            This will only store your admin session locally on this device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}