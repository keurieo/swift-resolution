import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, CheckCircle2, AlertCircle, Users } from "lucide-react";

export default function Track() {
  const [trackingId, setTrackingId] = useState("");
  const [complaint, setComplaint] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock complaint data
    setComplaint({
      id: "EN-2024-00123",
      title: "Library AC not working properly",
      category: "Infrastructure",
      status: "In Progress",
      priority: "Medium",
      submittedAt: "2024-01-15",
      lastUpdate: "2024-01-18",
      assignedTo: "Maintenance Department",
      timeline: [
        {
          status: "Submitted",
          date: "2024-01-15",
          description: "Complaint received and acknowledged",
        },
        {
          status: "Reviewed",
          date: "2024-01-16",
          description: "Assigned to Maintenance Department",
        },
        {
          status: "In Progress",
          date: "2024-01-18",
          description: "Technician dispatched for inspection",
        },
      ],
    });
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
                <Button type="submit" className="bg-gradient-to-r from-primary to-primary-glow">
                  <Search className="w-4 h-4 mr-2" />
                  Search
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
                        <p className="font-medium">{complaint.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Assigned To</p>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {complaint.assignedTo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Timeline */}
              <Card className="p-6 shadow-elevated border-border/50 bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-6">Resolution Timeline</h3>
                <div className="space-y-6">
                  {complaint.timeline.map((event: any, index: number) => {
                    const isLast = index === complaint.timeline.length - 1;
                    return (
                      <div key={index} className="flex gap-4 relative">
                        {/* Timeline line */}
                        {!isLast && (
                          <div className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-primary/50 to-transparent" />
                        )}

                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isLast
                            ? "bg-gradient-to-br from-primary to-primary-glow shadow-glow"
                            : "bg-muted"
                        }`}>
                          {event.status === "Submitted" && (
                            <AlertCircle className={`w-5 h-5 ${isLast ? "text-white" : "text-muted-foreground"}`} />
                          )}
                          {event.status === "Reviewed" && (
                            <Clock className={`w-5 h-5 ${isLast ? "text-white" : "text-muted-foreground"}`} />
                          )}
                          {event.status === "In Progress" && (
                            <Users className={`w-5 h-5 ${isLast ? "text-white" : "text-muted-foreground"}`} />
                          )}
                          {event.status === "Resolved" && (
                            <CheckCircle2 className={`w-5 h-5 ${isLast ? "text-white" : "text-muted-foreground"}`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold">{event.status}</h4>
                            <span className="text-sm text-muted-foreground">
                              {event.date}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
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
