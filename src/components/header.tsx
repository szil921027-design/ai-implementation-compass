"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Compass className="h-7 w-7 text-[#0A2540]" />
          <span className="text-lg font-bold text-[#0A2540]">
            AI Implementation Compass
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                size="sm"
                className="bg-[#0A2540] hover:bg-[#0A2540]/90"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}
