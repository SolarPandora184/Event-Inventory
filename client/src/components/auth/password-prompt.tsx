import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";

interface PasswordPromptProps {
  onAuthenticate: () => void;
}

export function PasswordPrompt({ onAuthenticate }: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "EventAdmin") {
      onAuthenticate();
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-aesa-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-text-primary">
            Admin Access Required
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Enter the admin password to access inventory management features
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-text-primary">
                Password
              </Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-admin-password"
                  className="pl-10 bg-input border-border text-text-primary placeholder:text-text-muted"
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-destructive" data-testid="password-error">
                  {error}
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-aesa-blue hover:bg-aesa-accent text-white"
              data-testid="button-authenticate"
            >
              <Shield className="mr-2 h-4 w-4" />
              Access Admin Panel
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted">
              Only authorized personnel should access admin features
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}