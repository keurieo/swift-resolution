import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const isAdmin = roles?.some(r => ["admin", "ombudsperson", "department_officer"].includes(r.role));
      
      if (!isAdmin) {
        navigate("/dashboard/student");
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

      // Fetch all complaints
      const { data: complaintsData } = await supabase
        .from("complaints")
        .select("*")
        .order("submitted_at", { ascending: false });

      const allComplaints = complaintsData || [];
      setComplaints(allComplaints);

      // Calculate stats
      setStats({
        total: allComplaints.length,
        pending: allComplaints.filter(c => c.status === "Submitted").length,
        inProgress: allComplaints.filter(c => c.status === "In Progress").length,
        resolved: allComplaints.filter(c => c.status === "Resolved").length,
        critical: allComplaints.filter(c => c.priority === "Critical").length,
      });

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
      case "Submitted": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-destructive";
      case "High": return "text-warning";
      case "Medium": return "text-info";
      default: return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome, {profile?.full_name || user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Complaints", value: stats.total, icon: FileText, color: "primary" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "warning" },
              { label: "In Progress", value: stats.inProgress, icon: Activity, color: "info" },
              { label: "Resolved", value: stats.resolved, icon: CheckCircle, color: "success" },
              { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "destructive" },
            ].map((stat, i) => (
              <Card key={i} className="glass-effect p-6 border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 bg-${stat.color}/10 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-effect p-6 border-border/50 cursor-pointer hover:shadow-elevated transition-all">
              <Users className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold mb-1">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage user accounts</p>
            </Card>
            <Card className="glass-effect p-6 border-border/50 cursor-pointer hover:shadow-elevated transition-all">
              <TrendingUp className="w-8 h-8 text-success mb-3" />
              <h3 className="text-lg font-semibold mb-1">Analytics</h3>
              <p className="text-sm text-muted-foreground">View system analytics and reports</p>
            </Card>
            <Card className="glass-effect p-6 border-border/50 cursor-pointer hover:shadow-elevated transition-all">
              <Activity className="w-8 h-8 text-info mb-3" />
              <h3 className="text-lg font-semibold mb-1">System Health</h3>
              <p className="text-sm text-muted-foreground">Monitor SLA compliance</p>
            </Card>
          </div>

          {/* Recent Complaints */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Complaints</h2>
            <div className="space-y-4">
              {complaints.length === 0 ? (
                <Card className="glass-effect p-8 text-center border-border/50">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No complaints in the system</p>
                </Card>
              ) : (
                complaints.slice(0, 10).map((complaint) => (
                  <Card key={complaint.id} className="glass-effect p-6 border-border/50 hover:shadow-elevated transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-mono text-primary">{complaint.tracking_id}</span>
                          <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                            {complaint.category}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(complaint.priority)} bg-current/10`}>
                            {complaint.priority}
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
                      <div className="flex flex-col items-end gap-2">
                        <span className={`font-medium text-sm ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
