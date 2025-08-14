import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bell, AlertTriangle, CheckCircle, Info, Undo } from "lucide-react";

export function ToastDemo() {
  const { toast } = useToast();
  const [counter, setCounter] = useState(0);

  const showSuccessToast = () => {
    const newCounter = counter + 1;
    setCounter(newCounter);
    
    toast({
      title: "Success!",
      description: `Operation completed successfully (${newCounter})`,
      undoAction: () => {
        setCounter(counter);
        toast({
          title: "Undone",
          description: "Operation was undone successfully",
        });
      },
    });
  };

  const showErrorToast = () => {
    toast({
      title: "Error",
      description: "Something went wrong with your request",
      variant: "destructive",
    });
  };

  const showInfoToast = () => {
    toast({
      title: "Information",
      description: "This is an informational message",
    });
  };

  const showUndoToast = () => {
    const originalValue = Math.floor(Math.random() * 100);
    
    toast({
      title: "Value Changed",
      description: `Changed value to ${originalValue}`,
      undoAction: () => {
        toast({
          title: "Value Restored",
          description: "Previous value has been restored",
        });
      },
    });
  };

  const showMultipleToasts = () => {
    // This will test the 3-toast limit and auto-dismiss
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        toast({
          title: `Toast ${i}`,
          description: `This is toast number ${i}. Should auto-dismiss in 5 seconds.`,
          undoAction: () => {
            toast({
              title: "Undone",
              description: `Toast ${i} action was undone`,
            });
          },
        });
      }, i * 500);
    }
  };

  return (
    <Card className="bg-card border-border" data-testid="toast-demo-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
          <Bell className="mr-2 h-6 w-6" />
          Toast Demo
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Test the enhanced toast system with undo functionality, 3-toast limit, and 5-second auto-dismiss
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={showSuccessToast}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-success-toast"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Success Toast with Undo
          </Button>

          <Button
            onClick={showErrorToast}
            variant="destructive"
            data-testid="button-error-toast"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Error Toast
          </Button>

          <Button
            onClick={showInfoToast}
            variant="outline"
            data-testid="button-info-toast"
          >
            <Info className="mr-2 h-4 w-4" />
            Info Toast
          </Button>

          <Button
            onClick={showUndoToast}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-undo-toast"
          >
            <Undo className="mr-2 h-4 w-4" />
            Undo Toast
          </Button>

          <Button
            onClick={showMultipleToasts}
            variant="secondary"
            className="md:col-span-2"
            data-testid="button-multiple-toasts"
          >
            <Bell className="mr-2 h-4 w-4" />
            Test Multiple Toasts (5 toasts - max 3 shown)
          </Button>
        </div>

        <div className="mt-6 p-4 bg-secondary rounded-lg">
          <h4 className="font-semibold mb-2">Features Demonstrated:</h4>
          <ul className="text-sm text-text-secondary space-y-1">
            <li>• Maximum 3 toasts displayed at once</li>
            <li>• Auto-dismiss after 5 seconds</li>
            <li>• Undo functionality with custom actions</li>
            <li>• Oldest toasts removed when limit exceeded</li>
            <li>• Manual close option available</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}