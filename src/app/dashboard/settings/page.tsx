"use client";

import { UserProfile, OrganizationProfile } from "@clerk/nextjs";
import { Settings, User, Building } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white/90">Entity Settings</h1>
                <p className="text-white/50 mt-1">Manage your enterprise architecture account and organization structure.</p>
            </div>

            <div className="flex flex-col gap-12 relative items-center max-w-4xl mx-auto">
                {/* Organization Settings */}
                <div className="space-y-4 w-full">
                    <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                        <Building className="h-4 w-4 text-cyan-400" />
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Organization Profile</h2>
                    </div>
                    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex justify-center py-6">
                        <OrganizationProfile
                            routing="hash"
                            appearance={{
                                variables: {
                                    colorPrimary: '#06b6d4',
                                    colorBackground: 'transparent',
                                    colorText: 'white',
                                    colorInputText: 'white',
                                    colorInputBackground: 'rgba(255,255,255,0.05)',
                                },
                                elements: {
                                    cardBox: "shadow-none border-0 bg-transparent w-full max-w-none",
                                    navbar: "hidden",
                                    scrollBox: "rounded-none",
                                    pageScrollBox: "px-6",
                                    profileSection__organizationProfile: "mt-0 pt-4",
                                    headerTitle: "text-white/90 font-bold",
                                    headerSubtitle: "text-white/50",
                                    formButtonPrimary: "bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all",
                                    formFieldInput: "bg-black/60 border border-white/10 text-white rounded-lg focus:ring-cyan-500 focus:border-cyan-500",
                                    dividerLine: "bg-white/10",
                                    badge: "bg-white/10 text-white/70 border border-white/5",
                                    activeDeviceIcon: "text-cyan-400",
                                }
                            }}
                        />
                    </div>
                </div>

                {/* User Settings */}
                <div className="space-y-4 w-full">
                    <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
                        <User className="h-4 w-4 text-emerald-400" />
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Personal Profile</h2>
                    </div>
                    <div className="bg-[#0c0c0c] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex justify-center py-6">
                        <UserProfile
                            routing="hash"
                            appearance={{
                                variables: {
                                    colorPrimary: '#10b981',
                                    colorBackground: 'transparent',
                                    colorText: 'white',
                                    colorInputText: 'white',
                                    colorInputBackground: 'rgba(255,255,255,0.05)',
                                },
                                elements: {
                                    cardBox: "shadow-none border-0 bg-transparent w-full max-w-none",
                                    navbar: "hidden",
                                    scrollBox: "rounded-none",
                                    pageScrollBox: "px-6",
                                    headerTitle: "text-white/90 font-bold",
                                    headerSubtitle: "text-white/50",
                                    formButtonPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all",
                                    formFieldInput: "bg-black/60 border border-white/10 text-white rounded-lg focus:ring-emerald-500 focus:border-emerald-500",
                                    dividerLine: "bg-white/10",
                                    badge: "bg-white/10 text-white/70 border border-white/5",
                                    activeDeviceIcon: "text-emerald-400",
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
