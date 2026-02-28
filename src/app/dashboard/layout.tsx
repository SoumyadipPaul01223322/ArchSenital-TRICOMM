"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import {
    ShieldAlert,
    LayoutDashboard,
    Share2,
    Settings,
    ChevronLeft,
    ChevronRight,
    Activity,
    Zap,
    Bell,
    Search
} from "lucide-react";
import RiskBadge from "./RiskBadge";

const NAV_ITEMS = [
    {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Security Posture",
        subLabel: "Risk overview",
        accent: "text-cyan-400",
        glow: "shadow-cyan-500/20",
        exact: true,
    },
    {
        href: "/dashboard/projects/new",
        icon: Share2,
        label: "New Architecture",
        subLabel: "Start building",
        accent: "text-emerald-400",
        glow: "shadow-emerald-500/20",
        exact: false,
    },
    {
        href: "/dashboard/settings",
        icon: Settings,
        label: "Entity Settings",
        subLabel: "Configuration",
        accent: "text-amber-400",
        glow: "shadow-amber-500/20",
        exact: false,
    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Auto-collapse on small widths
        const mq = window.matchMedia("(max-width: 1024px)");
        if (mq.matches) setCollapsed(true);
        const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const isExpanded = !collapsed || hovered;
    const sidebarWidth = isExpanded ? "w-64" : "w-16";

    const isActive = (item: typeof NAV_ITEMS[0]) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/dashboard";

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#080808] text-white flex overflow-hidden">

            {/* Spacer to prevent layout shift during hover-expand */}
            <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-0 ${collapsed ? "w-16" : "w-64"}`} />

            {/* ── SIDEBAR ──────────────────────────────────────────── */}
            <aside
                className={`
                    group/aside fixed left-0 top-0 bottom-0 ${sidebarWidth} border-r border-white/[0.06] bg-[#0c0c0c]/95 backdrop-blur-2xl flex flex-col
                    transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[100]
                    hidden md:flex
                    ${hovered && collapsed ? "shadow-[20px_0_50px_rgba(0,0,0,0.6)] border-r-white/10" : ""}
                `}
                onMouseEnter={() => collapsed && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Sidebar top noise texture overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

                {/* Logo area */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 rounded-lg bg-cyan-500/20 blur-md" />
                            <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                                <ShieldAlert className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <span className={`
                            font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden
                            transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                            ${isExpanded ? "opacity-100 max-w-[120px]" : "opacity-0 max-w-0"}
                        `}>
                            ArchSentinel
                        </span>
                    </div>

                    {/* Collapse toggle */}
                    <button
                        onClick={() => { setCollapsed(c => !c); setHovered(false); }}
                        className={`
                            flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center
                            text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10
                            ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}
                        `}
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>

                {/* Status pill */}
                <div className={`
                    mx-3 mt-4 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10
                    flex items-center gap-2 overflow-hidden
                    transition-all duration-300
                    ${isExpanded ? "opacity-100" : "opacity-0 h-0 py-0 my-0 border-0"}
                `}>
                    <span className="relative flex-shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 block" />
                        <span className="absolute inset-0 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest whitespace-nowrap">System Live</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-hidden">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item);
                        const Icon = item.icon;
                        return (
                            <Link key={item.href} href={item.href}
                                className={`
                                    group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                                    transition-all duration-200 overflow-hidden
                                    ${active
                                        ? "bg-gradient-to-r from-white/10 to-transparent text-white border border-white/5"
                                        : "text-white/40 hover:text-white hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent border border-transparent"
                                    }
                                `}
                            >
                                {/* Active indicator bar */}
                                {active && (
                                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-0.5 rounded-r-full bg-current ${item.accent}`} />
                                )}

                                <span className={`
                                    flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center
                                    transition-all duration-200
                                    ${active
                                        ? `bg-gradient-to-br from-white/10 to-transparent border border-white/5 ${item.accent}`
                                        : "text-white/30 group-hover:text-white/70 group-hover:bg-white/5"
                                    }
                                `}>
                                    <Icon className="h-4 w-4" />
                                </span>

                                <div className={`
                                    flex flex-col min-w-0 overflow-hidden
                                    transition-all duration-300
                                    ${isExpanded ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0"}
                                `}>
                                    <span className="text-sm font-medium whitespace-nowrap truncate">{item.label}</span>
                                    <span className={`text-[10px] whitespace-nowrap ${active ? "text-white/40" : "text-white/20"}`}>{item.subLabel}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className={`
                    p-3 border-t border-white/[0.06] space-y-2
                    transition-all duration-300
                `}>
                    {/* Metrics strip */}
                    <div className={`
                        overflow-hidden transition-all duration-300
                        ${isExpanded ? "opacity-100 max-h-20" : "opacity-0 max-h-0"}
                    `}>
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                            {[
                                { icon: Activity, label: "Uptime", value: "99.9%", color: "text-emerald-400" },
                                { icon: Zap, label: "Latency", value: "12ms", color: "text-amber-400" },
                            ].map(m => (
                                <div key={m.label} className="bg-white/3 rounded-lg p-2">
                                    <div className={`text-[10px] font-bold ${m.color}`}>{m.value}</div>
                                    <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`
                        text-[9px] text-white/20 uppercase tracking-widest text-center font-medium
                        transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}
                    `}>
                        Enterprise v1.0
                    </div>
                </div>

                {/* Expand hint when collapsed */}
                {collapsed && !hovered && (
                    <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={() => setCollapsed(false)}
                            className="h-7 w-7 rounded-full bg-[#0a0a0a] border border-white/20 flex items-center justify-center shadow-2xl hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-200"
                        >
                            <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                        </button>
                    </div>
                )}
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────── */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* Header */}
                <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 bg-[#0c0c0c]/80 backdrop-blur-xl sticky top-0 z-20 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        {/* Mobile logo */}
                        <div className="md:hidden flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-cyan-500" />
                            <span className="font-bold text-sm">ArchSentinel</span>
                        </div>

                        {/* Org switcher */}
                        <div className="hidden md:block">
                            <OrganizationSwitcher
                                hidePersonal={false}
                                appearance={{
                                    elements: {
                                        rootBox: "flex justify-center items-center",
                                        organizationSwitcherTrigger: "text-white/60 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all duration-200 border border-white/[0.06] hover:border-white/10 outline-none text-sm",
                                        organizationPreviewTextContainer: "text-white",
                                        organizationSwitcherTriggerIcon: "text-white/40"
                                    }
                                }}
                            />
                        </div>

                        {/* Breadcrumb */}
                        <div className="hidden lg:flex items-center gap-2 text-xs text-white/30">
                            <span>/</span>
                            <span className="text-white/60 capitalize">
                                {pathname.split('/').filter(Boolean).slice(-1)[0]?.replace('-', ' ') || 'dashboard'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search button */}
                        <button
                            onClick={() => setSearchOpen(s => !s)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200 border border-white/[0.06] hover:border-white/10"
                        >
                            <Search className="h-3.5 w-3.5" />
                        </button>

                        {/* Notifications */}
                        <button className="relative h-8 w-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200 border border-white/[0.06] hover:border-white/10">
                            <Bell className="h-3.5 w-3.5" />
                            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-[#0c0c0c]" />
                        </button>

                        <div className="w-px h-5 bg-white/[0.06]" />

                        <RiskBadge />

                        <UserButton afterSignOutUrl="/" appearance={{
                            elements: { userButtonAvatarBox: "h-7 w-7 ring-1 ring-white/10" }
                        }} />
                    </div>
                </header>

                {/* Search overlay */}
                {searchOpen && (
                    <div
                        className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSearchOpen(false)}
                    >
                        <div
                            className="w-full max-w-lg mx-4 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                            style={{ animation: "slideDown 0.2s cubic-bezier(0.4,0,0.2,1)" }}
                        >
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
                                <Search className="h-4 w-4 text-white/30" />
                                <input autoFocus placeholder="Search components, projects, settings..."
                                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none" />
                                <kbd className="text-[10px] text-white/20 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
                            </div>
                            <div className="p-3">
                                {["Security Posture", "Cyber Navigator", "Entity Settings", "New Project"].map(item => (
                                    <div key={item} className="px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Page content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 99px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-12px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
