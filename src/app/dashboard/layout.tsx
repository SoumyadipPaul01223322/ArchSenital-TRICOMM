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
    Radar,
    Plug,
    Users,
    Search,
    Database,
    ShieldCheck,
    History,
    Menu,
    X
} from "lucide-react";
import RiskBadge from "./RiskBadge";

const NAV_ITEMS = [
    {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Security Posture",
        subLabel: "Risk overview",
        accent: "#00e5a0",
        exact: true,
    },
    {
        href: "/dashboard/projects/new",
        icon: Share2,
        label: "New Architecture",
        subLabel: "Start building",
        accent: "#00e5a0",
        exact: false,
    },
    {
        href: "/dashboard/vault",
        icon: Database,
        label: "Project Vault",
        subLabel: "Saved models & baselines",
        accent: "#00e5a0",
        exact: false,
    },
    {
        href: "/dashboard/compliance",
        icon: ShieldCheck,
        label: "Compliance & Audit",
        subLabel: "Framework reports & logs",
        accent: "#ff3131",
        exact: false,
    },
    {
        href: "/dashboard/history",
        icon: History,
        label: "Simulation History",
        subLabel: "Attack Logs & Ledger",
        accent: "#00e5a0",
        exact: false,
    },
    {
        href: "/dashboard/intelligence",
        icon: Radar,
        label: "Threat Intelligence",
        subLabel: "Live CVEs & Tracking",
        accent: "#ff3131",
        exact: false,
    },
    {
        href: "/dashboard/integrations",
        icon: Plug,
        label: "Integrations & Webhooks",
        subLabel: "Cloud & CI/CD",
        accent: "#f59e0b",
        exact: false,
    },
    {
        href: "/dashboard/team",
        icon: Users,
        label: "Team & Access (RBAC)",
        subLabel: "Users & roles",
        accent: "#00e5a0",
        exact: false,
    },
    {
        href: "/dashboard/settings",
        icon: Settings,
        label: "Entity Settings",
        subLabel: "Configuration",
        accent: "#f59e0b",
        exact: false,
    },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: "1", title: "Active Threat Detected", message: "New zero-day CVE matches cluster config.", time: "Just now", unread: true, type: "critical" },
        { id: "2", title: "Simulation Completed", message: "External breach path analyzed. Score: Critical.", time: "10m ago", unread: true, type: "alert" },
        { id: "3", title: "Compliance Drift", message: "SOC2 control AC-3 violated in Production.", time: "1h ago", unread: false, type: "warning" },
        { id: "4", title: "System Update", message: "ArchSentinel v1.0 engine modules updated.", time: "2h ago", unread: false, type: "info" }
    ]);

    useEffect(() => {
        setMounted(true);
        // tablet: auto-collapse on screens < 1024px
        const mq = window.matchMedia("(max-width: 1023px)");
        if (mq.matches) setCollapsed(true);
        const handler = (e: MediaQueryListEvent) => {
            setCollapsed(e.matches);
            if (!e.matches) setMobileOpen(false); // close drawer when going desktop
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Close mobile drawer on route change
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setNotificationsOpen(false);
                setMobileOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Simulated realtime notification arrival
    useEffect(() => {
        if (!mounted) return;
        const timer = setTimeout(() => {
            setNotifications(prev => [
                { id: Date.now().toString(), title: "Real-time Scan", message: "Background telemetry scan completed successfully.", time: "Just now", unread: true, type: "info" },
                ...prev
            ]);
        }, 15000);
        return () => clearTimeout(timer);
    }, [mounted]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const isExpanded = !collapsed || hovered;
    const sidebarWidth = isExpanded ? "w-64" : "w-16";

    const isActive = (item: typeof NAV_ITEMS[0]) =>
        item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/dashboard";

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#090910] text-white flex overflow-hidden">

            {/* ── MOBILE BACKDROP ──────────────────────────────────── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes shimmer {
                    to { transform: translateX(200%); }
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 10px var(--nav-accent, transparent), inset 0 0 10px var(--nav-accent, transparent); }
                    50% { box-shadow: 0 0 20px var(--nav-accent, transparent), inset 0 0 20px var(--nav-accent, transparent); }
                }
                .nav-glow-active {
                    background: linear-gradient(90deg, color-mix(in srgb, var(--nav-accent) 15%, transparent) 0%, transparent 100%);
                    border: 1px solid var(--nav-accent) !important;
                    border-left: 3px solid var(--nav-accent) !important;
                }
                .nav-glow-active::before {
                    content: '';
                    position: absolute;
                    left: -1px;
                    top: -1px;
                    bottom: -1px;
                    width: 3px;
                    background: var(--nav-accent);
                    box-shadow: 0 0 15px var(--nav-accent);
                }
                .nav-hover-fx {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .nav-hover-fx:hover {
                    background: color-mix(in srgb, var(--nav-accent) 5%, transparent);
                    border: 1px solid color-mix(in srgb, var(--nav-accent) 30%, transparent) !important;
                    transform: translateX(4px);
                }
            ` }} />

            {/* Spacer — pushes main content right on md+ */}
            <div className={`hidden md:block flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${collapsed ? "w-16" : "w-64"}`} />

            {/* ── SIDEBAR ──────────────────────────────────────────── */}
            {/* On mobile: slide-in overlay drawer (z-[100]). On md+: fixed rail/expanded. */}
            <aside
                className={`
                    group/aside fixed left-0 top-0 bottom-0
                    bg-[#0b0b12] border-r border-white/[0.06] flex flex-col
                    transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[100]
                    ${
                    /* Mobile: hidden unless mobileOpen, always full-width drawer */
                    mobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
                    }
                    md:translate-x-0 ${sidebarWidth}
                `}
                onMouseEnter={() => collapsed && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Noise overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center flex-nowrap min-w-0">
                        <div className="relative flex-shrink-0 group-hover/aside:rotate-[360deg] transition-transform duration-700 ease-in-out">
                            <div className="absolute inset-0 bg-[#00e5a0]/15 blur-md" />
                            <div className="relative h-8 w-8 bg-[#0b0b12] border border-[#00e5a0]/40 flex items-center justify-center">
                                <ShieldAlert className="h-4 w-4 text-[#00e5a0]" />
                            </div>
                        </div>
                        <div className={`transition-all duration-300 overflow-hidden flex flex-col justify-center ${isExpanded ? "w-[130px] ml-3 opacity-100" : "w-0 ml-0 opacity-0"}`}>
                            <div className="font-bold text-sm tracking-tight whitespace-nowrap">ArchSentinel</div>
                            <div className="text-[9px] text-[#00e5a0]/50 font-mono uppercase tracking-widest whitespace-nowrap">Enterprise Platform</div>
                        </div>
                    </div>

                    <button
                        onClick={() => { setCollapsed(c => !c); setHovered(false); }}
                        className={`flex-shrink-0 h-6 flex items-center justify-center text-white/25 hover:text-[#00e5a0] hover:bg-[#00e5a0]/10 transition-all duration-300 border border-transparent hover:border-[#00e5a0]/30 ${isExpanded ? "w-6 opacity-100 min-w-6" : "w-0 opacity-0 min-w-0 overflow-hidden"}`}
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>

                {/* Status pill */}
                <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? "h-9 opacity-100 mt-4 mx-3 mb-0" : "h-0 opacity-0 mt-0 mx-3 mb-0"}`}>
                    <div className="px-3 py-2 bg-transparent border border-[#00e5a0]/30 flex items-center gap-2">
                        <span className="relative flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#00e5a0] block">
                            <span className="absolute inset-0 h-1.5 w-1.5 rounded-full bg-[#00e5a0] animate-ping opacity-75" />
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-[#00e5a0]/70 uppercase tracking-widest whitespace-nowrap">System Live</span>
                    </div>
                </div>

                {/* Nav */}
                <nav
                    data-lenis-prevent
                    className="flex-1 min-h-0 py-4 px-3 space-y-0.5 overflow-y-auto overflow-x-hidden"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,229,160,0.15) transparent" }}
                >
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{ "--nav-accent": item.accent } as React.CSSProperties}
                                className={`
                                    group relative flex items-center py-2.5 px-2.5
                                    transition-all duration-300 border border-transparent
                                    ${active
                                        ? "text-white nav-glow-active transform md:scale-[1.02] scale-100"
                                        : "text-white/40 nav-hover-fx"
                                    }
                                `}
                            >
                                <span
                                    className={`flex-shrink-0 h-7 w-7 flex items-center justify-center transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`}
                                    style={active ? { background: `${item.accent}15`, border: `1px solid ${item.accent}50`, color: item.accent, boxShadow: `0 0 10px ${item.accent}30` } : {}}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                </span>

                                <div className={`flex flex-col flex-nowrap transition-all duration-300 overflow-hidden ${isExpanded ? "w-[160px] ml-3 opacity-100" : "w-0 ml-0 opacity-0"}`}>
                                    <span className="text-sm font-medium whitespace-nowrap truncate">{item.label}</span>
                                    <span className="text-[10px] font-mono text-white/25 whitespace-nowrap truncate">{item.subLabel}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom metrics */}
                <div className="p-3 border-t border-white/[0.06] space-y-2">
                    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "opacity-100 max-h-20" : "opacity-0 max-h-0"}`}>
                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                            {[
                                { icon: Activity, label: "Uptime", value: "99.9%", color: "text-[#00e5a0]" },
                                { icon: Zap, label: "Latency", value: "12ms", color: "text-amber-400" },
                            ].map(m => (
                                <div key={m.label} className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-2">
                                    <div className={`text-[10px] font-mono font-bold ${m.color}`}>{m.value}</div>
                                    <div className="text-[9px] text-white/25 uppercase tracking-wider mt-0.5 font-mono">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`text-[9px] font-mono text-white/15 uppercase tracking-widest text-center transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
                        Enterprise v1.0
                    </div>
                </div>

                {/* Expand hint */}
                {collapsed && !hovered && (
                    <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover/aside:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={() => setCollapsed(false)}
                            className="h-6 w-6 bg-[#0b0b12] border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,160,0.1)] hover:border-[#00e5a0]/80 hover:bg-[#00e5a0]/15 hover:text-[#00e5a0] transition-all duration-300 hover:scale-110"
                        >
                            <ChevronRight className="h-3.5 w-3.5 text-white/40" />
                        </button>
                    </div>
                )}
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────── */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* Header */}
                <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-4 md:px-6 bg-[#0b0b12]/90 backdrop-blur-xl sticky top-0 z-20 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all"
                            onClick={() => setMobileOpen(o => !o)}
                            aria-label="Open navigation"
                        >
                            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </button>

                        {/* Mobile logo (shown next to hamburger) */}
                        <div className="md:hidden flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-[#00e5a0]" />
                            <span className="font-bold text-sm">ArchSentinel</span>
                        </div>

                        {/* Org switcher */}
                        <div className="hidden md:block">
                            <OrganizationSwitcher
                                hidePersonal={false}
                                appearance={{
                                    elements: {
                                        rootBox: "flex justify-center items-center",
                                        organizationSwitcherTrigger: "text-white/50 hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all duration-200 border border-white/[0.06] hover:border-white/10 outline-none text-sm",
                                        organizationPreviewTextContainer: "text-white",
                                        organizationSwitcherTriggerIcon: "text-white/30"
                                    }
                                }}
                            />
                        </div>

                        {/* Breadcrumb */}
                        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-white/25">
                            <span>/</span>
                            <span className="text-white/50 capitalize">
                                {pathname.split("/").filter(Boolean).slice(-1)[0]?.replace("-", " ") || "dashboard"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(s => !s)}
                            className="h-8 w-auto px-2 rounded-lg flex items-center gap-2 text-white/25 hover:text-white hover:bg-white/5 transition-all border border-white/[0.06] hover:border-white/12"
                        >
                            <Search className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline-flex text-[10px] font-mono border border-white/10 rounded px-1.5 bg-black/50">⌘K</span>
                        </button>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(n => !n)}
                                className={`relative h-8 w-8 rounded-lg flex items-center justify-center transition-all border ${notificationsOpen ? 'bg-white/10 border-white/20 text-white' : 'text-white/25 hover:text-white hover:bg-white/5 border-white/[0.06] hover:border-white/12'}`}
                            >
                                <Bell className="h-3.5 w-3.5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#ff3131] ring-1 ring-[#0b0b12]" />
                                )}
                            </button>

                            {/* Notification Popover */}
                            {notificationsOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-80 bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                                    style={{ animation: "slideDown 0.2s cubic-bezier(0.4,0,0.2,1)" }}
                                >
                                    <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between bg-black/20">
                                        <div className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
                                            <Radar className="h-3.5 w-3.5 text-[#00e5a0]" />
                                            SYSTEM FEED
                                        </div>
                                        {unreadCount > 0 && (
                                            <div className="text-[10px] font-mono bg-[#00e5a0]/20 text-[#00e5a0] px-1.5 py-0.5 rounded border border-[#00e5a0]/30">
                                                {unreadCount} NEW
                                            </div>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>
                                        {notifications.map(n => (
                                            <div key={n.id} className={`p-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer relative ${n.unread ? "bg-white/[0.02]" : "opacity-75"}`}>
                                                {n.unread && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00e5a0]" />}
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className={`text-xs font-medium ${n.type === 'critical' ? 'text-[#ff3131]' : n.type === 'alert' ? 'text-amber-400' : 'text-white'}`}>
                                                        {n.title}
                                                    </div>
                                                    <span className="text-[9px] font-mono text-white/30 whitespace-nowrap">{n.time}</span>
                                                </div>
                                                <div className="text-[11px] text-white/50 leading-relaxed font-mono tracking-tight">{n.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-white/[0.07] bg-black/20">
                                        <button
                                            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                                            className="w-full py-1.5 text-[10px] font-mono text-white/40 hover:text-white transition-colors"
                                        >
                                            MARK ALL AS READ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-px h-4 bg-white/[0.06]" />

                        <RiskBadge />

                        <UserButton afterSignOutUrl="/" appearance={{
                            elements: { userButtonAvatarBox: "h-7 w-7 ring-1 ring-white/10 hover:ring-[#00e5a0]/40 transition-all" }
                        }} />
                    </div>
                </header>

                {/* Search overlay */}
                {searchOpen && (
                    <div className="absolute inset-0 z-50 flex items-start justify-center pt-20 bg-black/70 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
                        <div
                            className="w-full max-w-lg mx-4 bg-[#0d0d14] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                            style={{ animation: "slideDown 0.2s cubic-bezier(0.4,0,0.2,1)" }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
                                <Search className="h-4 w-4 text-white/25" />
                                <input
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search commands, pages, components..."
                                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none font-mono"
                                />
                                <kbd className="text-[10px] font-mono text-white/20 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
                            </div>
                            <div className="p-2">
                                {[
                                    { label: "New Architecture", sub: "Create blueprint", href: "/dashboard/projects/new" },
                                    { label: "Project Vault", sub: "Saved models & baselines", href: "/dashboard/vault" },
                                    { label: "Compliance & Audit", sub: "Framework reports", href: "/dashboard/compliance" },
                                    { label: "Simulation History", sub: "Attack logs ledger", href: "/dashboard/history" },
                                    { label: "Threat Intelligence", sub: "Live CVEs feed", href: "/dashboard/intelligence" },
                                    { label: "Integrations", sub: "Cloud & CI/CD connections", href: "/dashboard/integrations" },
                                    { label: "Team & Access", sub: "RBAC & User Management", href: "/dashboard/team" },
                                    { label: "Entity Settings", sub: "Configuration", href: "/dashboard/settings" },
                                ]
                                    .filter(item =>
                                        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        item.sub.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map(item => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors group"
                                            onClick={() => {
                                                setSearchOpen(false);
                                                setSearchQuery("");
                                            }}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-white/15 group-hover:bg-[#00e5a0] transition-colors shadow-[0_0_10px_rgba(0,229,160,0)] group-hover:shadow-[0_0_10px_rgba(0,229,160,0.5)]" />
                                            <div>
                                                <div className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{item.label}</div>
                                                <div className="text-[10px] text-white/25 font-mono">{item.sub}</div>
                                            </div>
                                        </Link>
                                    ))}
                                {searchQuery && [
                                    { label: "New Architecture", sub: "Create blueprint", href: "/dashboard/projects/new" },
                                    { label: "Project Vault", sub: "Saved models & baselines", href: "/dashboard/vault" },
                                    { label: "Compliance & Audit", sub: "Framework reports", href: "/dashboard/compliance" },
                                    { label: "Simulation History", sub: "Attack logs ledger", href: "/dashboard/history" },
                                    { label: "Threat Intelligence", sub: "Live CVEs feed", href: "/dashboard/intelligence" },
                                    { label: "Integrations", sub: "Cloud & CI/CD connections", href: "/dashboard/integrations" },
                                    { label: "Team & Access", sub: "RBAC & User Management", href: "/dashboard/team" },
                                    { label: "Entity Settings", sub: "Configuration", href: "/dashboard/settings" },
                                ].filter(item =>
                                    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    item.sub.toLowerCase().includes(searchQuery.toLowerCase())
                                ).length === 0 && (
                                        <div className="py-8 text-center text-white/30 font-mono text-xs">
                                            No commands found for "{searchQuery}"
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Page content */}
                <div className="flex-1 overflow-y-auto" style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.08) transparent"
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
