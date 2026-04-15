"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard",   icon: Home,  label: "HOME" },
  { href: "/attendance",  icon: Clock, label: "ATTENDANCE" },
  { href: "/leaves",      icon: User,  label: "ME" },
  { href: "/employees",   icon: Users, label: "MY TEAM" },
];

export default function MobileNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex safe-area-inset-bottom">
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors",
              active ? "text-purple-600" : "text-gray-400"
            )}
          >
            <tab.icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
            <span className={cn("text-[9px] font-semibold tracking-wider", active ? "text-purple-600" : "text-gray-400")}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
