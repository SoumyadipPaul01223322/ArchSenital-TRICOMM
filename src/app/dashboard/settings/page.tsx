"use client";

import { UserProfile, OrganizationProfile, useAuth } from "@clerk/nextjs";
import { Building, User, Shield, Bell, Key, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const TABS = [
    { id: "org", label: "Organization", icon: Building, desc: "Profile, members, and billing" },
    { id: "user", label: "Personal Profile", icon: User, desc: "Account settings and security" },
];

const SECURITY_ITEMS = [
    { label: "Audit Logging", value: "Enabled", status: "good" },
    { label: "SSO Integration", value: "Configured", status: "good" },
    { label: "IP Allowlisting", value: "Not Set", status: "warn" },
    { label: "API Key Rotation", value: "90-day policy", status: "good" },
];

export default function SettingsPage() {
    const { orgId } = useAuth();
    const [activeTab, setActiveTab] = useState("org");

    // Live Data Integration
    const settings = useQuery(api.settings.getSettings, orgId ? { orgId } : "skip");
    const updateSettings = useMutation(api.settings.updateSettings);

    // API Keys integration
    const apiKeys = useQuery(api.apiKeys.listApiKeys, orgId ? { orgId } : "skip");
    const createApiKey = useMutation(api.apiKeys.createApiKey);
    const revokeApiKey = useMutation(api.apiKeys.revokeApiKey);

    const [saving, setSaving] = useState<string | null>(null);
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [newKeyRole, setNewKeyRole] = useState<"admin" | "developer" | "readonly" | "ci_runner">("ci_runner");
    const [creatingKeyLoader, setCreatingKeyLoader] = useState(false);

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orgId || !newKeyName.trim()) return;
        setCreatingKeyLoader(true);
        try {
            await createApiKey({ orgId, name: newKeyName.trim(), role: newKeyRole });
            setNewKeyName("");
            setNewKeyRole("ci_runner");
            setIsCreatingKey(false);
        } catch (err) {
            console.error(err);
            alert("Failed to create API key");
        } finally {
            setCreatingKeyLoader(false);
        }
    };

    const handleRevokeKey = async (id: any) => {
        if (!orgId) return;
        if (confirm("Are you sure you want to revoke this API key? This will immediately break any integrations using it.")) {
            await revokeApiKey({ orgId, id });
        }
    };

    const handleToggle = async (field: string, currentValue: boolean) => {
        if (!orgId) return;
        setSaving(field);
        try {
            await updateSettings({ orgId, updates: { [field]: !currentValue } as any });
        } finally {
            setSaving(null);
        }
    };

    if (!settings) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 text-[#00e5a0] animate-spin" />
            </div>
        );
    }

    const SECURITY_ITEMS = [
        { key: 'auditLogging', label: "Audit Logging", value: settings.auditLogging ? "Enabled" : "Disabled", status: settings.auditLogging ? "good" : "warn", type: 'toggle' },
        { label: "SSO Integration", value: "Configured", status: "good", type: 'static' },
        { key: 'ipAllowlisting', label: "IP Allowlisting", value: settings.ipAllowlisting ? "Enabled" : "Disabled", status: settings.ipAllowlisting ? "good" : "warn", type: 'toggle' },
        { key: 'apiKeyRotationDays', label: "API Key Rotation", value: `${settings.apiKeyRotationDays}-day policy`, status: "good", type: 'static' },
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Entity Settings</h1>
                <p className="text-sm text-white/30 mt-0.5">Manage your organization account, members, and security policies.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#0d0d14] border border-white/[0.08] rounded-xl p-1.5 w-fit">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
                                ? "bg-white/[0.08] text-white border border-white/[0.08]"
                                : "text-white/40 hover:text-white/70"
                                }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Clerk Profile – takes 2/3 */}
                <div className="lg:col-span-2 bg-[#0d0d14] border border-white/[0.08] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-3">
                        {activeTab === "org"
                            ? <><Building className="h-4 w-4 text-cyan-400" /><span className="text-xs font-mono text-white/50 uppercase tracking-widest">Organization Profile</span></>
                            : <><User className="h-4 w-4 text-[#00e5a0]" /><span className="text-xs font-mono text-white/50 uppercase tracking-widest">Personal Profile</span></>
                        }
                    </div>
                    <div className="w-full overflow-x-auto py-4">
                        {activeTab === "org" ? (
                            <OrganizationProfile
                                routing="hash"
                                appearance={{
                                    variables: {
                                        colorPrimary: "#00e5a0",
                                        colorBackground: "transparent",
                                        colorText: "white",
                                        colorInputText: "white",
                                        colorInputBackground: "rgba(255,255,255,0.04)",
                                    },
                                    elements: {
                                        rootBox: "w-full",
                                        cardBox: "shadow-none border-0 bg-transparent w-full max-w-none",
                                        scrollBox: "rounded-none",
                                        pageScrollBox: "px-6",
                                        headerTitle: "text-white/90 font-bold",
                                        headerSubtitle: "text-white/50",
                                        formButtonPrimary: "bg-[#00e5a0] hover:bg-[#00c87a] text-[#090910] font-bold transition-all",
                                        formFieldInput: "bg-black/60 border border-white/10 text-white rounded-lg",
                                        dividerLine: "bg-white/10",
                                        badge: "bg-white/10 text-white/70 border border-white/5",
                                    }
                                }}
                            />
                        ) : (
                            <UserProfile
                                routing="hash"
                                appearance={{
                                    variables: {
                                        colorPrimary: "#00e5a0",
                                        colorBackground: "transparent",
                                        colorText: "white",
                                        colorInputText: "white",
                                        colorInputBackground: "rgba(255,255,255,0.04)",
                                    },
                                    elements: {
                                        rootBox: "w-full",
                                        cardBox: "shadow-none border-0 bg-transparent w-full max-w-none",
                                        scrollBox: "rounded-none",
                                        pageScrollBox: "px-6",
                                        headerTitle: "text-white/90 font-bold",
                                        headerSubtitle: "text-white/50",
                                        formButtonPrimary: "bg-[#00e5a0] hover:bg-[#00c87a] text-[#090910] font-bold transition-all",
                                        formFieldInput: "bg-black/60 border border-white/10 text-white rounded-lg",
                                        dividerLine: "bg-white/10",
                                        badge: "bg-white/10 text-white/70 border border-white/5",
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Right sidebar: Security Info */}
                <div className="space-y-4">
                    {/* Security status */}
                    <div className="bg-[#0d0d14] border border-white/[0.08] rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                            <Shield className="h-3.5 w-3.5 text-[#00e5a0]" />
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Security Policies</span>
                        </div>
                        <div className="p-5 space-y-3">
                            {SECURITY_ITEMS.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="text-xs text-white/40">{item.label}</span>
                                    {item.type === 'toggle' ? (
                                        <button
                                            onClick={() => handleToggle(item.key!, !!(settings as Record<string, any>)[item.key!])}
                                            className="focus:outline-none flex items-center gap-2"
                                            disabled={saving === item.key}
                                        >
                                            {saving === item.key && <Loader2 className="h-3 w-3 animate-spin text-white/40" />}
                                            <div className={`h-4 w-8 rounded-full relative transition-colors ${(settings as Record<string, any>)[item.key!] ? "bg-[#00e5a0]/30" : "bg-white/10"}`}>
                                                <div className={`absolute top-0.5 h-3 w-3 rounded-full transition-all ${(settings as Record<string, any>)[item.key!] ? "left-4 bg-[#00e5a0]" : "left-0.5 bg-white/30"}`} />
                                            </div>
                                        </button>
                                    ) : (
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${item.status === "good"
                                            ? "text-[#00e5a0] bg-[#00e5a0]/10"
                                            : "text-amber-400 bg-amber-500/10"
                                            }`}>
                                            {item.value}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* API keys info */}
                    <div className="bg-[#0d0d14] border border-white/[0.08] rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Key className="h-3.5 w-3.5 text-amber-400" />
                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">API Access</span>
                            </div>
                            {!isCreatingKey && (
                                <button
                                    onClick={() => setIsCreatingKey(true)}
                                    className="text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-widest"
                                >
                                    + Generate Key
                                </button>
                            )}
                        </div>
                        <div className="p-5 space-y-4">
                            {isCreatingKey && (
                                <form onSubmit={handleCreateKey} className="space-y-3 p-3 bg-black/40 border border-white/[0.06] rounded-lg">
                                    <p className="text-xs text-white/50">Create a new CI/CD API token</p>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        placeholder="e.g., GitHub Actions"
                                        className="w-full bg-[#0d0d14] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50"
                                        autoFocus
                                    />
                                    <select
                                        value={newKeyRole}
                                        onChange={e => setNewKeyRole(e.target.value as any)}
                                        className="w-full bg-[#0d0d14] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none"
                                    >
                                        <option value="admin">Administrator (Full Access)</option>
                                        <option value="developer">Developer (Read/Write Canvas)</option>
                                        <option value="readonly">Read-Only (Dashboards & Reporting)</option>
                                        <option value="ci_runner">CI Runner (Upload & Simulate Only)</option>
                                    </select>
                                    <div className="flex justify-end gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => { setIsCreatingKey(false); setNewKeyName(""); }}
                                            className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!newKeyName.trim() || creatingKeyLoader}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-xs transition-colors disabled:opacity-50"
                                        >
                                            {creatingKeyLoader && <Loader2 className="h-3 w-3 animate-spin" />}
                                            Generate
                                        </button>
                                    </div>
                                </form>
                            )}

                            {(!apiKeys || apiKeys.length === 0) && !isCreatingKey ? (
                                <div className="text-center py-2">
                                    <p className="text-xs text-white/30 leading-relaxed mb-3">Manage API keys for integrating ArchSentinel with your CI/CD pipeline and security tooling.</p>
                                    <button
                                        onClick={() => setIsCreatingKey(true)}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/8 border border-amber-500/20 hover:border-amber-500/40 rounded-lg text-xs font-mono text-amber-400 transition-all uppercase tracking-widest"
                                    >
                                        <Key className="h-3 w-3" /> Create First Key
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {apiKeys?.map(apiKey => (
                                        <div key={apiKey._id} className="group flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.1] transition-all rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-medium text-white/90">{apiKey.name}</div>
                                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider ${apiKey.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        apiKey.role === 'developer' ? 'bg-[#00e5a0]/10 text-[#00e5a0] border-[#00e5a0]/20' :
                                                            apiKey.role === 'ci_runner' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                'bg-white/5 text-white/40 border-white/10'
                                                        }`}>
                                                        {(apiKey.role || 'ci_runner').replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-[10px] font-mono text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded blur-[2px] hover:blur-none transition-all select-all flex-1" title="Click to reveal">
                                                        {apiKey.key}
                                                    </code>
                                                    <span className="text-[9px] text-white/30 truncate">Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRevokeKey(apiKey._id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded transition-all ml-2 flex-shrink-0"
                                                title="Revoke Key"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-[#0d0d14] border border-white/[0.08] rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                            <Bell className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Alert Preferences</span>
                        </div>
                        <div className="p-5 space-y-3">
                            {[
                                { key: "alertCriticalFindings", label: "Critical Findings" },
                                { key: "alertWeeklyDigest", label: "Weekly Digest" },
                                { key: "alertScanCompletion", label: "Scan Completion" }
                            ].map(({ key, label }) => {
                                const enabled = settings[key as keyof typeof settings] as boolean;
                                return (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-xs text-white/40">{label}</span>
                                        <button
                                            onClick={() => handleToggle(key, enabled)}
                                            disabled={saving === key}
                                            className="focus:outline-none flex items-center gap-2"
                                        >
                                            {saving === key && <Loader2 className="h-3 w-3 animate-spin text-white/40" />}
                                            <div className={`h-4 w-8 rounded-full relative transition-colors ${enabled ? "bg-[#00e5a0]/30" : "bg-white/10"}`}>
                                                <div className={`absolute top-0.5 h-3 w-3 rounded-full transition-all ${enabled ? "left-4 bg-[#00e5a0]" : "left-0.5 bg-white/30"}`} />
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
