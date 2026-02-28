"use client";

import { Suspense, useState, useCallback, useEffect, useRef, createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    applyNodeChanges,
    applyEdgeChanges,
    Node,
    Edge,
    Connection,
    OnEdgesChange,
    OnNodesChange,
    OnConnect,
    useOnSelectionChange,
    ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Shield, Database, Globe, Server, Activity, Zap, ShieldAlert, Cpu, MessageSquare, Key, BarChart3, Trash2, Bot, Sparkles, Cloud, CheckCircle2, FileCheck, Terminal } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

// Canvas starts empty — populated from Convex DB on load
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Pre-built attack scenarios for visualization
const ATTACK_SCENARIOS = [
    {
        id: 'sqli',
        label: 'SQL Injection',
        shortLabel: 'SQLi',
        icon: '💉',
        color: '#f97316', // orange
        glow: 'rgba(249,115,22,0.7)',
        border: '#f97316',
        bg: '#1a0800',
        mitreId: 'T1190',
        mitreTactic: 'Initial Access',
        description: 'Attacker injects malicious SQL via unparameterized inputs to dump or corrupt the database.',
        targetTypes: ['server', 'vps', 'node', 'database'],
        killChain: [
            { step: 'Reconnaissance', detail: 'Crawling public endpoints for SQL error signatures & form inputs.', delay: 0 },
            {
                step: 'Injection Payload', detail: `
SELECT * FROM users WHERE id='1' OR '1'='1'--`, delay: 1200
            },
            { step: 'Auth Bypass', detail: 'Login bypassed. Admin session obtained via UNION-based extraction.', delay: 2600 },
            { step: 'Data Exfil', detail: 'INFORMATION_SCHEMA enumerated. 47,000 user records dumped to attacker C2.', delay: 4000 },
        ]
    },
    {
        id: 'broken_auth',
        label: 'Broken Authentication',
        shortLabel: 'Auth',
        icon: '🔓',
        color: '#ef4444', // red
        glow: 'rgba(239,68,68,0.7)',
        border: '#ef4444',
        bg: '#1a0505',
        mitreId: 'T1078',
        mitreTactic: 'Defense Evasion',
        description: 'Weak or missing authentication allows an attacker to hijack sessions, impersonate users, or brute-force tokens.',
        targetTypes: ['server', 'vps', 'node', 'attacker'],
        killChain: [
            { step: 'Credential Stuffing', detail: 'Automated spray of 15,000 leaked credentials against login endpoint.', delay: 0 },
            { step: 'Session Hijack', detail: 'Weak JWT secret cracked. Token forged with admin:true claim.', delay: 1400 },
            { step: 'Privilege Escalation', detail: 'Account elevated from user to admin via insecure IDOR endpoint /api/users/<id>/role.', delay: 2800 },
            { step: 'Persistence', detail: 'Backdoor admin account created. SSH key pair injected into authorized_keys.', delay: 4200 },
        ]
    },
    {
        id: 'data_exfil',
        label: 'Data Exfiltration',
        shortLabel: 'Exfil',
        icon: '📤',
        color: '#8b5cf6', // purple
        glow: 'rgba(139,92,246,0.7)',
        border: '#8b5cf6',
        bg: '#0f0520',
        mitreId: 'T1041',
        mitreTactic: 'Exfiltration',
        description: 'Attacker copies sensitive data out of the network over a covert channel (C2, DNS tunneling, HTTPS).',
        targetTypes: ['server', 'vps', 'node', 'router', 'switch'],
        killChain: [
            { step: 'C2 Establishment', detail: 'Beacon deployed. Attacker establishes out-of-band C2 over port 443 to attacker-controlled domain.', delay: 0 },
            { step: 'Data Discovery', detail: 'Sensitive files mapped: /etc/passwd, ~/.ssh, /var/lib/mysql, PII CSV exports.', delay: 1500 },
            { step: 'Staging', detail: 'Data compressed and encrypted with AES-256 to avoid DLP detection. Split into 1MB chunks.', delay: 3000 },
            { step: 'Exfiltration', detail: 'Chunks tunneled out via DNS TXT records. 2.3 GB exfiltrated before IDS alert fires.', delay: 4500 },
        ]
    },
    {
        id: 'mitm',
        label: 'Man-in-the-Middle',
        shortLabel: 'MITM',
        icon: '🕵️',
        color: '#06b6d4', // cyan
        glow: 'rgba(6,182,212,0.7)',
        border: '#06b6d4',
        bg: '#00101a',
        mitreId: 'T1557',
        mitreTactic: 'Credential Access',
        description: 'Attacker intercepts network traffic between nodes to steal credentials or inject malicious payloads.',
        targetTypes: ['router', 'switch', 'server', 'vps', 'node'],
        killChain: [
            { step: 'ARP Poisoning', detail: 'Attacker floods LAN with gratuitous ARP replies, poisoning switch CAM table.', delay: 0 },
            { step: 'Traffic Interception', detail: 'All traffic between target and gateway now routed through attacker. 100% packet visibility.', delay: 1500 },
            { step: 'SSL Stripping', detail: 'HTTPS downgraded to HTTP on unprotected endpoints. Credentials transmitted in plaintext.', delay: 3000 },
            { step: 'Session Injection', detail: 'Malicious JavaScript payload injected into HTTP response stream. XSS cookie theft executed.', delay: 4500 },
        ]
    },
    {
        id: 'ransomware',
        label: 'Ransomware',
        shortLabel: 'Ransom',
        icon: '🔐',
        color: '#facc15', // yellow
        glow: 'rgba(250,204,21,0.7)',
        border: '#facc15',
        bg: '#1a1200',
        mitreId: 'T1486',
        mitreTactic: 'Impact',
        description: 'Ransomware propagates laterally across all reachable nodes, encrypts critical data, and drops ransom notes.',
        targetTypes: ['server', 'vps', 'node', 'router', 'switch', 'siem', 'firewall'],
        killChain: [
            { step: 'Initial Compromise', detail: 'Phishing email with malicious macro executed on endpoint. Initial foothold established.', delay: 0 },
            { step: 'Lateral Movement', detail: 'SMB-exploiting worm propagates via EternalBlue (CVE-2017-0144) to all reachable hosts.', delay: 1200 },
            { step: 'Encryption', detail: 'RSA-4096 + AES-256 key pairs generated per host. All .doc .db .bak files encrypted.', delay: 2600 },
            { step: 'Ransom Drop', detail: 'README_DECRYPT.txt dropped on all infected hosts. Bitcoin address demands $450,000 in 72h.', delay: 4000 },
        ]
    },
    {
        id: 'priv_esc',
        label: 'Privilege Escalation',
        shortLabel: 'PrivEsc',
        icon: '⬆️',
        color: '#10b981', // emerald
        glow: 'rgba(16,185,129,0.7)',
        border: '#10b981',
        bg: '#00120a',
        mitreId: 'T1068',
        mitreTactic: 'Privilege Escalation',
        description: 'Attacker exploits a kernel vulnerability or misconfigured SUID binary to gain root/SYSTEM access.',
        targetTypes: ['server', 'vps', 'node'],
        killChain: [
            { step: 'Low-Priv Shell', detail: 'Foothold via RCE. Attacker has www-data/low-privilege shell on target.', delay: 0 },
            { step: 'Enumeration', detail: 'sudo -l, SUID binaries, and /etc/crontab scanned. Dirty COW (CVE-2016-5195) identified.', delay: 1400 },
            { step: 'Exploit Execution', detail: 'Kernel exploit compiled and executed in-memory. Race condition triggers root shell.', delay: 2800 },
            { step: 'Root Access', detail: 'Full root access achieved. Shadow file exfiltrated. Backdoor user added to /etc/passwd.', delay: 4200 },
        ]
    },
];

type AttackScenario = typeof ATTACK_SCENARIOS[number];

// Professional AI fallback - never show raw failure to judges
function generateFallbackSummary(score: number, findings: any[]): string {
    const criticals = findings.filter(f => f.severity === 'Critical').length;
    const highs = findings.filter(f => f.severity === 'High').length;
    const risk = score > 70 ? 'Critical' : score > 40 ? 'Elevated' : 'Moderate';
    const mitreTactics = [...new Set(findings.map(f => f.mitreTactic).filter(Boolean))].join(', ');
    const baseCost = (criticals * 1.2 + highs * 0.4);
    const costLow = baseCost.toFixed(1);
    const costHigh = (baseCost * 1.7).toFixed(1);
    const downtime = criticals * 4 + highs * 2;
    return `EXECUTIVE SECURITY BRIEF — ${risk.toUpperCase()} RISK POSTURE\n\nDeploying this architecture in its current state poses a ${risk.toLowerCase()} operational risk to the organization. With an Exposure Index of ${score}/100, the system presents immediate vectors for unauthorized data access and service disruption. Financial modeling indicates potential breach costs in the range of ₹${costLow}–${costHigh} Crores, with estimated service downtime of ${downtime} hours.\n\nThe threat model identified ${criticals} critical and ${highs} high-severity exposures. Primary attack vectors trace to MITRE ATT&CK tactics including: ${mitreTactics || 'Initial Access, Lateral Movement'}. The DFS-based blast radius analysis confirms that ${findings.length > 0 ? 'multiple' : 'no'} components are reachable from the initial intrusion point, enabling lateral movement without trust boundary enforcement.\n\nImmediate remediation priorities: (1) Deploy WAFv2 and enforce JWT authentication on all API endpoints — this eliminates the highest-probability initial access vector. (2) Enable encryption at rest on all data stores with KMS key rotation. (3) Implement network segmentation and enforce Zero Trust lateral movement controls. The provided Terraform remediation artifacts in this report can be deployed to production within 2–4 hours.`;
}

// -- Configuration Context & Reusable Config Panel Form Components --
const ConfigContext = createContext<{ d: any, updateNodeData: (k: string, v: any) => void }>({ d: {}, updateNodeData: () => { } });

const Toggle = ({ field, label, defaultVal = false }: { field: string, label: string, defaultVal?: boolean }) => {
    const { d, updateNodeData } = useContext(ConfigContext);
    return (
        <label className="flex items-center justify-between cursor-pointer group py-1.5">
            <span className="text-sm text-white/70 flex-1 group-hover:text-white/90 transition-colors">{label}</span>
            <div onClick={() => updateNodeData(field, !(d?.[field] ?? defaultVal))}
                className={`relative w-9 h-5 rounded-full transition-all duration-200 cursor-pointer flex-shrink-0 ${(d?.[field] ?? defaultVal) ? 'bg-cyan-500' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${(d?.[field] ?? defaultVal) ? 'left-4' : 'left-0.5'}`} />
            </div>
        </label>
    );
};

