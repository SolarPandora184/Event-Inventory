import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  Undo2,
  Minus,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import type { InventoryItem, ItemStatus } from "@/types/inventory";

interface FilterButton {
  status: ItemStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const filterButtons: FilterButton[] = [
  { status: 'missing', label: 'Missing', icon: <AlertTriangle className="h-4 w-4" />, color: 'border-status-missing text-status-missing hover:bg-status-missing' },
  { status: 'complete', label: 'Complete', icon: <CheckCircle className="h-4 w-4" />, color: 'border-status-complete text-status-complete hover:bg-status-complete' },
  { status: 'assigned', label: 'Assigned', icon: <Shield className="h-4 w-4" />, color: 'border-status-verified text-status-verified hover:bg-status-verified' },
  { status: 'returned', label: 'Returned', icon: <Undo2 className="h-4 w-4" />, color: 'border-status-returned text-status-returned hover:bg-status-returned' },
];

const specialFilters = [
  { key: 'has-missing', label: 'Has Missing', icon: <Minus className="h-4 w-4" />, color: 'border-amber-500 text-amber-500 hover:bg-amber-500' },
];

export function MobileInventorySlider() {
  const [items, setItems] = useState<Record<string, InventoryItem>>({});
  const [currentFilter, setCurrentFilter] = useState<ItemStatus | null>(null);
  const [specialFilter, setSpecialFilter] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [missingDialogOpen, setMissingDialogOpen] = useState<Record<string, boolean>>({});
  const [returnedAmount, setReturnedAmount] = useState<Record<string, number>>({});
  const [showFilters, setShowFilters] = useState(false);
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
    if (item.verified) return 'assigned';
    if ((item.received || 0) >= item.requested) return 'complete';
    return 'missing';
  };

  const filteredItems = Object.entries(items).filter(([_, item]) => {
    if (specialFilter === 'has-missing') {
      return (item.missing || 0) > 0;
    }
    if (!currentFilter) return true;
    return getItemStatus(item) === currentFilter;
  });

  const handleFilterClick = (status: ItemStatus) => {
    setCurrentFilter(currentFilter === status ? null : status);
    setSpecialFilter(null);
    setCurrentIndex(0);
  };

