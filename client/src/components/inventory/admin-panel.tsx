import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useEventName } from "@/hooks/use-auth";
import { database } from "@/lib/firebase";
import { ref, push, set, remove, get } from "firebase/database";
import { Settings, Plus, Trash, AlertTriangle, Save, Calendar } from "lucide-react";
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
  const [tempEventName, setTempEventName] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");
  const { toast } = useToast();
  const { eventName, updateEventName } = useEventName();

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
    let itemRef: any = null;
    
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

      itemRef = push(ref(database, "inventory"));
      await set(itemRef, itemData);

      toast({
        title: "Item Added",
        description: `${data.itemName} has been added to inventory successfully.`,
        undoAction: async () => {
          try {
            await remove(itemRef);
            toast({
              title: "Item Removed",
              description: `${data.itemName} has been removed from inventory.`,
            });
          } catch (error) {
            console.error("Error removing item:", error);
            toast({
              title: "Error",
              description: "Failed to undo item addition.",
              variant: "destructive",
            });
          }
        },
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
    setIsResetting(true);
    let backupData: any = null;
    
    try {
      // Create a backup before deletion
      const snapshot = await get(ref(database, "inventory"));
      backupData = snapshot.val();
      
      await remove(ref(database, "inventory"));
      
      toast({
        title: "Inventory Reset",
        description: "All inventory items have been deleted successfully.",
        undoAction: async () => {
          try {
            if (backupData) {
              await set(ref(database, "inventory"), backupData);
              toast({
                title: "Inventory Restored",
                description: "All inventory items have been restored successfully.",
              });
            }
          } catch (error) {
            console.error("Error restoring inventory:", error);
            toast({
              title: "Error",
              description: "Failed to restore inventory.",
              variant: "destructive",
            });
          }
        },
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
      setShowPasswordDialog(false);
      setEnteredPassword("");
    }
  };

  const handlePasswordSubmit = () => {
    if (enteredPassword === "Ku2023!@") {
      resetInventory();
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect master password.",
        variant: "destructive",
      });
      setEnteredPassword("");
    }
  };

  const saveEventName = () => {
    if (!tempEventName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event name.",
        variant: "destructive",
      });
      return;
    }

    updateEventName(tempEventName.trim());
    setTempEventName("");
    toast({
      title: "Event Name Updated",
      description: `Event name has been changed to "${tempEventName.trim()}".`,
    });
  };

  const addTestEntries = async () => {
    setIsSubmitting(true);
    const testItems = [
      "Combat Helmet", "Body Armor", "Night Vision Goggles", "Radio Headset", "Tactical Vest",
      "First Aid Kit", "Ammunition Pouch", "GPS Device", "Flashlight", "Multi-tool"
    ];
    
    const addedRefs: any[] = [];
    
    try {
      for (let i = 0; i < 10; i++) {
        const itemData: InventoryItem = {
          itemName: `${testItems[i % testItems.length]} ${i + 1}`,
          requested: Math.floor(Math.random() * 10) + 1,
          onHand: Math.floor(Math.random() * 5),
          received: 0,
          verified: false,
          returned: false,
          custodian: `Test User ${i + 1}`,
          location: `Section ${String.fromCharCode(65 + (i % 5))}`,
          email: `test${i + 1}@squadron72.mil`,
          phone: `555-010${i.toString().padStart(2, '0')}`,
          expendable: Math.random() > 0.5,
          timestamp: Date.now() + i,
        };

        const itemRef = push(ref(database, "inventory"));
        await set(itemRef, itemData);
        addedRefs.push(itemRef);
      }

      toast({
        title: "Test Entries Added",
        description: "10 test inventory items have been added successfully.",
        undoAction: async () => {
          try {
            await Promise.all(addedRefs.map(itemRef => remove(itemRef)));
            toast({
              title: "Test Entries Removed",
              description: "All 10 test entries have been removed.",
            });
          } catch (error) {
            console.error("Error removing test entries:", error);
            toast({
              title: "Error", 
              description: "Failed to remove test entries.",
              variant: "destructive",
            });
          }
        },
      });
    } catch (error) {
      console.error("Error adding test entries:", error);
      toast({
        title: "Error",
        description: "Failed to add test entries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Name Configuration */}
      <Card className="bg-card border-border" data-testid="event-config-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-text-primary flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Event Configuration
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Set the current event name for the inventory system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="event-name" className="text-sm font-medium text-text-primary">
                Current Event: <span className="text-aesa-accent font-semibold">{eventName}</span>
              </Label>
              <Input
                id="event-name"
                value={tempEventName}
                onChange={(e) => setTempEventName(e.target.value)}
                data-testid="input-event-name"
                className="mt-2 bg-input border-border text-text-primary placeholder:text-text-muted"
                placeholder="Enter new event name"
              />
            </div>
            <Button
              onClick={saveEventName}
              data-testid="button-save-event-name"
              className="bg-aesa-blue hover:bg-aesa-accent text-white mt-6"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Event Name
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <div className="flex gap-3">
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isResetting}
                      data-testid="button-reset-inventory"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      ⚠️ Reset All Inventory
                    </Button>
                  </DialogTrigger>
                  <DialogContent data-testid="dialog-password-prompt">
                    <DialogHeader>
                      <DialogTitle className="text-red-600">Master Password Required</DialogTitle>
                      <DialogDescription>
                        This action will permanently delete all inventory items. Enter the master password to continue.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Label htmlFor="master-password">Master Password</Label>
                      <Input
                        id="master-password"
                        type="password"
                        value={enteredPassword}
                        onChange={(e) => setEnteredPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                        data-testid="input-master-password"
                        placeholder="Enter master password"
                        className="w-full"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPasswordDialog(false);
                          setEnteredPassword("");
                        }}
                        data-testid="button-cancel-reset"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handlePasswordSubmit}
                        disabled={!enteredPassword}
                        data-testid="button-confirm-reset"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Reset Inventory
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTestEntries}
                  disabled={isSubmitting}
                  data-testid="button-add-test-entries"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add 10 Test Items
                </Button>
              </div>
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