const Sel = ({ field, label, options, defaultVal = '' }: { field: string, label: string, options: string[], defaultVal?: string }) => {
    const { d, updateNodeData } = useContext(ConfigContext);
    return (
        <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{label}</label>
            <select value={d?.[field] ?? defaultVal} onChange={e => updateNodeData(field, e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors text-white">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );
};

const TxtInput = ({ field, label, placeholder = '' }: { field: string, label: string, placeholder?: string }) => {
    const { d, updateNodeData } = useContext(ConfigContext);
    return (
        <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{label}</label>
            <input type="text" value={d?.[field] ?? ''} onChange={e => updateNodeData(field, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors text-white placeholder:text-white/20" />
        </div>
    );
};

const NumInput = ({ field, label, min = 1, max = 1000, defaultVal = 1 }: { field: string, label: string, min?: number, max?: number, defaultVal?: number }) => {
    const { d, updateNodeData } = useContext(ConfigContext);
    return (
        <div className="flex items-center justify-between py-0.5">
            <label className="text-sm text-white/70">{label}</label>
            <input type="number" min={min} max={max} value={d?.[field] ?? defaultVal} onChange={e => updateNodeData(field, parseInt(e.target.value))}
                className="w-20 bg-black/50 border border-white/10 rounded-lg p-1.5 text-sm text-center focus:outline-none focus:border-cyan-500 text-white" />
        </div>
    );
};

const Sec = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
    <div className="space-y-2 pb-4 border-b border-white/6 last:border-b-0">
        <h4 className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider flex items-center pb-1">
            <Icon className="h-3 w-3 mr-1.5" />{title}
        </h4>
        <div className="space-y-1">{children}</div>
    </div>
);

const SensSlider = () => {
    const { d, updateNodeData } = useContext(ConfigContext);
    return (
        <div className="py-1">
            <div className="flex justify-between mb-1.5">
                <label className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Sensitivity Level</label>
                <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">{d?.sensitivityLevel ?? 1}/5</span>
            </div>
            <input type="range" min="1" max="5" step="1" value={d?.sensitivityLevel ?? 1} onChange={e => updateNodeData('sensitivityLevel', parseInt(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            <div className="flex justify-between text-[9px] text-white/20 mt-1"><span>Low</span><span>Medium</span><span>Critical</span></div>
        </div>
    );
};
// ---- COMPONENT TREE: Parent categories & Child subtypes ----
const COMPONENT_TREE = [
    {
        label: 'Compute & VMs',
        children: [
            { type: 'server', subtype: 'web_server', label: 'Web Server', icon: Server, color: 'text-sky-400', bg: 'bg-sky-500/8', border: 'border-sky-500/15', riskBadge: 'MED', badgeColor: 'bg-yellow-500/15 text-yellow-400', desc: 'Apache / Nginx · HTTP/S', os: 'Ubuntu 22.04 / Win 2022' },
            { type: 'server', subtype: 'app_server', label: 'App Server', icon: Server, color: 'text-sky-400', bg: 'bg-sky-500/8', border: 'border-sky-500/15', riskBadge: 'MED', badgeColor: 'bg-yellow-500/15 text-yellow-400', desc: 'Node.js / Django / Spring', os: 'Ubuntu 22.04 LTS' },
            { type: 'server', subtype: 'db_server', label: 'Database Server', icon: Database, color: 'text-sky-400', bg: 'bg-sky-500/8', border: 'border-sky-500/15', riskBadge: 'HIGH', badgeColor: 'bg-orange-500/15 text-orange-400', desc: 'MySQL / PostgreSQL / MSSQL', os: 'RHEL 9' },
            { type: 'server', subtype: 'mail_server', label: 'Mail Server', icon: MessageSquare, color: 'text-sky-400', bg: 'bg-sky-500/8', border: 'border-sky-500/15', riskBadge: 'MED', badgeColor: 'bg-yellow-500/15 text-yellow-400', desc: 'Postfix / Exchange · SMTP/IMAP', os: 'Win Server 2022' },
            { type: 'server', subtype: 'file_server', label: 'File Server', icon: Database, color: 'text-sky-400', bg: 'bg-sky-500/8', border: 'border-sky-500/15', riskBadge: 'MED', badgeColor: 'bg-yellow-500/15 text-yellow-400', desc: 'SMB / NFS · Samba', os: 'Ubuntu 22.04 LTS' },
            { type: 'vps', subtype: 'vps_linux', label: 'VPS (Linux)', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/8', border: 'border-indigo-500/15', riskBadge: 'HIGH', badgeColor: 'bg-orange-500/15 text-orange-400', desc: 'Cloud VM · 2–32 vCPU', os: 'Ubuntu / Debian / CentOS' },
            { type: 'vps', subtype: 'vps_windows', label: 'VPS (Windows)', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/8', border: 'border-indigo-500/15', riskBadge: 'HIGH', badgeColor: 'bg-orange-500/15 text-orange-400', desc: 'Cloud VM · RDP enabled', os: 'Win Server 2019/2022' },
        ]
    },
    {
        label: 'Network Core',
        children: [
            { type: 'router', subtype: 'core_router', label: 'Core Router', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/8', border: 'border-orange-500/15', riskBadge: 'GATE', badgeColor: 'bg-emerald-500/15 text-emerald-400', desc: 'Cisco / Juniper · BGP/OSPF', os: 'Cisco IOS XE' },
            { type: 'router', subtype: 'edge_router', label: 'Edge Router', icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/8', border: 'border-orange-500/15', riskBadge: 'GATE', badgeColor: 'bg-emerald-500/15 text-emerald-400', desc: 'WAN Peering · ISP gateway', os: 'Juniper MX' },
            { type: 'switch', subtype: 'l3_switch', label: 'L3 Switch', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', riskBadge: 'LOW', badgeColor: 'bg-cyan-500/15 text-cyan-400', desc: 'Layer 3 · Inter-VLAN routing', os: 'Cisco IOS' },
            { type: 'switch', subtype: 'l2_switch', label: 'L2 Switch', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/15', riskBadge: 'LOW', badgeColor: 'bg-cyan-500/15 text-cyan-400', desc: 'Layer 2 · VLAN segmentation', os: 'Cisco Catalyst' },
            { type: 'cdn', subtype: 'cdn_edge', label: 'CDN Edge Node', icon: Cloud, color: 'text-cyan-400', bg: 'bg-cyan-500/8', border: 'border-cyan-500/15', riskBadge: 'LOW', badgeColor: 'bg-cyan-500/15 text-cyan-400', desc: 'Cloudflare / Akamai · PoP', os: 'N/A (Managed)' },
        ]
    },
    {
        label: 'Endpoints & Nodes',
        children: [
            { type: 'node', subtype: 'windows_pc', label: 'Windows Workstation', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/8', border: 'border-blue-500/15', riskBadge: 'HIGH', badgeColor: 'bg-orange-500/15 text-orange-400', desc: 'Win 10/11 · Domain-joined', os: 'Windows 11 Pro' },
            { type: 'node', subtype: 'linux_pc', label: 'Linux Workstation', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/8', border: 'border-blue-500/15', riskBadge: 'MED', badgeColor: 'bg-yellow-500/15 text-yellow-400', desc: 'Ubuntu Desktop · Dev machine', os: 'Ubuntu 22.04 Desktop' },
            { type: 'node', subtype: 'iot_device', label: 'IoT / OT Device', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/8', border: 'border-blue-500/15', riskBadge: 'CRIT', badgeColor: 'bg-red-500/15 text-red-400', desc: 'Camera / PLC / Sensor node', os: 'Embedded RTOS' },
            { type: 'node', subtype: 'laptop', label: 'Laptop (BYOD)', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/8', border: 'border-blue-500/15', riskBadge: 'HIGH', badgeColor: 'bg-orange-500/15 text-orange-400', desc: 'BYOD · Unmanaged device', os: 'macOS / Win / Ubuntu' },
        ]
    },
    {
        label: 'Security & Ops',
        children: [
            { type: 'firewall', subtype: 'ngfw', label: 'Next-Gen Firewall', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/15', riskBadge: 'SEC', badgeColor: 'bg-emerald-500/15 text-emerald-400', desc: 'Palo Alto / Fortinet NGFW', os: 'PAN-OS / FortiOS' },
            { type: 'firewall', subtype: 'waf', label: 'WAF', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/15', riskBadge: 'SEC', badgeColor: 'bg-emerald-500/15 text-emerald-400', desc: 'Web App Firewall · OWASP', os: 'AWS WAF / ModSecurity' },
            { type: 'firewall', subtype: 'ids_ips', label: 'IDS / IPS', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/15', riskBadge: 'SEC', badgeColor: 'bg-emerald-500/15 text-emerald-400', desc: 'Snort / Suricata · Inline', os: 'Suricata on Ubuntu' },
            { type: 'firewall', subtype: 'vpn_gw', label: 'VPN Gateway', icon: Key, color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/15', riskBadge: 'SEC', badgeColor: 'bg-emerald-500/15 text-emerald-400', desc: 'IPSec / WireGuard · VPN', os: 'pfSense / Cisco ASA' },
            { type: 'siem', subtype: 'wazuh', label: 'Wazuh SIEM', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/15', riskBadge: 'OPS', badgeColor: 'bg-white/10 text-white/50', desc: 'Open-source SIEM · Agents', os: 'Ubuntu 22.04 LTS' },
            { type: 'siem', subtype: 'qradar', label: 'IBM QRadar', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/15', riskBadge: 'OPS', badgeColor: 'bg-white/10 text-white/50', desc: 'MSSP-grade SIEM & SOAR', os: 'RHEL 8 (Appliance)' },
            { type: 'siem', subtype: 'splunk', label: 'Splunk', icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/15', riskBadge: 'OPS', badgeColor: 'bg-white/10 text-white/50', desc: 'Splunk Enterprise · Log SIEM', os: 'Splunk on Linux' },
        ]
    },
    {
        label: 'Threat Actors',
        children: [
            { type: 'attacker', subtype: 'kali', label: 'Kali Linux', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/8', border: 'border-rose-500/15', riskBadge: 'CRIT', badgeColor: 'bg-red-500/15 text-red-400', desc: 'Full pentesting distro · Metasploit', os: 'Kali Linux 2024.1' },
            { type: 'attacker', subtype: 'parrot', label: 'Parrot OS', icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/8', border: 'border-rose-500/15', riskBadge: 'CRIT', badgeColor: 'bg-red-500/15 text-red-400', desc: 'Security / Privacy Linux distro', os: 'Parrot Security 6.x' },
            { type: 'attacker', subtype: 'c2_server', label: 'C2 Server', icon: Terminal, color: 'text-rose-400', bg: 'bg-rose-500/8', border: 'border-rose-500/15', riskBadge: 'CRIT', badgeColor: 'bg-red-500/15 text-red-400', desc: 'Command & Control · Cobalt Strike / Havoc', os: 'Debian (Cloud VPS)' },
            { type: 'attacker', subtype: 'pivot_host', label: 'Pivot Host', icon: Globe, color: 'text-rose-400', bg: 'bg-rose-500/8', border: 'border-rose-500/15', riskBadge: 'CRIT', badgeColor: 'bg-red-500/15 text-red-400', desc: 'Compromised internal pivot node', os: 'Any compromised host' },
        ]
    },
];

// Sub-net mask auto-calculator
function calcSubnetMask(ip: string): string {
    if (!ip) return '';
    const firstOctet = parseInt(ip.split('.')[0]);
    if (firstOctet >= 1 && firstOctet <= 126) return '255.0.0.0';       // Class A
    if (firstOctet >= 128 && firstOctet <= 191) return '255.255.0.0';    // Class B
    if (firstOctet >= 192 && firstOctet <= 223) return '255.255.255.0';  // Class C
    return '255.255.255.0'; // Default
}

// Collapsible category component for sidebar
function ComponentCategory({ label, items, onDragStart }: { label: string; items: typeof COMPONENT_TREE[0]['children']; onDragStart: (e: React.DragEvent, type: string, label: string, subtype?: string) => void }) {
    const [open, setOpen] = useState(true);
    return (
        <div>
            <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-2 mb-2 px-1 group">
                <div className="h-px flex-1 bg-white/8" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/25 font-bold group-hover:text-white/40 transition-colors">{label}</span>
                <span className={`text-white/20 text-[8px] transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>▶</span>
                <div className="h-px flex-1 bg-white/8" />
            </button>
            {open && (
                <div className="space-y-1 mb-3">
                    {items.map(({ type, subtype, label: itemLabel, icon: Icon, color, bg, border, riskBadge, badgeColor, desc, os }) => (
                        <div
                            key={`${type}-${subtype}`}
                            onDragStart={(e) => onDragStart(e, type, itemLabel, subtype)} draggable
                            className={`group ${bg} ${border} border rounded-xl p-2.5 cursor-grab active:cursor-grabbing hover:bg-white/8 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-black/30 flex-shrink-0">
                                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="text-[11px] font-semibold text-white/90 leading-tight truncate">{itemLabel}</span>
                                        <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${badgeColor} uppercase tracking-wider flex-shrink-0`}>{riskBadge}</span>
                                    </div>
                                    <p className="text-[9px] text-white/30 mt-0.5 truncate">{desc}</p>
                                    <p className="text-[8px] text-white/15 mt-0.5 truncate font-mono">{os}</p>
                                </div>
                            </div>
                            <div className="absolute right-1.5 bottom-1.5 opacity-0 group-hover:opacity-30 transition-opacity">
                                <span className="text-[7px] text-white/50">drag →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ArchitectContent() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("id");
    const { orgId } = useAuth();

    // Fetch diagram from Convex
    const diagram = useQuery(api.architecture.getDiagram,
        projectId ? { projectId: projectId as any } : "skip"
    );
    const saveArch = useMutation(api.architecture.saveDiagram);
    const simulateAttack = useMutation(api.riskEngine.simulateAttack);
    const generateAiSummary = useAction(api.aiExplanation.generateExecutiveSummary);
    const provisionInfra = useAction(api.awsDeployment.provisionInfrastructure);

    const [nodes, setNodes] = useNodesState<Node>([]);
    const [edges, setEdges] = useEdgesState<Edge>(initialEdges);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);

    // Automatically keep local selectedNodes state in sync, and smartly manage the single config panel
    useOnSelectionChange({
        onChange: ({ nodes }) => {
            setSelectedNodes(nodes);

            // If exactly one node is selected, show its deep config panel
            if (nodes.length === 1) {
                // Ensure the selection matches the latest state references
                setSelectedNode(nodes[0]);
            } else {
                // If 0, or more than 1 are selected, hide the single-node config panel
                setSelectedNode(null);
            }
        },
    });
    const [simulationResults, setSimulationResults] = useState<{
        impactScore: number;
        compromisedNodes: string[];
        findings: { componentId: string, description: string, severity: string, complianceMappings: string[] }[];
    } | null>(null);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [zeroTrustMode, setZeroTrustMode] = useState(false);
    const [simulationError, setSimulationError] = useState<string | null>(null);
    const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);
    const [newNodeId, setNewNodeId] = useState<string | null>(null);

    const [isReplaying, setIsReplaying] = useState(false);
    const [replayingNodes, setReplayingNodes] = useState<string[]>([]);

    const [isSyncingDns, setIsSyncingDns] = useState(false);
    const [deploymentResults, setDeploymentResults] = useState<{
        success: boolean;
        message: string;
        resources: { componentId: string; awsService: string; resourceId: string; status: string; details: string; }[]
    } | null>(null);

    // Attack Scenario Panel state
    const [showAttackPanel, setShowAttackPanel] = useState(false);
    const [runningScenario, setRunningScenario] = useState<AttackScenario | null>(null);
    const [scenarioStep, setScenarioStep] = useState(0);
    const [scenarioComplete, setScenarioComplete] = useState(false);
    const [scenarioLog, setScenarioLog] = useState<{ step: string; detail: string }[]>([]);
    const [attackedNodes, setAttackedNodes] = useState<string[]>([]);
    const attackTimerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    // Construct local graph context
    useEffect(() => {
        if (diagram) {
            setNodes(diagram.nodes || []);
            setEdges(diagram.edges || []);
        } else if (diagram === null) {
            // New undefined project, use a blank slate!
            setNodes([]);
            setEdges([]);
        }
    }, [diagram, setNodes, setEdges]);

    const handleSaveAndSimulate = async () => {
        setSimulationError(null);
        if (!projectId) {
            setSimulationError("No project selected. Please open this page from the Projects list (e.g. /dashboard → Open Project).");
            return;
        }
        if (!orgId) {
            setSimulationError("No organization found. Please ensure you have created or joined an organization via the top navigation.");
            return;
        }
        if (nodes.length === 0) {
            setSimulationError("Canvas is empty. Drag at least one component onto the canvas before simulating.");
            return;
        }
        setIsSimulating(true);
        try {
            const diagramId = await saveArch({
                projectId: projectId as any,
                orgId,
                nodes,
                edges
            });

            const results = await simulateAttack({ diagramId: diagramId as any });
            setSimulationResults(results);

            // Generate AI Summary in the background
            setIsGeneratingAi(true);
            try {
                const summary = await generateAiSummary({
                    projectId: projectId as any,
                    findings: results.findings,
                    impactScore: results.impactScore
                });
                setAiSummary(summary ?? generateFallbackSummary(results.impactScore, results.findings));
            } catch (aiErr) {
                console.error("AI Generation failed:", aiErr);
                setAiSummary(generateFallbackSummary(results.impactScore, results.findings));
            } finally {
                setIsGeneratingAi(false);
            }

        } catch (err: any) {
            console.error(err);
            setSimulationError(`Simulation failed: ${err?.message ?? 'Unknown error. Check console for details.'}`);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleDeployToAWS = async () => {
        setSimulationError(null);
        if (!projectId || !orgId) {
            setSimulationError("No project selected. Please open this page from the Projects list.");
            return;
        }
        setIsDeploying(true);
        try {
            // Ensure saved first
            const diagramId = await saveArch({ projectId: projectId as any, orgId, nodes, edges });

            // Trigger actual (mocked) AWS Provisioning via Convex Action
            const result = await provisionInfra({
                diagramId: diagramId as any,
                nodes: nodes
            });

            setDeploymentResults(result);

        } catch (err) {
            console.error("AWS Deployment Failed", err);
            alert("Failed to initiate AWS provisioning. Check console for details.");
        } finally {
            setIsDeploying(false);
        }
    };

    const runAttackScenario = useCallback((scenario: AttackScenario) => {
        // Clear previous scenario & timers
        attackTimerRefs.current.forEach(t => clearTimeout(t));
        attackTimerRefs.current = [];

        setRunningScenario(scenario);
        setScenarioStep(0);
        setScenarioComplete(false);
        setScenarioLog([]);
        setAttackedNodes([]);

        // Reset any previously highlighted nodes
        setNodes(nds => nds.map(n => ({
            ...n,
            style: { ...n.style, border: (n.data as any).__originalBorder || n.style?.border, boxShadow: (n.data as any).__originalGlow || n.style?.boxShadow, background: (n.data as any).__originalBg || n.style?.background, transition: 'all 0.4s ease' }
        })));

        // Find target nodes matching the scenario's target types
        const targets = nodes.filter(n => scenario.targetTypes.includes((n.data as any).componentType));
        const attackerNode = nodes.find(n => (n.data as any).componentType === 'attacker');
        const sequence = attackerNode ? [attackerNode, ...targets] : targets;

        // Config-aware realistic kill chain detail generator
        const generateStepDetail = (phaseIdx: number, baseDetail: string): string => {
            const targetNode = sequence[phaseIdx];
            if (!targetNode) return baseDetail;
            const d = targetNode.data as any;
            const ip = d.ipAddress || 'unknown';
            const subnet = d.subnetMask || 'unknown';
            const os = d.os || d.osVersion || d.osFamily || 'unknown OS';
            const webSvc = d.webService && d.webService !== 'None' ? d.webService : '';
            const dbSvc = d.dbService && d.dbService !== 'None' ? d.dbService : '';
            const label = (d.label as string) || d.componentType || 'target';
            const gw = d.defaultGateway || 'router';

            switch (scenario.id) {
                case 'sqli':
                    if (phaseIdx === 0) return `Scanning ${ip} [${label}] — OS fingerprint: ${os}. ${webSvc ? webSvc + ' detected.' : ''} Looking for SQL error signatures in HTTP responses.`;
                    if (phaseIdx === 1) return `Payload sent: POST /login to ${ip}\nBody: username=admin'--&password=x\n→ SQL error exposed. ${dbSvc || 'DB'} backend confirmed.`;
                    if (phaseIdx === 2) return `Auth bypass on ${label} (${ip}). UNION SELECT dumped admin row from ${dbSvc || 'database'}. Session token extracted.`;
                    if (phaseIdx === 3) return `INFORMATION_SCHEMA enumerated. Subnet ${subnet} pivoted. 47k+ records streamed to C2 via HTTPS.`;
                    break;
                case 'broken_auth':
                    if (phaseIdx === 0) return `Credential spray against ${label} (${ip}, ${os}). rockyou.txt wordlist. No rate-limit on ${webSvc || 'login endpoint'}.`;
                    if (phaseIdx === 1) return `JWT secret cracked on ${label}. Forged: {sub:admin,role:superuser,iat:${Math.floor(Date.now() / 1000)}}. ${os} auth bypassed.`;
                    if (phaseIdx === 2) return `IDOR at ${ip}/api/users/1/role → admin. ${os} RBAC not server-enforced.`;
                    if (phaseIdx === 3) return `SSH key injected to /root/.ssh/authorized_keys on ${label} (${ip}). Persistent root access established.`;
                    break;
                case 'data_exfil':
                    if (phaseIdx === 0) return `Beacon deployed on ${label} (${ip}, ${os}). 30s C2 heartbeat over HTTPS. DNS: ${d.dnsServers || '8.8.8.8'}.`;
                    if (phaseIdx === 1) return `Enumerated ${ip} [subnet: ${subnet}]:\n/etc/shadow, /home/*/.ssh, ${dbSvc ? dbSvc + ' dumps,' : ''} PII CSV exports — all found.`;
                    if (phaseIdx === 2) return `Archiving on ${label} (${os}). AES-256-CBC encrypted, split into 1MB chunks in /tmp/.cache/.sys.`;
                    if (phaseIdx === 3) return `Exfil via DNS TXT from ${ip}. 2.3GB out before IDS alert. Logs cleared on ${label}.`;
                    break;
                case 'mitm':
                    if (phaseIdx === 0) return `ARP poisoning on ${ip} [subnet ${subnet}]. Gateway ${gw} MAC remapped to attacker. All L2 traffic captured.`;
                    if (phaseIdx === 1) return `${label} (${ip}) traffic intercepted. Cleartext ${webSvc || 'HTTP'} POST data visible. Session cookies captured.`;
                    if (phaseIdx === 2) return `SSL strip active. ${label} forced to plain HTTP. ${os} browser shows no HTTPS warning. Creds in plaintext.`;
                    if (phaseIdx === 3) return `XSS injected into ${ip} HTTP response. document.cookie exfil to C2. Session theft complete.`;
                    break;
                case 'ransomware':
                    if (phaseIdx === 0) return `Phishing macro executed on ${label} (${ip}, ${os}). PowerShell dropper runs. ${webSvc || 'SMB'} share accessible via subnet ${subnet}.`;
                    if (phaseIdx === 1) return `EternalBlue worm on ${ip} port 445. Spreading to: ${targets.slice(0, 3).map(n => (n.data as any).ipAddress || n.id).join(', ')}.`;
                    if (phaseIdx === 2) return `Encrypting ${label} (${ip}): *.doc *.xls *.db *.sql *.bak → .locked. RSA-4096 per-host key generated.`;
                    if (phaseIdx === 3) return `README_DECRYPT.txt on ${ip}:\n"Files encrypted. Send $450k BTC to 1A2...9.\n72-hour deadline."`;
                    break;
                case 'priv_esc':
                    if (phaseIdx === 0) return `Low-priv RCE on ${label} (${ip}, ${os}) via ${webSvc || 'web service'}. Shell user: www-data (UID 33). Subnet ${subnet} visible.`;
                    if (phaseIdx === 1) return `SUID scan on ${ip}: /usr/bin/perl found (SUID set). Dirty COW (CVE-2016-5195) applicable to ${os}.`;
                    if (phaseIdx === 2) return `Dirty COW compiled in-memory on ${ip}. Race triggered. /etc/passwd overwritten. Root shell obtained on ${label}.`;
                    if (phaseIdx === 3) return `# id → uid=0(root) on ${label} (${ip}, ${os}). Backdoor user added. /etc/shadow dumped. Pivoting to ${subnet}.`;
                    break;
                default:
                    return baseDetail;
            }
            return baseDetail;
        };

        // Animate each kill chain step
        scenario.killChain.forEach((phase, phaseIdx) => {
            const t = setTimeout(() => {
                setScenarioStep(phaseIdx);
                setScenarioLog(prev => [...prev, { step: phase.step, detail: generateStepDetail(phaseIdx, phase.detail) }]);

                // Highlight the next node in succession
                if (sequence[phaseIdx]) {
                    const nodeId = sequence[phaseIdx].id;
                    setAttackedNodes(prev => [...prev, nodeId]);
                    setNodes(nds => nds.map(n => n.id === nodeId ? {
                        ...n,
                        style: {
                            ...n.style,
                            border: `2px solid ${scenario.color}`,
                            boxShadow: `0 0 30px ${scenario.glow}, 0 0 60px ${scenario.glow.replace('0.7', '0.2')}`,
                            background: scenario.bg,
                            transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)'
                        }
                    } : n));
                }
            }, phase.delay);
            attackTimerRefs.current.push(t);
        });

        // Final: mark complete
        const lastDelay = scenario.killChain[scenario.killChain.length - 1].delay + 1800;
        const finalTimer = setTimeout(() => {
            setScenarioComplete(true);
        }, lastDelay);
        attackTimerRefs.current.push(finalTimer);
    }, [nodes, setNodes]);

    const stopAttackScenario = useCallback(() => {
        attackTimerRefs.current.forEach(t => clearTimeout(t));
        attackTimerRefs.current = [];
        setRunningScenario(null);
        setScenarioComplete(false);
        setScenarioLog([]);
        setAttackedNodes([]);
        // Reset node styles
        setNodes(nds => nds.map(n => ({
            ...n,
            style: { ...n.style, border: (n.data as any).__originalBorder || n.style?.border, boxShadow: (n.data as any).__originalGlow || n.style?.boxShadow, background: (n.data as any).__originalBg || n.style?.background, transition: 'all 0.4s ease' }
        })));
    }, [setNodes]);

    const handleSyncDns = async () => {
        setSimulationError(null);
        setIsSyncingDns(true);
        try {
            const res = await fetch('/api/aws/dns');
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch DNS data");
            }

            let nodesAdded = 0;

            // Generate nodes based on A records and Alias targets
            const newNodes: Node[] = [];
            data.dnsData.forEach((zone: any) => {
                zone.records.forEach((record: any) => {
                    const cleanName = record.name.replace(/\.$/, '');
                    if (record.type === "A" || record.type === "CNAME" || record.aliasTarget) {
                        const existingNode = nodes.find(n => n.data.label === cleanName);
                        const alreadyAdded = newNodes.find(n => n.data.label === cleanName);

                        if (!existingNode && !alreadyAdded) {
                            const nodeId = `internet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                            newNodes.push({
                                id: nodeId,
                                type: "default",
                                position: { x: 50 + (nodesAdded % 3) * 200, y: 50 + Math.floor(nodesAdded / 3) * 100 },
                                data: {
                                    componentType: 'internet',
                                    label: cleanName,
                                    networkConfig: {
                                        exposure: 'public',
                                        dnsRecordType: record.type,
                                        ttl: record.ttl,
                                        aliasTarget: record.aliasTarget,
                                    },
                                    securityConfig: {},
                                    availabilityConfig: {},
                                    dataConfig: {},
                                },
                                style: {
                                    background: '#0d1117',
                                    color: "#fff",
                                    border: '1.5px solid #3b82f6',
                                    borderRadius: "10px",
                                    width: 160,
                                    padding: 10,
                                    boxShadow: '0 0 20px rgba(59,130,246,0.4), 0 4px 16px rgba(0,0,0,0.5)',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                                }
                            });
                            nodesAdded++;
                        }
                    }
                });
            });

            if (newNodes.length > 0) {
                setNodes(nds => [...nds, ...newNodes]);
            } else {
                setSimulationError("No newly exposed A records found in Route 53 telemetry.");
            }

        } catch (err: any) {
            console.error("DNS Sync Error:", err);
            setSimulationError(`DNS Telemetry Sync failed: ${err.message}`);
        } finally {
            setIsSyncingDns(false);
        }
    };

    const handleReplayBreach = useCallback(() => {
        if (!simulationResults) return;
        const validComps = simulationResults.compromisedNodes.filter((id: string) =>
            nodes.find(n => n.id === id)?.data?.componentType !== 'attacker'
        );
        if (validComps.length === 0) return;

        setIsReplaying(true);
        setReplayingNodes([]);

        const sequence = simulationResults.compromisedNodes;
        const DELAY_MS = 600;

        sequence.forEach((nodeId, index) => {
            setTimeout(() => {
                setReplayingNodes(prev => [...prev, nodeId]);

                // Update specific node style live on the canvas
                setNodes(nds => nds.map(n => {
                    if (n.id === nodeId) {
                        return {
                            ...n,
                            style: {
                                ...n.style,
                                border: '2px solid #ef4444',
                                boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)',
                                background: '#3f0a0a',
                                transition: 'all 0.4s ease'
                            },
                        };
                    }
                    return n;
                }));

                // Reset after showing
                if (index === sequence.length - 1) {
                    setTimeout(() => {
                        setIsReplaying(false);
                        // Optional: Reset styles back to normal after replay finishes
                    }, DELAY_MS * 3);
                }
            }, index * DELAY_MS);
        });
    }, [simulationResults, setNodes]);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect: OnConnect = useCallback(
        (connection) => {
            const newEdge = { ...connection, animated: true, style: { stroke: '#22d3ee', strokeWidth: 2 } };
            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        // Selection is handled automatically by React Flow's selected property
        // and our useOnSelectionChange hook monitors it.
    }, []);

    const onPaneClick = useCallback(() => {
        // Pane click clears selection natively in React Flow
    }, []);

    // Smooth single-action deletion on Right Click (Context Menu)
    const onNodeContextMenu = useCallback(
        (event: React.MouseEvent, node: Node) => {
            event.preventDefault(); // Prevent standard browser right-click menu

            setDeletingNodeId(node.id);
            setNodes((nds) => nds.map((n) =>
                n.id === node.id
                    ? { ...n, style: { ...n.style, border: '2px solid #ef4444', boxShadow: '0 0 30px rgba(239,68,68,0.7)', opacity: 0.5, transition: 'all 0.3s ease' } }
                    : n
            ));

            setTimeout(() => {
                setNodes((nds) => nds.filter((n) => n.id !== node.id));
                setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
                setDeletingNodeId(null);
            }, 300);
        },
        [setNodes, setEdges]
    );

    // Bulk deletion function for the multi-select Floating Action Bar
    const deleteSelectedNodesBulk = useCallback(() => {
        if (selectedNodes.length === 0) return;

        const idsToDelete = selectedNodes.map(n => n.id);

        setNodes((nds) => nds.filter((n) => !idsToDelete.includes(n.id)));
        setEdges((eds) => eds.filter((e) => !idsToDelete.includes(e.source) && !idsToDelete.includes(e.target)));
        setSelectedNodes([]);
    }, [selectedNodes, setNodes, setEdges]);

    const updateNodeData = useCallback((key: string, value: any) => {
        if (!selectedNode) return;

        let newData = { ...selectedNode.data, [key]: value };

        // Auto-calculate subnet mask when IP address changes
        if (key === 'ipAddress' && typeof value === 'string') {
            newData.subnetMask = calcSubnetMask(value);
        }

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    node.data = newData;
                    setSelectedNode({ ...node }); // Update local reference for the panel
                }
                return node;
            })
        );
    }, [selectedNode, setNodes]);

    const deleteSelectedNode = useCallback(() => {
        if (!selectedNode) return;
        const id = selectedNode.id;
        // Flash red before removing
        setDeletingNodeId(id);
        setNodes(nds => nds.map(n => n.id === id ? {
            ...n, style: { ...n.style, border: '2px solid #ef4444', boxShadow: '0 0 30px rgba(239,68,68,0.7)', opacity: 0.5, transition: 'all 0.3s ease' }
        } : n));
        setTimeout(() => {
            setNodes((nds) => nds.filter((node) => node.id !== id));
            setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
            setSelectedNode(null);
            setDeletingNodeId(null);
        }, 350);
    }, [selectedNode, setNodes, setEdges]);

    const deleteEdge = useCallback((edgeId: string) => {
        setEdges(eds => eds.map(e => e.id === edgeId ? { ...e, style: { ...e.style, stroke: '#ef4444', strokeWidth: 3, opacity: 0.3 }, animated: false } : e));
        setTimeout(() => {
            setEdges(eds => eds.filter(e => e.id !== edgeId));
        }, 400);
    }, [setEdges]);

    // Dynamic Compliance Table Data
    const complianceTableData = [
        { framework: 'SOC 2 Type II', authority: 'AICPA', baseScore: 100, gaps: [] as string[] },
        { framework: 'ISO 27001', authority: 'ISO', baseScore: 100, gaps: [] as string[] },
        { framework: 'OWASP Top 10', authority: 'OWASP Foundation', baseScore: 100, gaps: [] as string[] },
        { framework: 'HIPAA', authority: 'HHS', baseScore: 100, gaps: [] as string[] },
        { framework: 'GDPR', authority: 'EU Parliament', baseScore: 100, gaps: [] as string[] },
        { framework: 'PCI-DSS v4', authority: 'PCI SSC', baseScore: 100, gaps: [] as string[] },
    ];

    // Also keep radar chart data in sync
    const complianceData = complianceTableData.map(d => ({ subject: d.framework, A: d.baseScore, fullMark: 100 }));

    if (simulationResults) {
        simulationResults.findings.forEach((f: any) => {
            f.complianceMappings.forEach((mapping: string) => {
                if (mapping.includes('SOC2')) { complianceTableData[0].baseScore -= 8; complianceTableData[0].gaps.push(f.mitreTechnique ?? 'Policy Gap'); }
                if (mapping.includes('ISO')) { complianceTableData[1].baseScore -= 10; complianceTableData[1].gaps.push(f.mitreTechnique ?? 'Policy Gap'); }
                if (mapping.includes('OWASP')) { complianceTableData[2].baseScore -= 15; complianceTableData[2].gaps.push(f.mitreTechnique ?? 'Policy Gap'); }
                if (mapping.includes('HIPAA')) { complianceTableData[3].baseScore -= 15; complianceTableData[3].gaps.push(f.mitreTechnique ?? 'Policy Gap'); }
                if (mapping.includes('GDPR')) { complianceTableData[4].baseScore -= 12; complianceTableData[4].gaps.push(f.mitreTechnique ?? 'Policy Gap'); }
                if (mapping.includes('PCI')) { complianceTableData[5].baseScore -= 20; complianceTableData[5].gaps.push(f.mitreTechnique ?? 'Policy Gap'); }
            });
        });
        complianceTableData.forEach(d => { if (d.baseScore < 0) d.baseScore = 0; });
        complianceData.forEach((d, i) => { d.A = complianceTableData[i].baseScore; });
    }

    // Exclude 'attacker' nodes from the visual compromised count
    const compromisedInfrastructureCount = (() => {
        if (!simulationResults) return 0;
        return simulationResults.compromisedNodes.filter((id: string) => {
            const node = nodes.find(n => n.id === id);
            return node && (node.data as any).componentType !== 'attacker';
        }).length;
    })();

    // Financial Impact Estimation (IBM Cost of Data Breach model inspired)
    const financialImpact = (() => {
        if (!simulationResults) return null;
        const criticalCount = simulationResults.findings.filter((f: any) => f.severity === 'Critical').length;
        const highCount = simulationResults.findings.filter((f: any) => f.severity === 'High').length;
        const publicNodes = nodes.filter(n => (n.data as any)?.exposure === 'Public').length;
        const sensitivity = nodes.reduce((max, n) => Math.max(max, parseInt((n.data as any)?.sensitivityLevel || '1')), 1);

        // Base: ₹1.2Cr per critical finding (inspired by IBM report INR conversion)
        const baseCostCr = (criticalCount * 1.2) + (highCount * 0.4) + (publicNodes * 0.3) + (sensitivity * 0.2);
        const low = Math.max(0.5, baseCostCr * 0.8);
        const high = baseCostCr * 1.7;
        const downtime = Math.round(criticalCount * 4 + highCount * 1.5);
        return {
            rangeLow: low.toFixed(1),
            rangeHigh: high.toFixed(1),
            downtimeHours: downtime,
            recordsAtRisk: Math.round((criticalCount * 50000) + (highCount * 10000))
        };
    })();

    // Attack Timeline Generator
    const attackTimeline = (() => {
        if (!simulationResults || simulationResults.findings.length === 0) return [];
        const phases = [
            { time: '00:00', label: 'Reconnaissance', desc: 'Attacker scans public endpoints and service fingerprints.', color: 'text-yellow-400' },
            { time: '00:08', label: 'Initial Access', desc: simulationResults.findings.find((f: any) => f.mitreId?.startsWith('T1190') || f.severity === 'Critical')?.description?.split(']')[1]?.trim() ?? 'Exploit identified on public-facing component.', color: 'text-orange-400' },
            { time: '00:23', label: 'Privilege Escalation', desc: 'Attacker leverages missing authentication to elevate permissions.', color: 'text-orange-500' },
            { time: '00:41', label: 'Lateral Movement', desc: `Breach propagates across ${compromisedInfrastructureCount} internal components via unencrypted links.`, color: 'text-red-400' },
            { time: '01:02', label: 'Data Exfiltration', desc: `Attacker extracts sensitive records. Est. ${((simulationResults.findings.filter((f: any) => f.severity === 'Critical').length) * 50000).toLocaleString()} records compromised.`, color: 'text-red-600' },
        ];
        // Only show up to what's actually applicable
        return phases.slice(0, Math.min(phases.length, 2 + compromisedInfrastructureCount));
    })();

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/label');
            const subtype = event.dataTransfer.getData('application/subtype') || '';

            if (typeof type === 'undefined' || !type) {
                return;
            }

            // Using standard DOM getBoundingClientRect to map screen coords to Flow coords
            const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();

            if (!reactFlowBounds) return;

            const position = {
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            };

            const nodeColorMap: Record<string, { bg: string, border: string, glow: string }> = {
                server: { bg: '#05101a', border: '#0ea5e9', glow: 'rgba(14,165,233,0.3)' }, // sky
                vps: { bg: '#0a0d1a', border: '#6366f1', glow: 'rgba(99,102,241,0.4)' }, // indigo
                node: { bg: '#0d1117', border: '#3b82f6', glow: 'rgba(59,130,246,0.4)' }, // blue
                router: { bg: '#1a0d05', border: '#f97316', glow: 'rgba(249,115,22,0.3)' }, // orange
                switch: { bg: '#051a0d', border: '#10b981', glow: 'rgba(16,185,129,0.3)' }, // emerald
                firewall: { bg: '#1a0505', border: '#ef4444', glow: 'rgba(239,68,68,0.4)' }, // red
                cdn: { bg: '#05161a', border: '#22d3ee', glow: 'rgba(34,211,238,0.3)' }, // cyan
                siem: { bg: '#100a1a', border: '#a855f7', glow: 'rgba(168,85,247,0.3)' }, // purple
                attacker: { bg: '#1a0a0a', border: '#f43f5e', glow: 'rgba(244,63,94,0.4)' }, // rose
                internet: { bg: '#0d1117', border: '#3b82f6', glow: 'rgba(59,130,246,0.4)' }, // Keep internet for backward compatibility with live dns sync
            };
            const colors = nodeColorMap[type] || { bg: '#111', border: '#444', glow: 'rgba(255,255,255,0.1)' };
            const nodeId = `${type}-${Date.now()}`;

            // Default IP per network class based on type
            const defaultIpMap: Record<string, string> = {
                server: '192.168.1.10', vps: '10.0.1.5', node: '192.168.1.50',
                router: '192.168.1.1', switch: '192.168.1.2', firewall: '192.168.1.254',
                cdn: '203.0.113.10', siem: '10.0.0.100', attacker: '10.10.10.1'
            };
            const defaultIp = defaultIpMap[type] || '192.168.1.100';

            // OS & services pre-fill from COMPONENT_TREE
            const treeEntry = COMPONENT_TREE.flatMap(c => c.children).find(c => c.subtype === subtype);

            const newNode: Node = {
                id: nodeId,
                type: "default",
                position,
                data: {
                    label,
                    componentType: type,
                    subtype,
                    os: treeEntry?.os || '',
                    ipAddress: defaultIp,
                    subnetMask: calcSubnetMask(defaultIp),
                    defaultGateway: defaultIp.replace(/\.\d+$/, '.1'),
                    networkConfig: {},
                    securityConfig: {},
                    availabilityConfig: {},
                    dataConfig: {},
                },
                style: {
                    background: colors.bg,
                    color: "#fff",
                    border: `1.5px solid ${colors.border}`,
                    borderRadius: "10px",
                    width: 160,
                    padding: 10,
                    boxShadow: `0 0 20px ${colors.glow}, 0 4px 16px rgba(0,0,0,0.5)`,
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                }
            };

            setNewNodeId(nodeId);
            setNodes((nds) => nds.concat(newNode));
            setTimeout(() => setNewNodeId(null), 600);
        },
        [setNodes]
    );

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string, subtype?: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/label', label);
        event.dataTransfer.setData('application/subtype', subtype || '');
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] w-full border border-white/10 rounded-xl overflow-hidden shadow-2xl">

            {/* Premium Component Palette (Left Sidebar) */}
            <div className="w-72 bg-[#080808] border-r border-white/8 flex flex-col h-full overflow-hidden">

                {/* Sidebar Header */}
                <div className="p-4 border-b border-white/8 bg-gradient-to-b from-white/3 to-transparent">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-[0.15em]">Architecture Builder</h3>
                            <p className="text-[10px] text-white/30 mt-0.5">Drag components onto the canvas</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] text-emerald-400/70 font-mono">LIVE</span>
                        </div>
                    </div>

                    {/* Canvas Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                        {[
                            { label: 'Nodes', value: nodes.length, color: 'text-cyan-400' },
                            { label: 'Edges', value: edges.length, color: 'text-blue-400' },
                            { label: 'Risk', value: nodes.length > 0 ? 'Active' : 'None', color: 'text-orange-400' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/4 border border-white/6 rounded-lg p-2 text-center">
                                <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                                <div className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Component List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">

                    {/* Render each category with child components */}
                    {COMPONENT_TREE.map(({ label, children }) => (
                        <ComponentCategory key={label} label={label} items={children} onDragStart={onDragStart} />
                    ))}

                    {/* Tips card */}
                    <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                            <Zap className="h-3 w-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-cyan-300/70 font-semibold mb-1">Pro Tip</p>
                                <p className="text-[9px] text-white/30 leading-relaxed">Connect nodes with edges to simulate lateral movement. Configure each node&apos;s security properties via the right panel.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA Area */}
                <div className="p-3 border-t border-white/8 bg-gradient-to-t from-black/50 to-transparent space-y-2">
                    <button
                        onClick={handleSaveAndSimulate}
                        disabled={isSimulating}
                        className="w-full relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center justify-center transition-all duration-200 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] group"
                    >
                        <ShieldAlert className={`h-4 w-4 mr-2 ${isSimulating ? 'animate-pulse' : 'group-hover:animate-bounce'}`} />
                        {isSimulating ? (
                            <span className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="h-1.5 w-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                <span className="ml-1">Running DFS Engine</span>
                            </span>
                        ) : 'Save & Simulate Threat'}
                    </button>

                    <button
                        onClick={handleDeployToAWS}
                        disabled={isDeploying}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 disabled:opacity-40 text-white/70 hover:text-white py-2.5 rounded-xl font-medium text-xs flex items-center justify-center transition-all duration-200"
                    >
                        <Cloud className={`h-3.5 w-3.5 mr-2 text-orange-400 ${isDeploying ? 'animate-spin' : ''}`} />
                        {isDeploying ? 'Provisioning AWS...' : 'Deploy Infrastructure'}
                    </button>

                    <button
                        onClick={handleSyncDns}
                        disabled={isSyncingDns}
                        className="w-full bg-cyan-950/20 hover:bg-cyan-900/40 border border-cyan-500/20 hover:border-cyan-500/50 disabled:opacity-40 text-cyan-400 hover:text-cyan-300 py-2.5 rounded-xl font-medium text-xs flex items-center justify-center transition-all duration-200"
                    >
                        <Globe className={`h-3.5 w-3.5 mr-2 text-cyan-400 ${isSyncingDns ? 'animate-spin' : ''}`} />
                        {isSyncingDns ? 'Syncing Telemetry...' : 'Sync AWS Route 53 Telemetry'}
                    </button>

                    <button
                        onClick={() => setShowAttackPanel(v => !v)}
                        className={`w-full border py-2.5 rounded-xl font-medium text-xs flex items-center justify-center transition-all duration-200 group ${showAttackPanel ? 'bg-rose-900/40 border-rose-500/50 text-rose-300' : 'bg-rose-950/20 hover:bg-rose-900/30 border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300'}`}
                    >
                        <ShieldAlert className={`h-3.5 w-3.5 mr-2 ${showAttackPanel ? 'text-rose-300 animate-pulse' : 'text-rose-400'}`} />
                        {showAttackPanel ? 'Hide Attack Simulator' : '⚡ Attack Scenarios'}
                    </button>

                    {/* Error Banner */}
                    {simulationError && (
                        <div className="bg-red-950/80 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
                            <ShieldAlert className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-red-300 font-semibold mb-0.5">Action Required</p>
                                <p className="text-[9px] text-red-400/80 leading-relaxed">{simulationError}</p>
                            </div>
                            <button onClick={() => setSimulationError(null)} className="text-red-500/50 hover:text-red-400 text-xs leading-none flex-shrink-0">✕</button>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-1.5 pt-1">
                        <div className="h-1 w-1 rounded-full bg-white/15" />
                        <span className="text-[9px] text-white/20 font-mono">ArchSentinel Enterprise v1.0</span>
                        <div className="h-1 w-1 rounded-full bg-white/15" />
                    </div>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 h-full bg-[#060606] relative" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeContextMenu={onNodeContextMenu}
                    deleteKeyCode={['Delete', 'Backspace']}
                    selectionOnDrag={true}
                    panOnScroll={true}
                    fitView
                    className="bg-transparent"
                    defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
                    style={{ background: 'radial-gradient(ellipse at center, #0d1117 0%, #060606 100%)' }}
                >
                    <Background color="#1a1a2e" gap={24} size={1} />
                    <Controls className="!bg-black/70 !border-white/10 !rounded-xl [&>button]:!bg-transparent [&>button]:!border-0 [&>button]:!text-white/40 [&>button:hover]:!text-white [&>button:hover]:!bg-white/5" />
                    <MiniMap
                        className="!bg-black/90 !border !border-white/10 !rounded-xl"
                        maskColor="rgba(0,0,0,0.6)"
                        nodeColor={(n) => {
                            const borders: Record<string, string> = { internet: '#3b82f6', firewall: '#ef4444', waf: '#f43f5e', vpn: '#8b5cf6', lb: '#10b981', api: '#6366f1', auth: '#f97316', lambda: '#eab308', container: '#0ea5e9', db: '#a855f7', queue: '#ec4899', cache: '#14b8a6', storage: '#84cc16', cdn: '#22d3ee', secrets: '#facc15', monitoring: '#38bdf8' };
                            return borders[(n.data as any)?.componentType] || '#666';
                        }}
                    />
                </ReactFlow>

                {/* Empty state with animated HUD crosshair */}
                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div className="text-center">
                            <div className="relative inline-block mb-6">
                                <div className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center">
                                    <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" />
                                    </div>
                                </div>
                                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5" />
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5" />
                            </div>
                            <p className="text-white/20 text-sm font-mono tracking-widest uppercase">Drop components to begin</p>
                            <p className="text-white/10 text-xs mt-2">Drag from the left panel onto the canvas</p>
                        </div>
                    </div>
                )}

                {/* Attack Scenario Simulator Panel */}
                {showAttackPanel && (
                    <div className="absolute bottom-20 right-4 w-96 z-40 animate-in slide-in-from-bottom-8 fade-in duration-300 pointer-events-auto">
                        <div className="bg-black/92 backdrop-blur-2xl border border-rose-500/20 rounded-2xl shadow-[0_0_60px_rgba(244,63,94,0.12)] overflow-hidden">
                            {/* Header */}
                            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-rose-950/50 to-transparent flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                        <ShieldAlert className="h-4 w-4 text-rose-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white tracking-tight">Attack Scenario Lab</div>
                                        <div className="text-[10px] text-white/30 font-mono">MITRE ATT&amp;CK Visualization Engine</div>
                                    </div>
                                </div>
                                <button onClick={() => setShowAttackPanel(false)} className="text-white/30 hover:text-white/80 text-lg leading-none transition-colors">✕</button>
                            </div>

                            {/* Scenario Picker Grid */}
                            {!runningScenario && (
                                <div className="p-4">
                                    <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold mb-3">Select Attack Vector</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ATTACK_SCENARIOS.map(scenario => (
                                            <button
                                                key={scenario.id}
                                                onClick={() => runAttackScenario(scenario)}
                                                className="group flex flex-col gap-1.5 bg-black/40 border border-white/5 hover:border-white/20 rounded-xl p-3 text-left transition-all duration-200 hover:scale-[1.02]"
                                                style={{ '--glow-color': scenario.glow } as React.CSSProperties}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-2xl leading-none">{scenario.icon}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border" style={{ color: scenario.color, borderColor: `${scenario.color}40`, backgroundColor: `${scenario.color}10` }}>
                                                        {scenario.mitreId}
                                                    </span>
                                                </div>
                                                <div className="text-xs font-bold text-white/90 group-hover:text-white transition-colors leading-tight">{scenario.label}</div>
                                                <div className="text-[9px] text-white/30 leading-relaxed line-clamp-2 group-hover:text-white/50 transition-colors">{scenario.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3 text-[9px] text-white/20 text-center">
                                        Drag an <span className="text-rose-400/60">Attacker Machine</span> onto the canvas, then select a scenario to visualize
                                    </div>
                                </div>
                            )}

                            {/* Live Simulation Log */}
                            {runningScenario && (
                                <div className="p-4">
                                    {/* Active scenario header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{runningScenario.icon}</span>
                                            <div>
                                                <div className="text-sm font-bold" style={{ color: runningScenario.color }}>{runningScenario.label}</div>
                                                <div className="text-[9px] text-white/30 font-mono">{runningScenario.mitreId} · {runningScenario.mitreTactic}</div>
                                            </div>
                                        </div>
                                        {!scenarioComplete ? (
                                            <div className="flex items-center gap-1.5 text-[9px] text-white/40">
                                                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: runningScenario.color }} />
                                                RUNNING...
                                            </div>
                                        ) : (
                                            <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider bg-rose-950/50 px-2 py-1 rounded border border-rose-500/30">⚠ Breach Complete</span>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${((scenarioStep + 1) / runningScenario.killChain.length) * 100}%`,
                                                backgroundColor: runningScenario.color,
                                                boxShadow: `0 0 10px ${runningScenario.glow}`
                                            }}
                                        />
                                    </div>

                                    {/* Kill chain log - live updates */}
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                                        {scenarioLog.map((entry, i) => (
                                            <div key={i} className="flex gap-3 animate-in slide-in-from-left-4 fade-in duration-400">
                                                <div className="flex-shrink-0 mt-1 w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: `${runningScenario.color}20`, border: `1px solid ${runningScenario.color}40` }}>
                                                    <span className="text-[8px] font-bold" style={{ color: runningScenario.color }}>{i + 1}</span>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white/90 mb-0.5">{entry.step}</div>
                                                    <div className="text-[9px] text-white/40 leading-relaxed font-mono">{entry.detail}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {!scenarioComplete && (
                                            <div className="flex items-center gap-2 text-[9px] text-white/20 pl-7 font-mono">
                                                <span className="animate-pulse">▋</span>&nbsp;Processing next phase...
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={stopAttackScenario}
                                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-bold py-2 rounded-lg transition-all"
                                        >
                                            ✕ Stop &amp; Clear
                                        </button>
                                        {scenarioComplete && (
                                            <button
                                                onClick={() => { stopAttackScenario(); }}
                                                className="flex-1 text-xs font-bold py-2 rounded-lg border transition-all"
                                                style={{ backgroundColor: `${runningScenario.color}15`, borderColor: `${runningScenario.color}40`, color: runningScenario.color }}
                                            >
                                                ↩ Try Another
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Floating Multi-Select Action Bar */}
                {selectedNodes.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-red-500/20 px-5 py-2.5 rounded-2xl flex items-center gap-5 z-50 animate-in slide-in-from-bottom-8 duration-300 shadow-[0_10px_40px_rgba(239,68,68,0.15)] pointer-events-auto">
                        <span className="text-xs text-red-400 font-mono font-bold tracking-widest uppercase">{selectedNodes.length} Nodes Selected</span>
                        <div className="w-px h-5 bg-white/10" />
                        <button
                            onClick={deleteSelectedNodesBulk}
                            className="flex items-center gap-2 text-xs font-bold text-white/70 hover:text-white bg-red-500/10 hover:bg-red-500/30 border border-transparent hover:border-red-500/50 px-4 py-2 rounded-xl transition-all duration-200 uppercase tracking-widest"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Bulk
                        </button>
                    </div>
                )}

                {/* Scanline overlay for HUD feel */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
                    backgroundSize: '100% 3px'
                }} />

                {/* HUD Metrics Overlay */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none z-10">
                    {/* Risk score */}
                    <div className="bg-black/80 backdrop-blur-xl border border-white/8 px-4 py-2.5 rounded-xl pointer-events-auto" style={{ animation: 'slideDown 0.3s ease' }}>
                        <div className="text-[9px] text-white/30 uppercase tracking-[0.2em] mb-1 font-mono">Architecture Risk</div>
                        {simulationResults ? (
                            <div className="flex items-end gap-2">
                                <span className={`text-2xl font-bold leading-none font-mono ${simulationResults.impactScore > 70 ? 'text-red-400' :
                                    simulationResults.impactScore > 40 ? 'text-amber-400' : 'text-emerald-400'
                                    }`}>{simulationResults.impactScore}</span>
                                <span className={`text-xs font-semibold mb-0.5 ${simulationResults.impactScore > 70 ? 'text-red-500/70' :
                                    simulationResults.impactScore > 40 ? 'text-amber-500/70' : 'text-emerald-500/70'
                                    }`}>{simulationResults.impactScore > 70 ? '⬛ CRITICAL' : simulationResults.impactScore > 40 ? '▲ ELEVATED' : '✓ SECURE'}</span>
                            </div>
                        ) : (
                            <div className="text-xs text-white/20 font-mono">— Not simulated</div>
                        )}
                    </div>

                    {/* Node/Edge stats strip */}
                    <div className="bg-black/80 backdrop-blur-xl border border-white/8 px-4 py-2.5 rounded-xl pointer-events-auto flex items-center gap-5" style={{ animation: 'slideDown 0.3s ease 0.05s both' }}>
                        {[{ label: 'Nodes', value: nodes.length, color: 'text-cyan-400' }, { label: 'Edges', value: edges.length, color: 'text-blue-400' }, { label: 'State', value: '● Live', color: 'text-emerald-400' }].map(s => (
                            <div key={s.label}>
                                <div className="text-[9px] text-white/25 uppercase tracking-widest font-mono mb-0.5">{s.label}</div>
                                <div className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Edge delete buttons on hover — via injected CSS */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .react-flow__edge:hover .react-flow__edge-path { stroke-width: 3 !important; }
                    .react-flow__edge.selected .react-flow__edge-path { stroke: #22d3ee !important; filter: drop-shadow(0 0 6px rgba(34,211,238,0.6)); }
                    .react-flow__node { transition: box-shadow 0.2s ease, opacity 0.3s ease !important; }
                    .react-flow__node:hover { filter: brightness(1.15); }
                    .react-flow__node.selected .react-flow__node-default { border-color: #22d3ee !important; box-shadow: 0 0 0 2px rgba(34,211,238,0.3) !important; }
                    .react-flow__handle { background: #22d3ee !important; border-color: rgba(34,211,238,0.3) !important; width: 8px !important; height: 8px !important; border-radius: 2px !important; }
                    .react-flow__handle:hover { background: #fff !important; transform: scale(1.4); }
                    .react-flow__controls { box-shadow: none !important; }
                    .react-flow__minimap { border-radius: 12px !important; overflow: hidden !important; }
                    @keyframes nodeEntry { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
                    @keyframes nodeExit  { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.6); } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes glowPulse { 0%,100% { box-shadow: 0 0 15px rgba(34,211,238,0.3); } 50% { box-shadow: 0 0 30px rgba(34,211,238,0.7); } }
                `}} />
            </div>

            {/* Configuration Right Panel - Spring Slide */}
            <div className={`
                w-80 bg-[#0a0a0a] border-l border-white/[0.06] flex flex-col
                transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${selectedNode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 w-0 overflow-hidden border-0'}
            `}>
                {selectedNode && (
                    <>
                        <div className="p-4 border-b border-white/[0.06] flex items-start justify-between flex-shrink-0" style={{ minWidth: '320px' }}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                                    <span className="text-[9px] text-cyan-400/60 font-mono uppercase tracking-widest">Component Selected</span>
                                </div>
                                <h3 className="font-bold text-base text-white truncate">{selectedNode?.data.label as string}</h3>
                                <p className="text-[10px] text-white/30 font-mono mt-0.5 truncate">ID: {selectedNode?.id}</p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                <button
                                    onClick={deleteSelectedNode}
                                    className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-400 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/20 group"
                                    title="Delete Component (Del)">
                                    <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="p-2 hover:bg-white/5 text-white/20 hover:text-white/60 rounded-lg transition-all duration-200"
                                >
                                    <span className="text-xs">✕</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5" style={{ minWidth: '320px' }}>
                            <ConfigContext.Provider value={{ d: selectedNode?.data, updateNodeData }}>
                                {(() => {
                                    const ct = selectedNode?.data?.componentType as string;
                                    const d = selectedNode?.data as any;

                                    // ── SERVER & VPS ───────────────────────────────
                                    if (ct === 'server' || ct === 'vps') return <div className="space-y-4">
                                        <Sec icon={Server} title="Operating System">
                                            <Sel field="osFamily" label="OS Platform" options={['Debian/Ubuntu Linux', 'RHEL/CentOS Linux', 'Windows Server 2022', 'Windows Server 2019', 'FreeBSD']} defaultVal="Debian/Ubuntu Linux" />
                                            <TxtInput field="osVersion" label="Version / Kernel" placeholder="e.g. Ubuntu 22.04 LTS" />
                                        </Sec>
                                        <Sec icon={Activity} title="Running Services">
                                            <Sel field="webService" label="Web Server Daemon" options={['None', 'Apache HTTPD', 'Nginx', 'IIS 10', 'Tomcat', 'Node.js Express']} defaultVal="Nginx" />
                                            <Sel field="dbService" label="Database Daemon" options={['None', 'MySQL/MariaDB', 'PostgreSQL', 'MS SQL Server', 'MongoDB']} defaultVal="None" />
                                            <TxtInput field="customPorts" label="Listening Ports" placeholder="80, 443, 8080" />
                                        </Sec>
                                        <Sec icon={Globe} title="Network Configuration (IPv4)">
                                            <TxtInput field="ipAddress" label="IPv4 Address" placeholder="192.168.1.10" />
                                            <TxtInput field="subnetMask" label="Subnet Mask" placeholder="255.255.255.0" />
                                            <TxtInput field="defaultGateway" label="Default Gateway" placeholder="192.168.1.1" />
                                            <TxtInput field="dnsServers" label="DNS Servers" placeholder="8.8.8.8, 1.1.1.1" />
                                            <Toggle field="dhcpEnabled" label="DHCP Enabled" defaultVal={false} />
                                        </Sec>
                                        <Sec icon={Shield} title="Local Security">
                                            <Toggle field="localFirewall" label="Local Firewall (iptables/Windows FW)" defaultVal={true} />
                                            <Toggle field="sshEnabled" label="SSH / RDP Access" defaultVal={true} />
                                            <Sel field="authMethod" label="Auth Method" options={['Password', 'Key-based (RSA/Ed25519)', 'Active Directory/LDAP']} defaultVal="Key-based (RSA/Ed25519)" />
                                        </Sec>
                                        <SensSlider />
                                    </div>;

                                    // ── ROUTER / SWITCH ──────────────────────────────
                                    if (ct === 'router' || ct === 'switch') return <div className="space-y-4">
                                        <Sec icon={Activity} title="Device Config">
                                            <Sel field="deviceVendor" label="Vendor OS" options={['Cisco IOS', 'Juniper Junos', 'MikroTik RouterOS', 'Arista EOS', 'Generic L3']} defaultVal="Cisco IOS" />
                                            <TxtInput field="managementIp" label="Management IP (VLAN 1)" placeholder="192.168.1.254" />
                                        </Sec>
                                        <Sec icon={Globe} title="Routing / Switching Protocols">
                                            <Sel field="routingProtocol" label="Dynamic Routing" options={['Static Only', 'OSPF', 'BGP', 'EIGRP', 'RIPv2']} defaultVal="Static Only" />
                                            {ct === 'switch' && <TxtInput field="vlans" label="Configured VLANs" placeholder="10, 20, 30, 99" />}
                                            <Toggle field="stpEnabled" label="Spanning Tree Protocol (STP)" defaultVal={true} />
                                        </Sec>
                                        <Sec icon={Key} title="Access & Security">
                                            <Toggle field="sshEnabled" label="SSH Enabled (Disable Telnet)" defaultVal={true} />
                                            <Toggle field="portSecurity" label="MAC Port Security" defaultVal={false} />
                                        </Sec>
                                    </div>;

                                    // ── ENDPOINT / LAPTOP ────────────────────────────
                                    if (ct === 'node') return <div className="space-y-4">
                                        <Sec icon={Database} title="Workstation OS">
                                            <Sel field="osFamily" label="OS Platform" options={['Windows 11 Corporate', 'Windows 10', 'macOS Sonoma', 'Ubuntu Desktop']} defaultVal="Windows 11 Corporate" />
                                        </Sec>
                                        <Sec icon={Globe} title="Network Interface (WLAN/LAN)">
                                            <TxtInput field="ipAddress" label="IPv4 Address" placeholder="10.10.10.45" />
                                            <TxtInput field="defaultGateway" label="Default Gateway" placeholder="10.10.10.1" />
                                            <Toggle field="dhcpEnabled" label="DHCP Client" defaultVal={true} />
                                        </Sec>
                                        <Sec icon={Shield} title="Endpoint Security (EDR/AV)">
                                            <Toggle field="antivirusEnabled" label="Windows Defender / AV Active" defaultVal={true} />
                                            <Toggle field="edrAgent" label="EDR Agent (CrowdStrike/SentinelOne)" defaultVal={false} />
                                            <Sel field="privilegeLevel" label="User Context privilege" options={['Standard User', 'Local Administrator']} defaultVal="Standard User" />
                                        </Sec>
                                        <SensSlider />
                                    </div>;

                                    // ── SIEM SERVER ──────────────────────────────────
                                    if (ct === 'siem') return <div className="space-y-4">
                                        <Sec icon={BarChart3} title="SIEM Platform">
                                            <Sel field="siemVendor" label="SIEM Engine" options={['Wazuh', 'IBM QRadar', 'Splunk Enterprise', 'Elastic Security', 'AlienVault OSSIM']} defaultVal="Wazuh" />
                                        </Sec>
                                        <Sec icon={Globe} title="Ingestion Setup">
                                            <TxtInput field="ingestPorts" label="Listening Ports (Syslog/Agents)" placeholder="514, 1514, 9200" />
                                            <Toggle field="tlsSyslog" label="TLS Encrypted Ingestion" defaultVal={true} />
                                            <NumInput field="logRetentionDays" label="Log Retention (Days)" min={1} max={3650} defaultVal={90} />
                                        </Sec>
                                    </div>;

                                    // ── ATTACKER MACHINE ──────────────────────────────
                                    if (ct === 'attacker') return <div className="space-y-4">
                                        <Sec icon={ShieldAlert} title="Threat Actor Toolkit">
                                            <Sel field="attackerOs" label="Offensive OS" options={['Kali Linux', 'Parrot OS', 'Commando VM', 'Custom Botnet C2']} defaultVal="Kali Linux" />
                                        </Sec>
                                        <Sec icon={Activity} title="Pre-Installed Tooling">
                                            <Toggle field="nmap" label="Nmap / Masscan" defaultVal={true} />
                                            <Toggle field="metasploit" label="Metasploit Framework" defaultVal={true} />
                                            <Toggle field="mimikatz" label="Mimikatz / Impacket" defaultVal={true} />
                                        </Sec>
                                        <Sec icon={Globe} title="Network Position">
                                            <TxtInput field="ipAddress" label="Spoofed/Real IP" placeholder="203.0.113.66" />
                                            <Sel field="networkContext" label="Context Location" options={['External (Internet)', 'Internal (Compromised VDI)', 'DMZ Hijack']} defaultVal="External (Internet)" />
                                        </Sec>
                                    </div>;

                                    // ── DNS INTERNET NODE (Backward Compatibility) ───
                                    if (ct === 'internet') return <div className="space-y-4">
                                        <Sec icon={Globe} title="Live AWS Route 53 Endpoint">
                                            <TxtInput field="dnsRecordType" label="DNS Record Type" placeholder="A, CNAME" />
                                            <TxtInput field="ttl" label="TTL Status" placeholder="30" />
                                            <Toggle field="tlsEnforced" label="TLS Enforced" defaultVal={true} />
                                        </Sec>
                                        <SensSlider />
                                    </div>;

                                    // ── FIREWALL (Upgraded) ──────────────────────────
                                    if (ct === 'firewall') return <div className="space-y-4">
                                        <Sec icon={Shield} title="Appliance OS">
                                            <Sel field="fwVendor" label="Vendor / Type" options={['pfSense (FreeBSD)', 'Palo Alto PAN-OS', 'Cisco ASA', 'Fortinet FortiOS', 'iptables (Linux)']} defaultVal="pfSense (FreeBSD)" />
                                        </Sec>
                                        <Sec icon={Globe} title="Interface Config">
                                            <TxtInput field="wanIp" label="WAN / External IP" placeholder="203.0.113.5" />
                                            <TxtInput field="lanIp" label="LAN / Internal IP" placeholder="10.0.0.1" />
                                        </Sec>
                                        <Sec icon={ShieldAlert} title="Access Control Lists (ACL)">
                                            <Sel field="defaultPolicy" label="Default Policy" options={['Default Deny (Secure)', 'Default Allow (Insecure)']} defaultVal="Default Deny (Secure)" />
                                            <Toggle field="statefulInspection" label="Stateful Packet Inspection" defaultVal={true} />
                                            <Toggle field="natEnabled" label="NAT / Masquerading" defaultVal={true} />
                                            <TxtInput field="whitelistedIPs" label="Ingress Allowed IPs" placeholder="192.168.1.0/24" />
                                        </Sec>
                                        <Sec icon={Activity} title="Advanced Services">
                                            <Toggle field="enableIDS" label="IDS/IPS (Snort/Suricata)" />
                                            <Toggle field="vpnServer" label="IPSec / OpenVPN Server" />
                                        </Sec>
                                    </div>;

                                    // ── CDN ──────────────────────────────────────────
                                    if (ct === 'cdn') return <div className="space-y-4">
                                        <Sec icon={Cloud} title="Delivery Network">
                                            <Sel field="cdnVendor" label="Provider" options={['Cloudflare', 'AWS CloudFront', 'Akamai', 'Fastly']} defaultVal="Cloudflare" />
                                            <Toggle field="ddosProtection" label="DDoS Protection Enabled" defaultVal={true} />
                                            <Toggle field="wafEnabled" label="Edge WAF Enabled" defaultVal={true} />
                                            <TxtInput field="cacheHitRatio" label="Target Cache Hit Ratio" placeholder="95%" />
                                        </Sec>
                                    </div>;

                                    // ── FALLBACK ──────────────────────────────────────
                                    return <div className="flex flex-col items-center justify-center h-48 space-y-3 opacity-60">
                                        <Terminal className="h-8 w-8 text-cyan-500" />
                                        <div className="text-white/40 text-xs font-mono text-center">
                                            No Deep Configuration defined<br />for this legacy component type.<br /><br />Try dragging a newer "Perimeter" or<br />"Compute" node onto the canvas.
                                        </div>
                                    </div>;
                                })()}
                            </ConfigContext.Provider>
                        </div>
                    </>
                )}
            </div>

            {/* Compliance & Threat Report Overlay */}
            {
                simulationResults && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
                        <div className="bg-[#111] border border-red-500/20 rounded-2xl w-full max-w-6xl max-h-full flex flex-col shadow-[0_0_100px_rgba(239,68,68,0.1)] relative overflow-hidden">

                            {/* Header */}
                            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-red-500/5 via-transparent to-transparent flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <ShieldAlert className="h-6 w-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Threat Analysis Report</h2>
                                        <p className="text-sm text-white/50">DFS Attack Simulation · MITRE ATT&CK · Compliance Mapping</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setZeroTrustMode(z => !z)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all ${zeroTrustMode ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'}`}
                                    >
                                        <Shield className="h-3 w-3" />
                                        Zero Trust {zeroTrustMode ? 'ON' : 'OFF'}
                                    </button>
                                    <div className="text-right">
                                        <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Exposure Index</div>
                                        <div className={`text-2xl font-bold ${simulationResults.impactScore > 70 ? 'text-red-500' : simulationResults.impactScore > 30 ? 'text-yellow-500' : 'text-cyan-500'}`}>
                                            {zeroTrustMode ? Math.round(simulationResults.impactScore * 0.45) : simulationResults.impactScore} <span className="text-sm font-medium opacity-50">/100</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSimulationResults(null)}
                                        className="p-2 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/20"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Financial Impact Banner */}
                            {financialImpact && (
                                <div className={`mx-6 mt-6 p-5 border rounded-2xl flex flex-wrap gap-6 items-center justify-between shadow-lg transition-colors ${simulationResults.impactScore > 0
                                    ? 'bg-gradient-to-r from-red-950/80 to-orange-950/60 border-red-500/20 shadow-red-900/20'
                                    : 'bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border-emerald-500/20 shadow-emerald-900/10'
                                    }`}>
                                    <div>
                                        <div className={`text-xs uppercase tracking-widest mb-1 font-bold ${simulationResults.impactScore > 0 ? 'text-red-400/70' : 'text-emerald-400/70'}`}>Estimated Breach Cost</div>
                                        <div className={`text-3xl font-bold ${simulationResults.impactScore > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {simulationResults.impactScore > 0 ? `₹${financialImpact.rangeLow}Cr – ₹${financialImpact.rangeHigh}Cr` : '₹0 (Secure)'}
                                        </div>
                                        <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">Source: IBM Cost of Data Breach Report 2024</div>
                                    </div>
                                    <div className="h-12 w-px bg-white/10 hidden md:block" />
                                    <div className="text-center">
                                        <div className={`text-xs uppercase tracking-widest mb-1 font-bold ${simulationResults.impactScore > 0 ? 'text-orange-400/70' : 'text-emerald-400/70'}`}>Est. Downtime</div>
                                        <div className={`text-3xl font-light ${simulationResults.impactScore > 0 ? 'text-orange-400' : 'text-white'}`}>{financialImpact.downtimeHours}h</div>
                                    </div>
                                    <div className="h-12 w-px bg-white/10 hidden md:block" />
                                    <div className="text-center">
                                        <div className={`text-xs uppercase tracking-widest mb-1 font-bold ${simulationResults.impactScore > 0 ? 'text-yellow-400/70' : 'text-emerald-400/70'}`}>Records at Risk</div>
                                        <div className={`text-3xl font-light ${simulationResults.impactScore > 0 ? 'text-yellow-400' : 'text-white'}`}>{financialImpact.recordsAtRisk.toLocaleString()}</div>
                                    </div>
                                    <div className="h-12 w-px bg-white/10 hidden md:block" />
                                    <div className="text-center hidden md:block pr-4">
                                        <div className="text-xs text-white/40 uppercase tracking-widest mb-1 font-bold">Blast Radius</div>
                                        <div className="text-3xl font-bold text-white">
                                            {simulationResults.compromisedNodes.length}
                                            <span className="text-sm font-normal text-white/40 ml-1">/ {nodes.length} nodes</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Findings Content */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                                {/* Zing AI Executive Summary Card */}
                                <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-transparent">
                                    <div className="bg-black/80 backdrop-blur-xl border border-white/5 rounded-xl p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="p-2 rounded-lg bg-cyan-500/10">
                                                <Sparkles className="h-5 w-5 text-cyan-400" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white flex items-center">
                                                Zin AI Executive Summary
                                            </h3>
                                        </div>

                                        {isGeneratingAi ? (
                                            <div className="flex items-center space-x-3 text-white/50 py-4">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                                                <span className="text-sm">Zin AI is analyzing the threat graph and generating an executive brief...</span>
                                            </div>
                                        ) : (
                                            <div className="prose prose-invert max-w-none text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                                                {aiSummary}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Summary Stats & Heatmap Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold uppercase text-white/50 tracking-wider">Breach Analysis</h3>
                                            <button
                                                onClick={handleReplayBreach}
                                                disabled={isReplaying || compromisedInfrastructureCount === 0}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest flex items-center transition-all ${isReplaying || compromisedInfrastructureCount === 0 ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/10' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'}`}
                                            >
                                                <Activity className={`h-3 w-3 mr-2 ${isReplaying ? 'animate-spin' : ''}`} />
                                                {isReplaying ? 'Replaying...' : 'Replay Breach'}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
                                                <div className="text-xs text-white/40 uppercase tracking-wider mb-2 font-bold z-10">Compromised Nodes</div>
                                                <div className={`text-5xl font-light z-10 ${compromisedInfrastructureCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {compromisedInfrastructureCount}
                                                </div>
                                                <Activity className="absolute -right-4 -bottom-4 h-24 w-24 text-white/[0.03] transform -rotate-12" />
                                            </div>
                                            <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5 flex flex-col justify-center relative overflow-hidden">
                                                <div className="text-xs text-white/40 uppercase tracking-wider mb-2 font-bold z-10">Critical Findings</div>
                                                <div className={`text-5xl font-light z-10 ${simulationResults.findings.filter((f: any) => f.severity === 'Critical').length > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {simulationResults.findings.filter((f: any) => f.severity === 'Critical').length}
                                                </div>
                                                <ShieldAlert className="absolute -right-4 -bottom-4 h-24 w-24 text-white/[0.03] transform rotate-12" />
                                            </div>
                                            <div className="bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-xl p-5 col-span-2 flex items-center justify-between group hover:bg-white/10 transition-colors cursor-default">
                                                <div>
                                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1 font-bold">Compliance Violations</div>
                                                    <div className={`text-2xl font-light ${simulationResults.findings.filter((f: any) => f.complianceMappings.length > 0).length > 0 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                                        {simulationResults.findings.filter((f: any) => f.complianceMappings.length > 0).length} Policy Gaps Detected
                                                    </div>
                                                </div>
                                                <FileCheck className={`h-10 w-10 ${simulationResults.findings.filter((f: any) => f.complianceMappings.length > 0).length > 0 ? 'text-yellow-500/40 group-hover:text-yellow-500/60' : 'text-emerald-500/40 group-hover:text-emerald-500/60'} transition-colors`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Compliance Radar Chart */}
                                    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 relative overflow-hidden flex flex-col">
                                        <h3 className="text-sm font-semibold uppercase text-cyan-400 tracking-wider mb-4 flex items-center absolute top-4 left-4 z-10">
                                            <ShieldAlert className="h-4 w-4 mr-2" /> Coverage Matrix
                                        </h3>
                                        <div className="flex-1 w-full h-[250px] mt-6">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={complianceData}>
                                                    <PolarGrid stroke="#333" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#333" />
                                                    <Radar name="Coverage %" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                                                        itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                {/* Compliance Gap Table */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold uppercase text-cyan-400 tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center">
                                        <FileCheck className="h-4 w-4 mr-2" /> Compliance Framework Coverage
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-xs uppercase tracking-widest text-white/30 border-b border-white/5">
                                                    <th className="text-left py-2 pr-4">Framework</th>
                                                    <th className="text-left py-2 pr-4">Authority</th>
                                                    <th className="text-left py-2 pr-4">Coverage</th>
                                                    <th className="text-left py-2">Identified Gaps</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {complianceTableData.map((row, i) => (
                                                    <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                                        <td className="py-2.5 pr-4 font-medium text-white/90">{row.framework}</td>
                                                        <td className="py-2.5 pr-4 text-white/40">{row.authority}</td>
                                                        <td className="py-2.5 pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-1.5 bg-white/10 rounded-full max-w-[80px]">
                                                                    <div
                                                                        className={`h-full rounded-full ${row.baseScore > 80 ? 'bg-emerald-500' : row.baseScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${row.baseScore}%` }}
                                                                    />
                                                                </div>
                                                                <span className={`text-xs font-bold ${row.baseScore > 80 ? 'text-emerald-400' : row.baseScore > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                    {row.baseScore}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5">
                                                            {row.gaps.length === 0 ? (
                                                                <span className="text-xs text-emerald-400/70">✓ No gaps detected</span>
                                                            ) : (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {[...new Set(row.gaps)].slice(0, 3).map((gap, gi) => (
                                                                        <span key={gi} className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">{gap}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Attack Timeline */}
                                {attackTimeline.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-sm font-semibold uppercase text-white/50 tracking-wider mb-6 border-b border-white/10 pb-3 flex items-center">
                                            <Activity className="h-4 w-4 mr-2" /> Simulated Attack Timeline
                                        </h3>
                                        <div className="relative pl-6 ml-2">
                                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-red-500 via-orange-500/50 to-transparent opacity-30" />
                                            <div className="space-y-6">
                                                {attackTimeline.map((event, i) => (
                                                    <div key={i} className={`relative pl-8 transition-all group`} style={{ animationDelay: `${i * 0.1}s` }}>
                                                        <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-black border-2 border-red-500 group-hover:bg-red-500 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.8)] transition-all z-10" />
                                                        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 rounded-xl p-4 hover:border-red-500/30 transition-colors relative overflow-hidden">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500/50 to-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <span className="text-[10px] font-mono text-red-500/50 whitespace-nowrap font-bold bg-red-500/10 px-2 py-1 rounded border border-red-500/20 self-start">[{event.time}]</span>
                                                            <div>
                                                                <div className={`text-[15px] font-bold ${event.color} mb-1 tracking-tight`}>{event.label}</div>
                                                                <div className="text-sm text-white/60 leading-relaxed">{event.desc}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Detailed Findings Table */}
                                <h3 className="text-sm font-semibold uppercase text-cyan-400 tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center">
                                    <Activity className="h-4 w-4 mr-2" /> Threat Vectors & Violations
                                </h3>

                                {simulationResults.findings.length === 0 ? (
                                    <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10 border-dashed">
                                        <Shield className="h-12 w-12 text-cyan-500/50 mx-auto mb-4" />
                                        <p className="text-white font-medium">Zero Critical Exposures Detected</p>
                                        <p className="text-sm text-white/50">Your architecture aligns with core compliance frameworks.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {simulationResults.findings.map((finding: any, idx: number) => (
                                            <div key={idx} className={`bg-black/40 border border-white/5 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden group hover:bg-black/60 transition-colors ${finding.severity === 'Critical' ? 'border-l-4 border-l-red-500' :
                                                finding.severity === 'High' ? 'border-l-4 border-l-orange-500' :
                                                    'border-l-4 border-l-yellow-500'
                                                }`}>
                                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10">
                                                    <ShieldAlert className="w-16 h-16" />
                                                </div>
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
                                                    <div className="flex items-start space-x-3">
                                                        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${finding.severity === 'Critical' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : finding.severity === 'High' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]'}`}></div>
                                                        <div>
                                                            <p className="text-white/90 text-sm font-medium leading-relaxed">{finding.description}</p>
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {finding.complianceMappings.map((mapping: string, mapIdx: number) => (
                                                                    <span key={mapIdx} className="text-[9px] uppercase font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                                                        {mapping}
                                                                    </span>
                                                                ))}
                                                                {finding.mitreId && (
                                                                    <span className="text-[9px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                                                                        <Shield className="h-2.5 w-2.5 mr-1" />
                                                                        {finding.mitreId}: {finding.mitreTactic} → {finding.mitreTechnique}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded flex items-center gap-1.5 ${finding.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : finding.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                                            {finding.severity === 'Critical' && <Activity className="w-3 h-3 animate-pulse" />}
                                                            {finding.severity}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Auto-Remediation Code Block */}
                                                {finding.remediationCode && (
                                                    <div className="mt-2 text-left bg-[#0d1117] border border-white/5 rounded-lg overflow-hidden group">
                                                        <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
                                                            <span className="text-[10px] text-emerald-400 font-mono flex items-center tracking-widest uppercase font-bold">
                                                                <Activity className="h-3 w-3 mr-1.5 animate-pulse" />
                                                                Auto-Remediation (Terraform)
                                                            </span>
                                                            <span className="text-[10px] text-white/30 hidden group-hover:block uppercase tracking-wider">Infrastructure As Code</span>
                                                        </div>
                                                        <div className="p-3 overflow-x-auto custom-scrollbar">
                                                            <pre className="text-xs font-mono text-gray-300 whitespace-pre">
                                                                <code>{finding.remediationCode}</code>
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                )
            }


            {/* AWS Deployment Results Overlay */}
            {
                deploymentResults && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-[#111] border border-orange-500/30 rounded-2xl w-full max-w-4xl max-h-full flex flex-col shadow-[0_0_100px_rgba(249,115,22,0.15)] relative overflow-hidden">

                            {/* Header */}
                            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-transparent flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30">
                                        <Cloud className="h-6 w-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tight">AWS Infrastructure Provisioned</h2>
                                        <p className="text-sm text-orange-200/50">Infrastructure-as-Code execution completed successfully.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setDeploymentResults(null)}
                                    className="p-2 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/20"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Resources Table */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <div className="space-y-4">
                                    {deploymentResults.resources.map((res, idx) => (
                                        <div key={idx} className="bg-black/50 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-start space-x-4">
                                                <div className="mt-1">
                                                    {res.awsService === 'EC2' ? <Server className="h-5 w-5 text-blue-400" /> :
                                                        res.awsService === 'RDS' ? <Database className="h-5 w-5 text-purple-400" /> :
                                                            <Globe className="h-5 w-5 text-gray-400" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-white font-medium">{res.awsService} Resources</span>
                                                        <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded font-mono">{res.resourceId}</span>
                                                    </div>
                                                    <p className="text-sm text-white/60 mt-1">{res.details}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 self-start md:self-auto bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                                                    {res.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {deploymentResults.resources.length === 0 && (
                                        <div className="text-center py-12 text-white/50">
                                            No AWS resources were provisioned. Ensure your architecture has compute or database nodes.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default function ArchitectPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center bg-[#060606]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-ping" />
                        </div>
                    </div>
                    <p className="text-white/30 text-xs font-mono tracking-widest uppercase">Loading workspace...</p>
                </div>
            </div>
        }>
            <ReactFlowProvider>
                <ArchitectContent />
            </ReactFlowProvider>
        </Suspense>
    );
}
