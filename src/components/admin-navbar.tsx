"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { FadeIn } from "@/components/ui/fade-in";
import { toast } from "sonner";

export function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    localStorage.removeItem("adminKey");
    await fetch("/api/admin/session", { method: "DELETE" });
    toast.info("Logged out");
    router.push("/admin/login");
  };

  return (
    <FadeIn delay={0.1} direction="down">
      <header className="sticky top-4 z-50 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex h-14 items-center justify-between rounded-full border border-border/40 bg-background/60 backdrop-blur-xl px-6 shadow-sm">
          <Link href="/admin" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold hidden sm:inline-block">PayperCrawl Admin</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar">
            <ModeToggle />
            <Link href="/admin">
              <Button variant={pathname === "/admin" ? "secondary" : "ghost"} size="sm" className="rounded-full">
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/tickets">
              <Button variant={pathname === "/admin/tickets" ? "secondary" : "ghost"} size="sm" className="rounded-full">
                Tickets
              </Button>
            </Link>
            <Link href="/admin/jobs">
              <Button variant={pathname === "/admin/jobs" ? "secondary" : "ghost"} size="sm" className="rounded-full">
                Jobs
              </Button>
            </Link>
            <Link href="/admin/applications">
              <Button variant={pathname === "/admin/applications" ? "secondary" : "ghost"} size="sm" className="rounded-full">
                Applications
              </Button>
            </Link>
            <Link href="/admin/fetch-blog">
              <Button variant={pathname === "/admin/fetch-blog" ? "secondary" : "ghost"} size="sm" className="rounded-full">
                Fetch Blog
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
    </FadeIn>
  );
}
