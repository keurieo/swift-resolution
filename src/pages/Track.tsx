import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Track() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [complaint, setComplaint] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setTrackingId(id);
      handleSearch(undefined, id);
    }
  }, [searchParams]);

  const handleSearch = async (e?: React.FormEvent, id?: string) => {
    if (e) e.preventDefault();
    
    const searchId = id || trackingId;
    if (!searchId) return;

    setIsSearching(true);
    setComplaint(null);

    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("tracking_id", searchId.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Not Found",
          description: "No complaint found with this tracking ID.",
          variant: "destructive",
        });
        return;
      }

      setComplaint(data);
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Submitted: "bg-info/10 text-info border-info/20",
      Reviewed: "bg-warning/10 text-warning border-warning/20",
      "In Progress": "bg-primary/10 text-primary border-primary/20",
      Resolved: "bg-success/10 text-success border-success/20",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen pt-24 pb-16 gradient-hero">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Track Your Complaint</h1>
            <p className="text-muted-foreground">
              Enter your tracking ID to view the status and timeline
            </p>
          </div>

          {/* Search form */}
          <Card className="p-6 shadow-elevated border-border/50 bg-card/50 backdrop-blur-sm mb-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="tracking-id">Tracking ID</Label>
                <Input
                  id="tracking-id"
                  placeholder="EN-2024-XXXXX"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-primary to-primary-glow"
                  disabled={isSearching}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Complaint details */}
          {complaint && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Header card */}
              <Card className="p-6 shadow-elevated border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-semibold">{complaint.title}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                      <Badge variant="outline">
                        {complaint.category}
                      </Badge>
                      <Badge variant="outline">
                        Priority: {complaint.priority}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tracking ID</p>
                        <p className="font-medium">{complaint.tracking_id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">
                          {new Date(complaint.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Status Details */}
              <Card className="p-6 shadow-elevated border-border/50 bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4">Complaint Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{complaint.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Priority</p>
                      <Badge variant="outline">{complaint.priority}</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline">Request Update</Button>
                <Button variant="outline">Provide Feedback</Button>
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!complaint && (
            <Card className="p-12 text-center shadow-soft border-border/50 bg-card/50 backdrop-blur-sm">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
              <p className="text-muted-foreground">
                Enter your tracking ID above to view your complaint status
              </p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
