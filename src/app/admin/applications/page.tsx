"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/ui/fade-in";

type Application = {
  id: string;
  name: string;
  email: string;
  position: string;
  status: string;
  jobId?: string | null;
  createdAt: string;
};

export default function AdminApplicationsPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [apps, setApps] = useState<Application[]>([]);
  const [status, setStatus] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/session').then(r => r.json()).then(j => setAuthed(Boolean(j?.authenticated))).catch(() => setAuthed(false)).finally(() => setChecking(false));
  }, []);

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/applications/submit')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load')
      let list: Application[] = data
      if (status !== 'all') list = list.filter(a => a.status === status)
      if (search.trim()) {
        const q = search.toLowerCase()
        list = list.filter(a => [a.name, a.email, a.position].some(v => (v||'').toLowerCase().includes(q)))
      }
      setApps(list)
    } catch (e) {
      console.error(e)
      alert('Failed to load applications')
    } finally { setLoading(false) }
  }

  useEffect(() => { if (authed) load() }, [authed, status])

  const updateStatus = async (id: string, newStatus: string) => {
    if (!message.trim()) { alert('Add a message to send to the applicant'); return }
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, message }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Failed to update')
      setMessage('')
      load()
      alert('Updated and email sent')
    } catch (e: any) {
      alert(e.message || 'Failed to update')
    } finally { setUpdatingId(null) }
  }

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
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label>Search</Label>
              <div className="flex gap-2">
                <Input placeholder="Name, email, position" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Button onClick={load} disabled={loading}>Search</Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Message to Applicant</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write the message to include in the status update email" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Applicant</th>
                  <th className="py-2">Position</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Applied</th>
                  <th className="py-2">Resume</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="py-2">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-muted-foreground text-xs">{a.email}</div>
                    </td>
                    <td className="py-2">{a.position}</td>
                    <td className="py-2 capitalize">{a.status}</td>
                    <td className="py-2">{new Date(a.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      <a href={`/api/applications/${a.id}/resume`} target="_blank" className="text-primary underline">View</a>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'accepted')} disabled={updatingId === a.id}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'reviewed')} disabled={updatingId === a.id}>Reviewed</Button>
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'contacted')} disabled={updatingId === a.id}>Contacted</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(a.id, 'rejected')} disabled={updatingId === a.id}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </FadeIn>
    </div>
  );
}
