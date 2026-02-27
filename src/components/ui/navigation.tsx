"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { SignInModal } from "@/components/ui/sign-in-modal";
import {
  Shield,
  Menu,
  Home as HomeIcon,
  Star,
  Info,
  BookOpen,
  Briefcase,
  Mail,
  LayoutDashboard,
  ArrowRight,
  LogOut,
  User,
  LogIn,
} from "lucide-react";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive 
          ? "bg-accent/80 text-foreground shadow-sm" 
          : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
      }`}
    >
      {children}
    </Link>
  );
};

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <div className="sticky top-4 z-50 flex justify-center px-4 w-full mb-4">
      <nav className="w-full max-w-5xl bg-background/80 supports-[backdrop-filter]:backdrop-blur-xl border border-border/60 backdrop-saturate-150 rounded-full shadow-lg px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          {/* Left: Logo */}
          <div className="flex items-center w-1/3">
            <Link href="/" className="flex items-center space-x-2 group">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
              <span className="text-lg font-bold text-foreground hidden sm:inline-block">
                PayPerCrawl
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-1 w-1/3">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/features">Features</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <NavLink href="/careers">Careers</NavLink>
          </div>

          {/* Right: Auth & Theme */}
          <div className="hidden md:flex items-center justify-end space-x-3 w-1/3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    pathname?.startsWith("/dashboard") 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dashboard
                </Link>
                <Button 
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-3"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <SignInModal>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs font-medium"
                  >
                    Sign in
                  </Button>
                </SignInModal>
                <Link href="/waitlist">
                  <Button
                    size="sm"
                    elevation="sm"
                    className="rounded-full shadow-sm hover:shadow-md"
                  >
                    Join Beta
                  </Button>
                </Link>
              </>
            )}
            <div className="pl-1 border-l border-border/50">
              <ModeToggle />
            </div>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="flex md:hidden items-center justify-end space-x-2 w-2/3">
            <ModeToggle />
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 h-9 w-9 rounded-full"
                  elevation="none"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[320px] sm:w-[380px] p-0 bg-background/95 backdrop-blur-2xl border-l border-border/50 shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/30 bg-background/80 backdrop-blur-xl">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-primary drop-shadow-sm" />
                    <span className="text-lg font-bold text-foreground drop-shadow-sm">
                      PayPerCrawl
                    </span>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex flex-col h-full bg-background/70 backdrop-blur-md">
                  <nav className="flex-1 p-6 bg-background/50 backdrop-blur-sm">
                    <div className="space-y-1">
                      <Link
                        href="/"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group backdrop-blur-sm hover:shadow-md ${
                          pathname === "/" 
                            ? "bg-primary/10 border border-primary/20 text-primary" 
                            : "text-foreground hover:bg-accent/80 hover:text-accent-foreground"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <HomeIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                        <span className="font-medium drop-shadow-sm">Home</span>
                      </Link>
                      <Link
                        href="/features"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group backdrop-blur-sm hover:shadow-md ${
                          pathname?.startsWith("/features") 
                            ? "bg-primary/10 border border-primary/20 text-primary" 
                            : "text-foreground hover:bg-accent/80 hover:text-accent-foreground"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Star className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                        <span className="font-medium drop-shadow-sm">
                          Features
                        </span>
                      </Link>
                      <Link
                        href="/about"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group backdrop-blur-sm hover:shadow-md ${
                          pathname?.startsWith("/about") 
                            ? "bg-primary/10 border border-primary/20 text-primary" 
                            : "text-foreground hover:bg-accent/80 hover:text-accent-foreground"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Info className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                        <span className="font-medium drop-shadow-sm">
                          About
                        </span>
                      </Link>
                      <Link
                        href="/blog"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group backdrop-blur-sm hover:shadow-md ${
                          pathname?.startsWith("/blog") 
                            ? "bg-primary/10 border border-primary/20 text-primary" 
                            : "text-foreground hover:bg-accent/80 hover:text-accent-foreground"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                        <span className="font-medium drop-shadow-sm">Blog</span>
                      </Link>
                      <Link
                        href="/careers"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group backdrop-blur-sm hover:shadow-md ${
                          pathname?.startsWith("/careers") 
                            ? "bg-primary/10 border border-primary/20 text-primary" 
                            : "text-foreground hover:bg-accent/80 hover:text-accent-foreground"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                        <span className="font-medium drop-shadow-sm">
                          Careers
                        </span>
                      </Link>
                      <Link
                        href="/contact"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group backdrop-blur-sm hover:shadow-md ${
                          pathname?.startsWith("/contact") 
                            ? "bg-primary/10 border border-primary/20 text-primary" 
                            : "text-foreground hover:bg-accent/80 hover:text-accent-foreground"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                        <span className="font-medium drop-shadow-sm">
                          Contact
                        </span>
                      </Link>
                      <Link
                        href="/dashboard"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group backdrop-blur-sm hover:shadow-md ${
                          pathname?.startsWith("/dashboard") 
                            ? "bg-primary/10 border border-primary/20 text-primary" 
                            : "text-foreground hover:bg-accent/80 hover:text-accent-foreground"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors drop-shadow-sm" />
                        <span className="font-medium drop-shadow-sm">
                          Dashboard
                        </span>
                      </Link>
                    </div>
                  </nav>

                  {/* User Section / CTA Section */}
                  <div className="p-6 border-t border-border/40 bg-accent/30 backdrop-blur-lg">
                    {isAuthenticated && user ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {user.name || user.email}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground drop-shadow-sm">
                          Ready to monetize your content?
                        </p>
                        <SignInModal>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mb-2"
                          >
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign in
                          </Button>
                        </SignInModal>
                        <Link
                          href="/waitlist"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Button
                            elevation="md"
                            className="w-full bg-primary/90 hover:bg-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm border border-primary/25"
                          >
                            Join Beta Program
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  );
}
