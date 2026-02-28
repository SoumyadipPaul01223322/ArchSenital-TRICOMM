import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { ShieldAlert, LayoutDashboard, Share2, Settings } from "lucide-react";
import RiskBadge from "./RiskBadge";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <ShieldAlert className="h-6 w-6 text-cyan-500 mr-2" />
                    <span className="font-bold text-lg tracking-tight">ArchSentinel</span>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-white/5 text-white">
                        <LayoutDashboard className="h-5 w-5 text-cyan-400" />
                        <span className="font-medium">Security Posture</span>
                    </Link>
                    <Link href="/dashboard/projects/new" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
                        <Share2 className="h-5 w-5 group-hover:text-cyan-400" />
                        <span className="font-medium">Cyber Navigator</span>
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition-colors">
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Entity Settings</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/10 text-xs text-white/40">
                    ArchSentinel Enterprise v1.0
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center space-x-4">
                        <div className="md:hidden">
                            <ShieldAlert className="h-6 w-6 text-cyan-500" />
                        </div>
                        <div className="hidden md:block">
                            <OrganizationSwitcher
                                hidePersonal={false}
                                appearance={{
                                    elements: {
                                        rootBox: "flex justify-center items-center h-full",
                                        organizationSwitcherTrigger: "text-white/80 hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors border border-white/10 outline-none",
                                        organizationPreviewTextContainer: "text-white",
                                        organizationSwitcherTriggerIcon: "text-white/50"
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <RiskBadge />
                        <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "h-8 w-8 ring-2 ring-white/10" } }} />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}} />
        </div>
    );
}
