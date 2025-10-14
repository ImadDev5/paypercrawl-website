"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { Shield, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function AdminFetchBlogPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ slug: string; title: string } | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("adminKey");
    if (key) setAdminKey(key);
  }, []);

  useEffect(() => {
    const expectedAdminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || process.env.ADMIN_API_KEY || "***REDACTED_ADMIN_KEY***";
    if (adminKey && adminKey === expectedAdminKey) setIsAuthenticated(true);
  }, [adminKey]);

  const handleImport = async () => {
    setResult(null);
    try {
      // Validate domain strictly
      let parsed: URL;
      try { parsed = new URL(url); } catch { toast.error("Please enter a valid URL"); return; }
      if (parsed.hostname !== "blogging-website-s.netlify.app") {
        toast.error("Only URLs from blogging-website-s.netlify.app are allowed");
        return;
      }

      setLoading(true);
      const res = await fetch("/api/admin/blogs/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminKey}` },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to import blog");
        return;
      }
      setResult({ slug: data.post.slug, title: data.post.title });
      toast.success("Blog imported successfully");
    } catch (e) {
      toast.error("Something went wrong while importing");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><Shield className="mr-2 h-6 w-6"/> Admin Access</CardTitle>
            <CardDescription>Enter your secret key to import blogs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-key">Admin Key</Label>
                <Input id="admin-key" value={adminKey} onChange={(e)=>setAdminKey(e.target.value)} placeholder="Enter admin key" />
              </div>
              <Button onClick={()=>{ localStorage.setItem("adminKey", adminKey); setIsAuthenticated(true); }}>Authenticate</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2"/>Back to Admin</Button></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Fetch Blog from Source URL</CardTitle>
            <CardDescription>Paste a blog URL from blogging-website-s.netlify.app to import it.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blog-url">Blog URL</Label>
                <Input id="blog-url" placeholder="https://blogging-website-s.netlify.app/blog/your-post" value={url} onChange={(e)=>setUrl(e.target.value)} />
              </div>
              <Button onClick={handleImport} disabled={loading || !url}>
                {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/> Importing...</>) : ("Fetch & Import")}
              </Button>

              {result && (
                <div className="mt-4 flex items-center gap-3 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5"/>
                  <span>Imported “{result.title}”. </span>
                  <Link href={`/blog/${result.slug}`} className="underline">View post</Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
