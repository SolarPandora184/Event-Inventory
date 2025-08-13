import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { database } from "@/lib/firebase";
import { ref, onValue, push, set, remove, get } from "firebase/database";
import { Clock, CheckCircle, X, RotateCcw } from "lucide-react";
import type { RequestItem } from "@/types/inventory";

export function PendingRequests() {
  const [requests, setRequests] = useState<Record<string, RequestItem>>({});
  const { toast } = useToast();

  useEffect(() => {
    const requestsRef = ref(database, "requests");
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setRequests(data);
    });

    return () => unsubscribe();
  }, []);

  const approveRequest = async (key: string) => {
    const item = requests[key];
    if (!item) return;

    try {
      // Move from requests to inventory
      const inventoryItem = {
        ...item,
        received: 0,
        verified: false,
        returned: false,
        onHand: 0
      };
      
      const newRef = push(ref(database, "inventory"));
      await set(newRef, inventoryItem);
      await remove(ref(database, `requests/${key}`));

      toast({
        title: "Request Approved",
        description: "Request has been approved and added to inventory.",
      });
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const denyRequest = async (key: string) => {
    if (!confirm("Are you sure you want to deny this request?")) return;

    try {
      await remove(ref(database, `requests/${key}`));
      toast({
        title: "Request Denied",
        description: "Request has been denied and removed.",
      });
    } catch (error) {
      console.error("Error denying request:", error);
      toast({
        title: "Error",
        description: "Failed to deny request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const requestCount = Object.keys(requests).length;

  return (
    <Card className="bg-card border-border" data-testid="pending-requests-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-text-primary flex items-center">
              <Clock className="mr-2 h-6 w-6" />
              Pending Requests
              <Badge 
                variant="outline" 
                className="ml-3 bg-aesa-blue/20 border-aesa-blue/20 text-aesa-accent"
                data-testid="pending-count-badge"
              >
                {requestCount}
              </Badge>
            </CardTitle>
            <CardDescription className="text-text-secondary mt-1">
              Review and approve incoming item requests
            </CardDescription>
          </div>
          <div className="bg-aesa-blue/20 border border-aesa-blue/20 rounded-lg px-4 py-2">
            <span className="text-aesa-accent text-sm" data-testid="pending-status">
              {requestCount > 0 ? (
                <>
                  <RotateCcw className="inline mr-2 h-4 w-4" />
                  {requestCount} pending request{requestCount !== 1 ? 's' : ''}
                </>
              ) : (
                <>
                  <CheckCircle className="inline mr-2 h-4 w-4" />
                  No pending requests
                </>
              )}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table data-testid="pending-requests-table">
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-text-primary">Item Name</TableHead>
                <TableHead className="text-text-primary">Requested</TableHead>
                <TableHead className="text-text-primary">Custodian</TableHead>
                <TableHead className="text-text-primary">Location</TableHead>
                <TableHead className="text-text-primary">Contact</TableHead>
                <TableHead className="text-text-primary">Type</TableHead>
                <TableHead className="text-text-primary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(requests).map(([key, item]) => (
                <TableRow
                  key={key}
                  data-testid={`pending-request-row-${key}`}
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell className="text-text-primary font-medium">
                    {item.itemName}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {item.requested}
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
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveRequest(key)}
                        data-testid={`button-approve-${key}`}
                        className="bg-status-complete hover:bg-opacity-80 text-white"
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => denyRequest(key)}
                        data-testid={`button-deny-${key}`}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <X className="mr-1 h-4 w-4" />
                        Deny
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {requestCount === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-text-muted">
                    <div className="flex flex-col items-center">
                      <CheckCircle className="h-12 w-12 text-status-complete mb-2" />
                      <p>No pending requests at this time.</p>
                    </div>
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
