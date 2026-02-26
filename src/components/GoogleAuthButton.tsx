"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface GoogleAuthButtonProps {
  onAuthSuccess?: (token: string, user: any) => void;
  onAuthError?: (error: string) => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  isSignOut?: boolean;
  label?: string;
  useGoogleLogo?: boolean;
}

export function GoogleAuthButton({ 
  onAuthSuccess, 
  onAuthError, 
  className = "",
  variant = "default",
  size = "default",
  isSignOut = false,
  label,
  useGoogleLogo = false,
}: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { logout: contextLogout } = useAuth();

  const handleGoogleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      
      document.cookie = "invite_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      
      try { await contextLogout(); } catch {}
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Determine the redirect URL based on environment
      const redirectTo = `${window.location.origin}/api/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
      // Browser will redirect to Google; no further action needed here
    } catch (error) {
      console.error("Google sign-in error:", error);
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : "Sign in failed";
      toast({ title: "Sign-in failed", description: errorMessage, variant: "destructive" });
      if (onAuthError) onAuthError(errorMessage);
    }
  };

  if (isSignOut) {
    return (
      <Button
        onClick={handleGoogleSignOut}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={className}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isLoading ? "Signing out..." : "Sign out"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {useGoogleLogo ? (
        <img src="/google-logo.svg" alt="Google" className="mr-2 h-4 w-4" />
      ) : (
        <LogIn className="mr-2 h-4 w-4" />
      )}
      {isLoading ? "Signing in..." : (label || "Sign in with Google")}
    </Button>
  );
}
