import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Clock, CheckCircle2, AlertTriangle, LogOut, Plus, ListChecks, FileStack } from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);

      // Fetch complaints
      const { data: complaintsData } = await supabase
        .from("complaints")
        .select("*")
        .eq("submitter_user_id", session.user.id)
        .order("submitted_at", { ascending: false });

      setComplaints(complaintsData || []);
      setIsLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": 
      case "Closed": 
        return "text-success";
      case "In Progress": 
      case "Assigned": 
        return "text-info";
      case "Submitted": 
      case "Reviewed": 
        return "text-warning";
      case "Escalated": 
        return "text-destructive";
      default: 
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved": 
      case "Closed": 
        return CheckCircle2;
      case "In Progress": 
      case "Assigned": 
        return Clock;
      case "Escalated": 
        return AlertTriangle;
      default: 
        return FileText;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name || user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { 
                label: "Total Complaints", 
                value: complaints.length, 
                icon: FileStack, 
                color: "primary",
                bgColor: "bg-primary/10",
                textColor: "text-primary"
              },
              { 
                label: "Pending", 
                value: complaints.filter(c => c.status === "Submitted" || c.status === "Reviewed").length, 
                icon: Clock, 
                color: "warning",
                bgColor: "bg-warning/10",
                textColor: "text-warning"
              },
              { 
                label: "In Progress", 
                value: complaints.filter(c => c.status === "In Progress" || c.status === "Assigned").length, 
                icon: ListChecks, 
                color: "info",
                bgColor: "bg-info/10",
                textColor: "text-info"
              },
              { 
                label: "Resolved", 
                value: complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length, 
                icon: CheckCircle2, 
                color: "success",
                bgColor: "bg-success/10",
                textColor: "text-success"
              },
            ].map((stat, i) => (
              <Card key={i} className="glass-effect p-6 border-border/50 hover:shadow-elevated transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary-glow"
              onClick={() => navigate("/submit")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit New Complaint
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/track")}
            >
              Track Status
            </Button>
          </div>

          {/* Recent Complaints */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Complaints</h2>
            <div className="space-y-4">
              {complaints.length === 0 ? (
                <Card className="glass-effect p-8 text-center border-border/50">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No complaints submitted yet</p>
                </Card>
              ) : (
                complaints.map((complaint) => {
                  const StatusIcon = getStatusIcon(complaint.status);
                  return (
                    <Card 
                      key={complaint.id} 
                      className="glass-effect p-6 border-border/50 hover:shadow-elevated transition-all cursor-pointer group"
                      onClick={() => navigate(`/track?id=${complaint.tracking_id}`)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-sm font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                              {complaint.tracking_id}
                            </span>
                            <span className="text-xs px-2 py-1 bg-secondary/50 rounded-full font-medium">
                              {complaint.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                            {complaint.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {complaint.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted on {new Date(complaint.submitted_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                            complaint.status === "Resolved" || complaint.status === "Closed" 
                              ? "bg-success/10" 
                              : complaint.status === "In Progress" || complaint.status === "Assigned"
                              ? "bg-info/10"
                              : "bg-warning/10"
                          }`}>
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(complaint.status)}`} />
                            <span className={`font-medium text-sm ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
