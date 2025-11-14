import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Submit() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit a complaint.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setUser(session.user);
      
      // Fetch departments
      const { data: deptData } = await supabase
        .from("departments")
        .select("id, name")
        .order("name");
      
      setDepartments(deptData || []);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Validate building number if provided
        if (buildingNumber && !/^[A-Za-z0-9\-\s]+$/.test(buildingNumber)) {
          throw new Error("Please enter a valid building/office number");
        }

        // Insert complaint into database
        const { data: complaint, error } = await supabase
          .from("complaints")
          .insert({
            submitter_user_id: user.id,
            category: category as any,
            title: title,
            description: `${description}${buildingNumber ? `\n\nBuilding/Office: ${buildingNumber}` : ''}`,
            status: "Submitted" as any,
            priority: "Low" as any,
            department_assigned: department || null,
          })
          .select()
          .single();

        if (error) {
          // Check for duplicate key error (PostgreSQL error code 23505)
          if (error.code === '23505') {
            attempt++;
            if (attempt < MAX_RETRIES) {
              // Wait before retrying with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 500 * attempt));
              continue;
            }
            throw new Error(
              `A duplicate entry was detected. Please try again. ${attempt >= MAX_RETRIES ? 'If the problem persists, contact support.' : ''}`
            );
          }
          
          // Handle foreign key violations for department
          if (error.code === '23503' && error.message.includes('department')) {
            throw new Error("Invalid department selected. Please choose a valid department.");
          }
          
          throw error;
        }

        // Success! Show tracking ID prominently in toast
        toast({
          title: "✓ Complaint Submitted Successfully",
          description: `Your unique tracking ID is: ${complaint.tracking_id}. Save this for future reference.`,
          duration: 8000,
        });

        // Redirect to dashboard after showing messages
        setTimeout(() => {
          navigate("/dashboard/student");
        }, 3500);

        return; // Exit the retry loop on success
      } catch (error: any) {
        if (attempt >= MAX_RETRIES - 1) {
          // Final attempt failed
          const isDuplicateError = error.message.includes('duplicate') || 
                                   error.message.includes('tracking');
          
          toast({
            title: "Submission Failed",
            description: isDuplicateError 
              ? "A duplicate entry was detected. Please try submitting again."
              : error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
          break;
        }
        attempt++;
      }
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 gradient-hero">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Submit a Complaint</h1>
            <p className="text-muted-foreground">
              Your voice matters. We're here to listen and resolve.
            </p>
          </div>

          <Card className="p-8 shadow-elevated border-border/50 bg-card/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logged in user info */}
              {user && (
                <div className="p-4 bg-success/10 rounded-xl border border-success/20">
                  <p className="text-sm font-medium text-success mb-1">Submitting as:</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              )}

              {/* Category selection */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Hostel">Hostel & Accommodation</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Safety">Safety & Security</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department selection */}
              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Building/Office Number */}
              <div className="space-y-2">
                <Label htmlFor="building">Building/Office Number (Optional)</Label>
                <Input
                  id="building"
                  placeholder="e.g., Building A, Room 101"
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Specify the location if relevant to your complaint
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Complaint Title</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your complaint..."
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Be as specific as possible to help us resolve your issue quickly
                </p>
              </div>

              {/* Priority hint */}
              <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-info mb-1">AI-Assisted Priority</p>
                  <p className="text-muted-foreground">
                    Our system will automatically analyze your complaint and assign
                    appropriate priority for faster resolution.
                  </p>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Complaint
                    <Send className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Info note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            All complaints are handled with utmost confidentiality and professionalism
          </p>
        </motion.div>
      </div>
    </div>
  );
}
