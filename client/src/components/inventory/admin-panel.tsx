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
import { Settings, Plus, Trash, AlertTriangle } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";

const adminSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  requested: z.number().min(1, "Requested quantity must be at least 1"),
  onHand: z.number().min(0, "On hand quantity cannot be negative").optional(),
  custodian: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  expendable: z.boolean(),
});

type AdminFormData = z.infer<typeof adminSchema>;

export function AdminPanel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      itemName: "",
      requested: 1,
      onHand: 0,
      custodian: "",
      location: "",
      email: "",
      phone: "",
      expendable: false,
    },
  });

  const onSubmit = async (data: AdminFormData) => {
    setIsSubmitting(true);
    try {
      const itemData: InventoryItem = {
        itemName: data.itemName,
        requested: data.requested,
        onHand: data.onHand || 0,
        received: 0,
        verified: false,
        returned: false,
        custodian: data.custodian || "",
        location: data.location || "",
        email: data.email || "",
        phone: data.phone || "",
        expendable: data.expendable,
        timestamp: Date.now(),
      };

      const newRef = push(ref(database, "inventory"));
      await set(newRef, itemData);

      toast({
        title: "Item Added",
        description: "Item has been added to inventory successfully.",
      });

      form.reset();
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetInventory = async () => {
    if (!confirm("⚠️ This will permanently delete all inventory items. Continue?")) {
      return;
    }

    setIsResetting(true);
    try {
      await remove(ref(database, "inventory"));
      toast({
        title: "Inventory Reset",
        description: "All inventory items have been deleted successfully.",
      });
    } catch (error) {
      console.error("Error resetting inventory:", error);
      toast({
        title: "Error",
        description: "Failed to reset inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border" data-testid="admin-panel-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
                <Settings className="mr-2 h-6 w-6" />
                Admin Panel
              </CardTitle>
              <CardDescription className="text-text-secondary mt-1">
                Add items manually and manage system settings
              </CardDescription>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg px-4 py-2">
              <span className="text-yellow-400 text-sm">
                <AlertTriangle className="inline mr-2 h-4 w-4" />
                Admin Access Required
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="admin-itemName" className="text-sm font-medium text-text-primary">
                  Item Name *
                </Label>
                <Input
                  id="admin-itemName"
                  data-testid="admin-input-item-name"
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
                <Label htmlFor="admin-requested" className="text-sm font-medium text-text-primary">
                  Requested Qty *
                </Label>
                <Input
                  id="admin-requested"
                  data-testid="admin-input-requested"
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
                <Label htmlFor="admin-onHand" className="text-sm font-medium text-text-primary">
                  On Hand Qty
                </Label>
                <Input
                  id="admin-onHand"
                  data-testid="admin-input-on-hand"
                  type="number"
                  min="0"
                  className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                  placeholder="Enter quantity"
                  {...form.register("onHand", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="admin-custodian" className="text-sm font-medium text-text-primary">
                  Custodian
                </Label>
                <Input
                  id="admin-custodian"
                  data-testid="admin-input-custodian"
                  className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                  placeholder="Enter custodian name"
                  {...form.register("custodian")}
                />
              </div>

              <div>
                <Label htmlFor="admin-location" className="text-sm font-medium text-text-primary">
                  Location
                </Label>
                <Input
                  id="admin-location"
                  data-testid="admin-input-location"
                  className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                  placeholder="Enter location"
                  {...form.register("location")}
                />
              </div>

              <div>
                <Label htmlFor="admin-email" className="text-sm font-medium text-text-primary">
                  Email
                </Label>
                <Input
                  id="admin-email"
                  data-testid="admin-input-email"
                  type="email"
                  className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                  placeholder="Enter email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="admin-phone" className="text-sm font-medium text-text-primary">
                  Phone
                </Label>
                <Input
                  id="admin-phone"
                  data-testid="admin-input-phone"
                  type="tel"
                  className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                  placeholder="Enter phone"
                  {...form.register("phone")}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-text-primary">Item Type</Label>
                <Select
                  onValueChange={(value) => form.setValue("expendable", value === "true")}
                  defaultValue="false"
                >
                  <SelectTrigger
                    data-testid="admin-select-expendable"
                    className="mt-2 bg-input border-border text-text-primary"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Non-Expendable</SelectItem>
                    <SelectItem value="true">Expendable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button
                type="button"
                variant="destructive"
                onClick={resetInventory}
                disabled={isResetting}
                data-testid="button-reset-inventory"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash className="mr-2 h-4 w-4" />
                ⚠️ Reset All Inventory
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-add-manual-item"
                className="bg-aesa-blue hover:bg-aesa-accent text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item Manually
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
