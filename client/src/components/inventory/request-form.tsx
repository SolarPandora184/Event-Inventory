import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { database } from "@/lib/firebase";
import { ref, push, set, remove } from "firebase/database";
import { Plus, X, Shield } from "lucide-react";
import type { RequestItem } from "@/types/inventory";

const requestSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  requested: z.number().min(1, "Quantity must be at least 1"),
  custodian: z.string().min(1, "Custodian is required"),
  location: z.string().min(1, "Location is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  expendable: z.boolean(),
});

type RequestFormData = z.infer<typeof requestSchema>;

export function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      itemName: "",
      requested: 1,
      custodian: "",
      location: "",
      email: "",
      phone: "",
      expendable: false,
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    setIsSubmitting(true);
    let requestRef: any = null;
    
    try {
      const requestData: RequestItem = {
        ...data,
        timestamp: Date.now(),
      };

      requestRef = push(ref(database, "requests"));
      await set(requestRef, requestData);

      toast({
        title: "Request Submitted",
        description: `Your request for ${data.itemName} has been submitted successfully.`,
        undoAction: async () => {
          try {
            await remove(requestRef);
            toast({
              title: "Request Cancelled",
              description: `Your request for ${data.itemName} has been cancelled.`,
            });
          } catch (error) {
            console.error("Error cancelling request:", error);
            toast({
              title: "Error",
              description: "Failed to cancel request.",
              variant: "destructive",
            });
          }
        },
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    form.reset();
  };

  return (
    <Card className="bg-card border-border" data-testid="request-form-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <Plus className="mr-2 h-6 w-6" />
              Request Items
            </CardTitle>
            <CardDescription className="text-text-secondary mt-1">
              Submit a new inventory request for review
            </CardDescription>
          </div>
          <div className="hidden sm:block bg-secondary px-4 py-2 rounded-lg">
            <span className="text-sm text-text-muted">All fields marked with * are required</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="itemName" className="text-sm font-medium text-text-primary">
                Item Name *
              </Label>
              <Input
                id="itemName"
                data-testid="input-item-name"
                className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                placeholder="Enter item name"
                {...form.register("itemName")}
              />
              {form.formState.errors.itemName && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.itemName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="requested" className="text-sm font-medium text-text-primary">
                Quantity Requested *
              </Label>
              <Input
                id="requested"
                data-testid="input-requested-quantity"
                type="number"
                min="1"
                className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                placeholder="Enter quantity"
                {...form.register("requested", { valueAsNumber: true })}
              />
              {form.formState.errors.requested && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.requested.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="custodian" className="text-sm font-medium text-text-primary">
                Custodian (Who Needs It) *
              </Label>
              <Input
                id="custodian"
                data-testid="input-custodian"
                className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                placeholder="Enter custodian name"
                {...form.register("custodian")}
              />
              {form.formState.errors.custodian && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.custodian.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium text-text-primary">
                Location *
              </Label>
              <Input
                id="location"
                data-testid="input-location"
                className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                placeholder="Enter location"
                {...form.register("location")}
              />
              {form.formState.errors.location && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-text-primary">
                Email Address *
              </Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                placeholder="Enter email address"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-text-primary">
                Phone Number
              </Label>
              <Input
                id="phone"
                data-testid="input-phone"
                type="tel"
                className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                placeholder="Enter phone number"
                {...form.register("phone")}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-text-primary">Item Type</Label>
            <Select
              onValueChange={(value) => form.setValue("expendable", value === "true")}
              defaultValue="false"
            >
              <SelectTrigger
                data-testid="select-expendable"
                className="mt-2 bg-input border-border text-text-primary"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Non-Expendable (Returnable)</SelectItem>
                <SelectItem value="true">Expendable (Consumable)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={clearForm}
              data-testid="button-clear-form"
              className="border-border text-text-secondary hover:text-text-primary hover:border-text-muted"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="button-submit-request"
              className="bg-aesa-blue hover:bg-aesa-accent text-white"
            >
              <Shield className="mr-2 h-4 w-4" />
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
