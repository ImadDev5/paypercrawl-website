"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield,
  Users,
  Mail,
  FileText,
  Send,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

interface Application {
  id: string;
  name: string;
  email: string;
  position: string;
  phone?: string;
  website?: string;
  coverLetter?: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  website?: string;
  companySize?: string;
  useCase?: string;
  status: string;
  inviteToken?: string;
  invitedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [applicationNotes, setApplicationNotes] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");

  useEffect(() => {
    const key = localStorage.getItem("adminKey");
    if (key) {
      setAdminKey(key);
    }
  }, []);

  const authenticate = () => {
    if (adminKey === "***REDACTED_ADMIN_KEY***") {
      localStorage.setItem("adminKey", adminKey);
      setIsAuthenticated(true);
      toast.success("Authentication successful");
      loadData();
    } else {
      toast.error("Invalid admin key");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsResponse, waitlistResponse] = await Promise.all([
        fetch("/api/admin/applications", {
          headers: {
            Authorization: `Bearer ${adminKey}`,
          },
        }),
        fetch("/api/admin/waitlist", {
          headers: {
            Authorization: `Bearer ${adminKey}`,
          },
        }),
      ]);

      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.applications);
      }

      if (waitlistResponse.ok) {
        const waitlistData = await waitlistResponse.json();
        setWaitlistEntries(waitlistData.waitlistEntries);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async () => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(`/api/admin/applications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          id: selectedApplication.id,
          status: applicationStatus,
          notes: applicationNotes,
        }),
      });

      if (response.ok) {
        toast.success("Application updated successfully");
        loadData();
        setSelectedApplication(null);
      } else {
        toast.error("Failed to update application");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      toast.error("An error occurred while updating the application");
    }
  };

  const sendInvite = async (email: string) => {
    try {
      const response = await fetch("/api/waitlist/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          adminKey,
        }),
      });

      if (response.ok) {
        toast.success("Invite sent successfully");
        loadData();
      } else {
        const errorData = await response.json();
        toast.error(`Failed to send invite: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("An error occurred while sending the invite");
    }
  };

  useEffect(() => {
    if (selectedApplication) {
      setApplicationNotes(selectedApplication.notes || "");
      setApplicationStatus(selectedApplication.status);
    }
  }, [selectedApplication]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Shield className="mr-2 h-6 w-6" /> Admin Access
            </CardTitle>
            <CardDescription>
              Enter your secret key to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-key">Admin Key</Label>
                <div className="relative">
                  <Input
                    id="admin-key"
                    type={showKey ? "text" : "password"}
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && authenticate()}
                    placeholder="Enter your secret key"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button onClick={authenticate} className="w-full">
                Authenticate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span className="font-bold">PayperCrawl Admin</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <ModeToggle />
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("adminKey");
                setIsAuthenticated(false);
                toast.info("Logged out");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="applications">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="applications">
              <FileText className="mr-2 h-4 w-4" />
              Applications ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="waitlist">
              <Users className="mr-2 h-4 w-4" />
              Waitlist ({waitlistEntries.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Beta Applications</CardTitle>
                <CardDescription>
                  Review and manage applications for the beta program.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <h3 className="font-bold mb-4">Applicants</h3>
                      <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {applications.map((app) => (
                          <Button
                            key={app.id}
                            variant={
                              selectedApplication?.id === app.id
                                ? "secondary"
                                : "ghost"
                            }
                            className="w-full justify-start h-auto py-2"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <div className="text-left">
                              <p className="font-semibold">{app.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {app.email}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {app.status}
                              </Badge>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      {selectedApplication ? (
                        <Card>
                          <CardHeader>
                            <CardTitle>{selectedApplication.name}</CardTitle>
                            <CardDescription>
                              Applied on{" "}
                              {formatDate(
                                new Date(selectedApplication.createdAt)
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <p>
                                <strong>Email:</strong>{" "}
                                {selectedApplication.email}
                              </p>
                              <p>
                                <strong>Phone:</strong>{" "}
                                {selectedApplication.phone || "N/A"}
                              </p>
                              <p>
                                <strong>Website:</strong>{" "}
                                <a
                                  href={selectedApplication.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {selectedApplication.website}
                                </a>
                              </p>
                              <p>
                                <strong>Position:</strong>{" "}
                                {selectedApplication.position}
                              </p>
                              <div>
                                <p>
                                  <strong>Cover Letter:</strong>
                                </p>
                                <p className="text-muted-foreground p-2 border rounded-md bg-muted/50">
                                  {selectedApplication.coverLetter || "N/A"}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                  value={applicationStatus}
                                  onValueChange={setApplicationStatus}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Set status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="reviewed">
                                      Reviewed
                                    </SelectItem>
                                    <SelectItem value="approved">
                                      Approved
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                      Rejected
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                  id="notes"
                                  value={applicationNotes}
                                  onChange={(e) =>
                                    setApplicationNotes(e.target.value)
                                  }
                                  placeholder="Add internal notes..."
                                />
                              </div>
                              <Button onClick={updateApplicationStatus}>
                                Update Application
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Select an application to view details</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="waitlist">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist Entries</CardTitle>
                <CardDescription>
                  Manage users who have joined the waitlist.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitlistEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.name}</TableCell>
                          <TableCell>{entry.email}</TableCell>
                          <TableCell>
                            <a
                              href={entry.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {entry.website}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                entry.status === "invited"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(new Date(entry.createdAt))}
                          </TableCell>
                          <TableCell>
                            {entry.status !== "invited" && (
                              <Button
                                size="sm"
                                onClick={() => sendInvite(entry.email)}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Send Invite
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