  const handleSpecialFilterClick = (filterKey: string) => {
    setSpecialFilter(specialFilter === filterKey ? null : filterKey);
    setCurrentFilter(null);
    setCurrentIndex(0);
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

  const handleMissingSubmit = async (key: string) => {
    const item = items[filteredItems[currentIndex][0]];
    const returned = returnedAmount[key] || 0;
    
    if (returned < 0 || returned > item.requested) {
      toast({
        title: "Invalid Amount",
        description: `Amount returned must be between 0 and ${item.requested}.`,
        variant: "destructive",
      });
      return;
    }

    const missing = item.requested - returned;

    try {
      await update(ref(database, `inventory/${key}`), { 
        missing: missing,
        received: returned 
      });
      
      setReturnedAmount(prev => ({ ...prev, [key]: 0 }));
      setMissingDialogOpen(prev => ({ ...prev, [key]: false }));
      
      toast({
        title: "Updated",
        description: `Missing quantity set to ${missing}. Received updated to ${returned}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update missing quantity.",
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
      if (currentIndex >= filteredItems.length - 1) {
        setCurrentIndex(Math.max(0, filteredItems.length - 2));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: ItemStatus) => {
    const variants = {
      missing: "status-missing",
      complete: "status-complete", 
      assigned: "status-verified",
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
    
    if (status === 'returned') {
      return (
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-status-returned text-sm flex items-center">
            <CheckCircle className="mr-1 h-4 w-4" />
            Returned
          </span>
        </div>
      );
    } else if (status === 'assigned') {
      return (
        <div className="flex flex-col gap-3">
          <Button
            size="sm"
            onClick={() => markReturned(key)}
            data-testid={`button-mark-returned-${key}`}
            className="bg-status-returned hover:bg-opacity-80 text-white w-full"
          >
            <Undo2 className="mr-1 h-4 w-4" />
            Mark Returned
          </Button>
          <Dialog open={missingDialogOpen[key] || false} onOpenChange={(open) => setMissingDialogOpen(prev => ({ ...prev, [key]: open }))}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                data-testid={`button-mark-missing-${key}`}
                className="bg-status-missing hover:bg-opacity-80 text-white w-full"
              >
                <Minus className="mr-1 h-4 w-4" />
                Mark Missing
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-text-primary">Record Missing Items</DialogTitle>
                <DialogDescription className="text-text-secondary">
                  Enter how much was actually returned for <strong>{item.itemName}</strong>.
                  <br />
                  Requested: {item.requested} | Current Missing: {item.missing || 0}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={`returned-${key}`} className="text-right text-text-primary">
                    Amount Returned:
                  </Label>
                  <Input
                    id={`returned-${key}`}
                    type="number"
                    min="0"
                    max={item.requested}
                    value={returnedAmount[key] || ''}
                    onChange={(e) => setReturnedAmount(prev => ({ 
                      ...prev, 
                      [key]: parseInt(e.target.value) || 0 
                    }))}
                    className="col-span-3 bg-input border-border text-text-primary"
                    placeholder={`0 - ${item.requested}`}
                  />
                </div>
                <div className="text-sm text-text-muted">
                  Missing will be calculated as: {item.requested} - {returnedAmount[key] || 0} = {item.requested - (returnedAmount[key] || 0)}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setMissingDialogOpen(prev => ({ ...prev, [key]: false }))}
                  className="border-border text-text-secondary"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleMissingSubmit(key)}
                  className="bg-status-missing hover:bg-opacity-80 text-white"
                >
                  Update Missing
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    } else if (status === 'complete') {
      return (
        <Button
          size="sm"
          onClick={() => verifyItem(key)}
          data-testid={`button-verify-${key}`}
          className="bg-status-verified hover:bg-opacity-80 text-white w-full"
        >
          <Shield className="mr-1 h-4 w-4" />
          Verify
        </Button>
      );
    } else {
      return (
        <div className="flex flex-col gap-2">
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
              className="flex-1 h-9 bg-input border-border text-text-primary"
            />
            <Button
              size="sm"
              onClick={() => confirmReceived(key)}
              data-testid={`button-confirm-received-${key}`}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      );
    }
  };

  const nextItem = () => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevItem = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (filteredItems.length === 0) {
    return (
      <Card className="bg-card border-border" data-testid="mobile-inventory-slider">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
            <Package className="mr-2 h-6 w-6" />
            Mobile Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted">
            No inventory items found.
          </div>
        </CardContent>
      </Card>
    );
  }

  const [key, item] = filteredItems[currentIndex];
  const status = getItemStatus(item);

  return (
    <Card className="bg-card border-border" data-testid="mobile-inventory-slider">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-text-primary flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Mobile Inventory
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-border text-text-secondary"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-text-secondary">
          {currentIndex + 1} of {filteredItems.length} items
        </CardDescription>
        
        {showFilters && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {filterButtons.map((filter) => (
              <Button
                key={filter.status}
                variant="outline"
                size="sm"
                onClick={() => handleFilterClick(filter.status)}
                data-testid={`button-filter-${filter.status}`}
                className={`${filter.color} hover:text-white transition-colors text-xs ${
                  currentFilter === filter.status ? 'bg-current text-white' : ''
                }`}
              >
                {filter.icon}
                <span className="ml-1">{filter.label}</span>
              </Button>
            ))}
            {specialFilters.map((filter) => (
              <Button
                key={filter.key}
                variant="outline"
                size="sm"
                onClick={() => handleSpecialFilterClick(filter.key)}
                data-testid={`button-filter-${filter.key}`}
                className={`${filter.color} hover:text-white transition-colors text-xs ${
                  specialFilter === filter.key ? 'bg-current text-white' : ''
                }`}
              >
                {filter.icon}
                <span className="ml-1">{filter.label}</span>
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Item Details Card */}
        <div className={`rounded-lg p-4 space-y-3 border-2 ${
          status === 'returned' ? 'bg-green-950/30 border-green-600/50' :
          status === 'assigned' ? 'bg-blue-950/30 border-blue-600/50' :
          status === 'complete' ? 'bg-emerald-950/30 border-emerald-600/50' :
          'bg-red-950/30 border-red-600/50'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">{item.itemName}</h3>
            {getStatusBadge(status)}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-text-muted">Requested:</span>
              <div className="font-medium text-text-primary">{item.requested}</div>
            </div>
            <div>
              <span className="text-text-muted">On Hand:</span>
              <div className="font-medium text-text-primary">{item.onHand || 0}</div>
            </div>
            <div>
              <span className="text-text-muted">Received:</span>
              <div className="font-medium text-text-primary">{item.received || 0}</div>
            </div>
            <div>
              <span className="text-text-muted">Missing:</span>
              <div className="font-medium text-amber-500">{item.missing || 0}</div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-text-muted">Custodian:</span>
              <div className="font-medium text-text-primary">{item.custodian || 'N/A'}</div>
            </div>
            <div>
              <span className="text-text-muted">Location:</span>
              <div className="font-medium text-text-primary">{item.location || 'N/A'}</div>
            </div>
            <div>
              <span className="text-text-muted">Contact:</span>
              <div className="font-medium text-text-primary">{item.email || 'N/A'}</div>
              {item.phone && <div className="text-text-secondary">{item.phone}</div>}
            </div>
            <div>
              <span className="text-text-muted">Type:</span>
              <div className="font-medium text-text-primary">
                {item.expendable ? 'Expendable' : 'Non-Expendable'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {renderActions(key, item)}
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Simple edit functionality - could be enhanced with a modal
                const newName = prompt("Item Name:", item.itemName);
                if (newName && newName !== item.itemName) {
                  update(ref(database, `inventory/${key}`), { itemName: newName });
                }
              }}
              data-testid={`button-edit-${key}`}
              className="border-border text-text-secondary hover:text-text-primary flex-1"
            >
              <Edit3 className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteItem(key)}
              data-testid={`button-delete-${key}`}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-1"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={prevItem}
            disabled={currentIndex === 0}
            className="border-border text-text-secondary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {filteredItems.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-aesa-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextItem}
            disabled={currentIndex === filteredItems.length - 1}
            className="border-border text-text-secondary"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}