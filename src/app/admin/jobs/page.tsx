"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { id: string; name: string; slug: string; icon?: string | null; color?: string | null; active: boolean; position: number };
type Job = { id: string; title: string; category?: string; categoryId?: string | null; type: string; location: string; description: string; active?: boolean };

export default function AdminJobsPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  // new category form
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [catColor, setCatColor] = useState("");

  // new job form
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Full-time");
  const [location, setLocation] = useState("Remote");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    fetch('/api/admin/session').then(r => r.json()).then(j => setAuthed(Boolean(j?.authenticated))).catch(() => setAuthed(false)).finally(() => setChecking(false));
  }, []);

  const load = async () => {
    const [catsRes, jobsRes] = await Promise.all([
      fetch('/api/job-categories'),
      fetch('/api/jobs')
    ]);
    const catsJ = await catsRes.json();
    const jobsJ = await jobsRes.json();
    setCategories(catsJ.categories || []);
    setJobs(jobsJ.jobs || []);
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const grouped = useMemo(() => {
    const map: Record<string, { category: Category | undefined, jobs: Job[] }> = {};
    for (const cat of categories) map[cat.id] = { category: cat, jobs: [] };
    for (const j of jobs) {
      const key = j.categoryId || '';
      if (!map[key]) map[key] = { category: undefined, jobs: [] };
      map[key].jobs.push(j);
    }
    return map;
  }, [categories, jobs]);

  const createCategory = async () => {
    if (!catName || !catSlug) return alert('Name and slug are required');
    const res = await fetch('/api/job-categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catName, slug: catSlug, icon: catIcon || undefined, color: catColor || undefined })
    });
    const j = await res.json();
    if (!res.ok) return alert(j?.error || 'Failed to create category');
    setCatName(''); setCatSlug(''); setCatIcon(''); setCatColor('');
    load();
  };

  const createJob = async () => {
    if (!title || !categoryId || !description) return alert('Title, category and description are required');
    const res = await fetch('/api/jobs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category: categories.find(c=>c.id===categoryId)?.name || '', type, location, description, active: true, categoryId })
    });
    const j = await res.json();
    if (!res.ok) return alert(j?.error || 'Failed to create job');
    setTitle(''); setDescription('');
    load();
  };

  const toggleJob = async (id: string, active: boolean) => {
    const res = await fetch(`/api/jobs/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) });
    const j = await res.json();
    if (!res.ok) return alert(j?.error || 'Failed to update job');
    load();
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job permanently? This cannot be undone.')) return;
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    const j = await res.json();
    if (!res.ok) return alert(j?.error || 'Failed to delete job');
    load();
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
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => (window.location.href = '/admin/applications')}>Applications</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/admin/tickets')}>Tickets</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={catSlug} onChange={(e) => setCatSlug(e.target.value)} />
            </div>
            <div>
              <Label>Icon (lucide name)</Label>
              <Input value={catIcon} onChange={(e) => setCatIcon(e.target.value)} placeholder="Code, Megaphone, Building, DollarSign" />
            </div>
            <div>
              <Label>Color (Tailwind token)</Label>
              <Input value={catColor} onChange={(e) => setCatColor(e.target.value)} placeholder="blue, purple, orange, green" />
            </div>
          </div>
          <Button onClick={createCategory}>Create Category</Button>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {categories.map((c) => (
              <div key={c.id} className="border rounded p-3">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.slug}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Job</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Input value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button onClick={createJob}>Create Job</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.values(grouped).map((g, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-lg font-semibold">{g.category?.name || 'Uncategorized'}</div>
              <div className="grid md:grid-cols-3 gap-4">
                {g.jobs.map((j) => (
                  <div key={j.id} className="border rounded p-3">
                    <div className="font-medium">{j.title}</div>
                    <div className="text-xs text-muted-foreground">{j.type} • {j.location}</div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => toggleJob(j.id, !(j as any).active)}>Toggle Active</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteJob(j.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
