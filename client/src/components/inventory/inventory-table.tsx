import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { database } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Download,
  Plus,
  Edit3,
  Trash2,
  Undo2
} from "lucide-react";
import type { InventoryItem, ItemStatus } from "@/types/inventory";

interface FilterButton {
  status: ItemStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const filterButtons: FilterButton[] = [
  { status: 'missing', label: 'Missing', icon: <AlertTriangle className="mr-2 h-4 w-4" />, color: 'border-status-missing text-status-missing hover:bg-status-missing' },
  { status: 'complete', label: 'Complete', icon: <CheckCircle className="mr-2 h-4 w-4" />, color: 'border-status-complete text-status-complete hover:bg-status-complete' },
  { status: 'verified', label: 'Verified', icon: <Shield className="mr-2 h-4 w-4" />, color: 'border-status-verified text-status-verified hover:bg-status-verified' },
];

export function InventoryTable() {
  const [items, setItems] = useState<Record<string, InventoryItem>>({});
  const [currentFilter, setCurrentFilter] = useState<ItemStatus | null>(null);
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    const itemsRef = ref(database, "inventory");
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setItems(data);
    });

    return () => unsubscribe();
  }, []);

  const getItemStatus = (item: InventoryItem): ItemStatus => {
    if (item.returned) return 'returned';
    if (item.verified) return 'verified';
    if ((item.received || 0) >= item.requested) return 'complete';
    return 'missing';
  };

  const filteredItems = Object.entries(items).filter(([_, item]) => {
    if (!currentFilter) return true;
    return getItemStatus(item) === currentFilter;
  });

  const handleFilterClick = (status: ItemStatus) => {
    setCurrentFilter(currentFilter === status ? null : status);
  };

  const confirmReceived = async (key: string) => {
    const quantity = receivedQuantities[key];
    if (quantity === undefined || quantity < 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    try {
      await update(ref(database, `inventory/${key}`), { received: quantity });
      setReceivedQuantities(prev => ({ ...prev, [key]: 0 }));
      toast({
        title: "Updated",
        description: "Received quantity updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update received quantity.",
        variant: "destructive",
      });
    }
  };

  const verifyItem = async (key: string) => {
    try {
      await update(ref(database, `inventory/${key}`), { verified: true });
      toast({
        title: "Verified",
        description: "Item has been verified successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify item.",
        variant: "destructive",
      });
    }
  };

  const markReturned = async (key: string) => {
    try {
      await update(ref(database, `inventory/${key}`), { returned: true });
      toast({
        title: "Returned",
        description: "Item has been marked as returned.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark item as returned.",
        variant: "destructive",
      });
    }
  };

  const editItem = async (key: string) => {
    const item = items[key];
    if (!item) return;

    const newItemName = prompt("Item Name:", item.itemName);
    if (newItemName === null) return;
    
    const newRequested = prompt("Requested Quantity:", item.requested.toString());
    if (newRequested === null) return;
    
    const newOnHand = prompt("On Hand Quantity:", (item.onHand || 0).toString());
    if (newOnHand === null) return;
    
    const newReceived = prompt("Received Quantity:", (item.received || 0).toString());
    if (newReceived === null) return;
    
    const newCustodian = prompt("Custodian:", item.custodian || "");
    if (newCustodian === null) return;
    
    const newLocation = prompt("Location:", item.location || "");
    if (newLocation === null) return;
    
    const newEmail = prompt("Email:", item.email || "");
    if (newEmail === null) return;
    
    const newPhone = prompt("Phone:", item.phone || "");
    if (newPhone === null) return;
    
    const newExpendable = confirm("Is this item expendable? (OK for Yes, Cancel for No)");

    const newValues = {
      itemName: newItemName,
      requested: parseInt(newRequested) || item.requested,
      onHand: parseInt(newOnHand) || item.onHand || 0,
      received: parseInt(newReceived) || item.received || 0,
      custodian: newCustodian,
      location: newLocation,
      email: newEmail,
      phone: newPhone,
      expendable: newExpendable,
    };

    if (!newValues.itemName || isNaN(newValues.requested)) {
      toast({
        title: "Invalid Input",
        description: "Invalid item name or quantity.",
        variant: "destructive",
      });
      return;
    }

    try {
      await update(ref(database, `inventory/${key}`), newValues);
      toast({
        title: "Updated",
        description: "Item has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (key: string) => {
    if (!confirm("Are you sure you want to permanently delete this item?")) return;

    try {
      await remove(ref(database, `inventory/${key}`));
      toast({
        title: "Deleted",
        description: "Item has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  const exportInventory = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Item Name,Requested,On Hand,Received,Custodian,Location,Email,Phone,Expendable,Status\n" +
      Object.values(items).map(item => {
        const status = getItemStatus(item);
        return `"${item.itemName}",${item.requested},${item.onHand || 0},${item.received || 0},"${item.custodian || ''}","${item.location || ''}","${item.email || ''}","${item.phone || ''}",${item.expendable ? 'Yes' : 'No'},"${status}"`;
      }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ItemStatus) => {
    const variants = {
      missing: "status-missing",
      complete: "status-complete", 
      verified: "status-verified",
      returned: "status-returned"
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderActions = (key: string, item: InventoryItem) => {
    const status = getItemStatus(item);
    
    let primaryAction = null;
    
    if (status === 'returned') {
      primaryAction = (
        <span className="text-status-returned text-sm">
          <CheckCircle className="inline mr-1 h-4 w-4" />
          Returned
        </span>
      );
    } else if (status === 'verified') {
      primaryAction = (
        <Button
          size="sm"
          onClick={() => markReturned(key)}
          data-testid={`button-mark-returned-${key}`}
          className="bg-status-returned hover:bg-opacity-80 text-white"
        >
          <Undo2 className="mr-1 h-4 w-4" />
          Mark Returned
        </Button>
      );
    } else if (status === 'complete') {
      primaryAction = (
        <Button
          size="sm"
          onClick={() => verifyItem(key)}
          data-testid={`button-verify-${key}`}
          className="bg-status-verified hover:bg-opacity-80 text-white"
        >
          <Shield className="mr-1 h-4 w-4" />
          Verify
        </Button>
      );
    } else {
      primaryAction = (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Qty"
            value={receivedQuantities[key] || ''}
            onChange={(e) => setReceivedQuantities(prev => ({ 
              ...prev, 
              [key]: parseInt(e.target.value) || 0 
            }))}
            data-testid={`input-received-${key}`}
            className="w-20 h-8 bg-input border-border text-text-primary"
          />
          <Button
            size="sm"
            onClick={() => confirmReceived(key)}
            data-testid={`button-confirm-received-${key}`}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Received
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {primaryAction}
        <Button
          size="sm"
          variant="outline"
          onClick={() => editItem(key)}
          data-testid={`button-edit-${key}`}
          className="border-border text-text-secondary hover:text-text-primary"
        >
          <Edit3 className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => deleteItem(key)}
          data-testid={`button-delete-${key}`}
          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>
    );
  };

  return (
    <Card className="bg-card border-border" data-testid="inventory-table-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <Package className="mr-2 h-6 w-6" />
              Inventory Tracking
            </CardTitle>
            <CardDescription className="text-text-secondary mt-1">
              Monitor and manage inventory status
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {filterButtons.map((filter) => (
              <Button
                key={filter.status}
                variant="outline"
                size="sm"
                onClick={() => handleFilterClick(filter.status)}
                data-testid={`button-filter-${filter.status}`}
                className={`${filter.color} hover:text-white transition-colors ${
                  currentFilter === filter.status ? 'bg-current text-white' : ''
                }`}
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}
            <Button
              size="sm"
              onClick={exportInventory}
              data-testid="button-export-inventory"
              className="bg-aesa-blue hover:bg-aesa-accent text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table data-testid="inventory-table">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-text-primary">Item Name</TableHead>
                <TableHead className="text-text-primary">Requested</TableHead>
                <TableHead className="text-text-primary">On Hand</TableHead>
                <TableHead className="text-text-primary">Received</TableHead>
                <TableHead className="text-text-primary">Custodian</TableHead>
                <TableHead className="text-text-primary">Location</TableHead>
                <TableHead className="text-text-primary">Contact</TableHead>
                <TableHead className="text-text-primary">Type</TableHead>
                <TableHead className="text-text-primary">Status</TableHead>
                <TableHead className="text-text-primary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(([key, item]) => (
                <TableRow
                  key={key}
                  data-testid={`inventory-row-${key}`}
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell className="text-text-primary font-medium">
                    {item.itemName}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {item.requested}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {item.onHand || 0}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {item.received || 0}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {item.custodian || ''}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {item.location || ''}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    <div>
                      <div>{item.email || ''}</div>
                      <div className="text-sm">{item.phone || ''}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {item.expendable ? 'Expendable' : 'Non-Expendable'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(getItemStatus(item))}
                  </TableCell>
                  <TableCell>
                    {renderActions(key, item)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-text-muted">
                    No inventory items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
