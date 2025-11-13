import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Clock, CheckCircle, AlertCircle, LogOut, Plus } from "lucide-react";

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
      case "Resolved": return "text-success";
      case "In Progress": return "text-info";
      case "Pending": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Resolved": return CheckCircle;
      case "In Progress": return Clock;
      default: return AlertCircle;
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
              { label: "Total Complaints", value: complaints.length, icon: FileText, color: "primary" },
              { label: "Pending", value: complaints.filter(c => c.status === "Submitted").length, icon: Clock, color: "warning" },
              { label: "In Progress", value: complaints.filter(c => c.status === "In Progress").length, icon: AlertCircle, color: "info" },
              { label: "Resolved", value: complaints.filter(c => c.status === "Resolved").length, icon: CheckCircle, color: "success" },
            ].map((stat, i) => (
              <Card key={i} className="glass-effect p-6 border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${stat.color}/10 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
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
                      className="glass-effect p-6 border-border/50 hover:shadow-elevated transition-all cursor-pointer"
                      onClick={() => navigate(`/track?id=${complaint.tracking_id}`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-primary">{complaint.tracking_id}</span>
                            <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                              {complaint.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-1">{complaint.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {complaint.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {new Date(complaint.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-5 h-5 ${getStatusColor(complaint.status)}`} />
                          <span className={`font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status}
                          </span>
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
