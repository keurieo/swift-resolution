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
  Settings,
  Mail,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [showSettings, setShowSettings] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

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

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      toast({
        title: "Error",
        description: "Please enter a new email address",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Check your new email for confirmation",
      });
      setNewEmail("");
      setShowSettings(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setNewPassword("");
      setConfirmPassword("");
      setShowSettings(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminEmail || !adminPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (adminPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    // Create the user account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (signUpError) {
      toast({
        title: "Error",
        description: signUpError.message,
        variant: "destructive",
      });
      return;
    }

    if (!signUpData.user) {
      toast({
        title: "Error",
        description: "Failed to create user account",
        variant: "destructive",
      });
      return;
    }

    // Assign admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: signUpData.user.id,
        role: "admin",
      });

    if (roleError) {
      toast({
        title: "Error",
        description: "Account created but failed to assign admin role: " + roleError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Admin account created for ${adminEmail}`,
    });
    setAdminEmail("");
    setAdminPassword("");
    setShowCreateAdmin(false);
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {profile?.full_name || user?.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
                <DialogTrigger asChild>
                  <Button variant="default" className="gap-2">
                    <Users className="w-4 h-4" />
                    Create Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Admin Account</DialogTitle>
                    <DialogDescription>
                      Create a new administrator account with email and password
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email Address</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="Enter password (min 6 characters)"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleCreateAdmin} className="w-full">
                      Create Admin Account
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Account Settings</DialogTitle>
                    <DialogDescription>
                      Update your email address or password
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Update Email
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="email">New Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="new-email@example.com"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleUpdateEmail} className="w-full">
                        Update Email
                      </Button>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Update Password
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm Password</Label>
                        <Input
                          id="confirm"
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleUpdatePassword} className="w-full">
                        Update Password
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
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
