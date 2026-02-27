"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { FadeIn } from "@/components/ui/fade-in";

type Ticket = {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  category: "general" | "support" | "careers";
  status: "open" | "resolved" | "archived";
  createdAt: string;
  updatedAt: string;
};

export default function AdminTicketsPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState<string>("open");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    fetch('/api/admin/session')
      .then(r => r.json())
      .then(j => setAuthed(Boolean(j?.authenticated)))
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setTickets(data.tickets);
    } catch (e: any) {
      toast.error(e.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category, authed]);

  const resolveTicket = async (id: string) => {
    if (!resolution.trim()) {
      toast.error("Add a resolution message");
      return;
    }
    setResolvingId(id);
    try {
      const res = await fetch('/api/tickets/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, resolutionMessage: resolution })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to resolve');
      toast.success('Ticket resolved and email sent');
      setResolution("");
      load();
    } catch (e: any) {
      toast.error(e.message || 'Failed to resolve');
    } finally {
      setResolvingId(null);
    }
  };

  if (checking) return null;
  if (!authed) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = '/admin/login')}>Go to Admin Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <FadeIn delay={0.2} direction="up">
      <Card>
        <CardHeader>
          <CardTitle>Admin Tickets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="careers">Careers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Search</Label>
              <div className="flex gap-2">
                <Input placeholder="Name, email, subject, message, ticket id" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Button onClick={load} disabled={loading}>Search</Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Resolution Message</Label>
            <Textarea value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Write the resolution to send to the user" />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.ticketId}</TableCell>
                    <TableCell className="capitalize">{t.category}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.email}</div>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">{t.subject || '—'}</TableCell>
                    <TableCell className="capitalize">{t.status}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(t.message)}>Copy Msg</Button>
                        <Button size="sm" onClick={() => resolveTicket(t.id)} disabled={resolvingId === t.id || t.status !== 'open'}>
                          {resolvingId === t.id ? 'Resolving…' : 'Resolve'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </FadeIn>
    </div>
  );
}
