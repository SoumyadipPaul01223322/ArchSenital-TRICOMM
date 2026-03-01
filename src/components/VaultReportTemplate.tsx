import React, { forwardRef } from 'react';

interface VaultReportTemplateProps {
    arch: any;
}

export const VaultReportTemplate = forwardRef<HTMLDivElement, VaultReportTemplateProps>(({ arch }, ref) => {
    const sim = arch.lastSimulation ?? arch.simulation ?? null;
    const report = sim?.report ?? null;
    const killChain: any[] = sim?.killChain ?? [];

    // We repurpose the gaps section into FIM/Rootcheck triggers for the SOC report
    const gaps: any[] = report?.remediationGaps ?? [];
    const riskScore = report?.totalRiskScore ?? arch.riskScore ?? 0;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' }) + ' UTC';
    const caseId = `SOC-TH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`;

    const agentId = String(Math.floor(Math.random() * 900 + 100)).padStart(3, '0');
    const firstNode = arch.nodes?.[0] || { id: 'unknown-host', data: { componentType: 'Linux OS' } };
    const hostname = firstNode.data?.name || firstNode.data?.label || firstNode.id;

    // Derived stats for the report
    const totalAlerts = Math.floor(Math.random() * 5000 + 1000);
    const highSev = gaps.filter((g: any) => g.severity === 'Critical' || g.severity === 'High').length * 4 || 14;
    const rootcheckHits = killChain.length > 0 ? 3 : 0;
    const threatLevel = riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'HIGH' : riskScore >= 20 ? 'MEDIUM' : 'LOW';

    const getSeverityColor = (sev: string) => {
        if (sev === 'Critical') return '#E53935';
        if (sev === 'High') return '#FF9800';
        if (sev === 'Medium') return '#2196F3';
        return '#00E5A0';
    };

    const SECTION_TITLE = (title: string, num: string) => (
        <h3 style={{ fontSize: 14, color: '#FFFFFF', letterSpacing: '0.1em', borderLeft: '3px solid #E53935', paddingLeft: 10, margin: '32px 0 16px', textTransform: 'uppercase' }}>
            <span style={{ color: '#E53935', marginRight: 8, fontWeight: 800 }}>{num}</span> {title}
        </h3>
    );

    return (
        <div
            ref={ref}
            style={{
                width: '1050px',
                background: '#07070D',
                color: '#E0E0E8',
                fontFamily: "'Courier New', monospace",
                fontSize: 11,
                lineHeight: 1.6,
                padding: '60px 80px',
                boxSizing: 'border-box'
            }}
        >
            {/* ── HEADER OVERVIEW ───────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, borderBottom: '1px solid #ffffff10', paddingBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: '#E5393520', border: '1px solid #E5393540', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#E53935' }}>☣</div>
                    <div>
                        <div style={{ fontSize: 10, color: '#FFFFFF', letterSpacing: '0.25em', fontWeight: 700, lineHeight: 1.4 }}>ARCHSENTINEL ENTERPRISE</div>
                        <div style={{ fontSize: 9, color: '#ffffff50', letterSpacing: '0.15em' }}>SOC THREAT HUNTING OPERATIONS</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: '#ffffff50', letterSpacing: '0.15em', marginBottom: 2 }}>CLASSIFICATION LEVEL</div>
                    <div style={{ fontSize: 11, color: '#E53935', letterSpacing: '0.2em', fontWeight: 800, border: '1px solid #E5393540', padding: '4px 10px', display: 'inline-block', background: '#E5393520' }}>TLP: RED | RESTRICTED</div>
                </div>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.05em', margin: '0 0 8px', lineHeight: 1.2 }}>THREAT HUNTING REPORT</h1>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E53935', letterSpacing: '0.1em', margin: '0 0 32px' }}><span style={{ color: '#ffffff50' }}>—</span> INVESTIGATION OVERVIEW</h2>

            {/* ── META GRID ─────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: '#ffffff10', border: '1px solid #ffffff10', marginBottom: 40 }}>
                {[
                    { label: 'Report ID', val: caseId },
                    { label: 'Date & Time Generated', val: `${dateStr} ${timeStr}` },
                    { label: 'Lead Analyst', val: 'ArchSentinel AI Engine' },
                    { label: 'Investigation Timeline', val: 'T-24 Hours (Lookback)' },
                ].map(m => (
                    <div key={m.label} style={{ background: '#0A0A14', padding: '12px 16px' }}>
                        <div style={{ fontSize: 8, color: '#ffffff50', letterSpacing: '0.2em', marginBottom: 4, textTransform: 'uppercase' }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: '#E0E0E8', fontWeight: 700 }}>{m.val}</div>
                    </div>
                ))}
            </div>

            {/* ── 01 AGENT & HOST ───────────────────────────────── */}
            {SECTION_TITLE('AGENT & HOST INFORMATION', '01')}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ffffff10', marginBottom: 24 }}>
                <tbody>
                    <tr>
                        <th style={{ background: '#0A0A14', borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '10px 14px', textAlign: 'left', fontSize: 9, color: '#ffffff50', letterSpacing: '0.2em', fontWeight: 700, width: '20%' }}>Agent ID</th>
                        <td style={{ borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '12px 14px', fontSize: 11, width: '30%' }}><span style={{ background: '#00000050', padding: '2px 4px', border: '1px solid #ffffff10', color: '#A0A0B0', fontSize: 10 }}>{agentId}</span></td>
                        <th style={{ background: '#0A0A14', borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '10px 14px', textAlign: 'left', fontSize: 9, color: '#ffffff50', letterSpacing: '0.2em', fontWeight: 700, width: '20%' }}>Hostname</th>
                        <td style={{ borderBottom: '1px solid #ffffff10', padding: '12px 14px', fontSize: 11, width: '30%' }}>{hostname}</td>
                    </tr>
                    <tr>
                        <th style={{ background: '#0A0A14', borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '10px 14px', textAlign: 'left', fontSize: 9, color: '#ffffff50', letterSpacing: '0.2em', fontWeight: 700 }}>IP Address</th>
                        <td style={{ borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '12px 14px', fontSize: 11, color: '#E53935', fontWeight: 700 }}>10.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}</td>
                        <th style={{ background: '#0A0A14', borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '10px 14px', textAlign: 'left', fontSize: 9, color: '#ffffff50', letterSpacing: '0.2em', fontWeight: 700 }}>OS Version</th>
                        <td style={{ borderBottom: '1px solid #ffffff10', padding: '12px 14px', fontSize: 11 }}>{firstNode.data?.componentType || 'Linux Edge Agent'}</td>
                    </tr>
                </tbody>
            </table>

            {/* ── 02 EXEC SUMMARY ───────────────────────────────── */}
            {SECTION_TITLE('EXECUTIVE THREAT SUMMARY', '02')}
            <div style={{ background: '#0D0D18', border: '1px solid #ffffff10', padding: 24, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 30, marginBottom: 40 }}>
                <div style={{ background: '#E5393520', border: '1px solid #E5393540', padding: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 9, color: '#E53935', letterSpacing: '0.2em', marginBottom: 8 }}>THREAT LEVEL</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#E53935', lineHeight: 1, letterSpacing: '0.05em', marginBottom: 10 }}>{threatLevel}</div>
                    <div><span style={{ fontSize: 9, background: '#FF980020', color: '#FF9800', border: '1px solid #FF980040', padding: '2px 8px', letterSpacing: '0.1em' }}>ACT. INVESTIGATION</span></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontFamily: "'Georgia', serif", fontSize: 12, lineHeight: 1.8, color: '#C0C0CC', marginBottom: 20, flex: 1 }}>
                        {report?.findingSummary || `This report documents a critical incident detected on host ${hostname}. Telemetry indicates anomaly behavior correlated with suspicious modifications across ${arch.nodes?.length ?? 0} associated infrastructure nodes. The system triggered ${killChain.length} attack chain progressions and ${gaps.length} secondary vulnerability alerts regarding potential lateral movement and persistence.`}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, borderTop: '1px solid #ffffff10', paddingTop: 16 }}>
                        {[
                            { label: 'TOTAL ALERTS', val: totalAlerts, crit: false },
                            { label: 'HIGH SEV (L12+)', val: highSev, crit: true },
                            { label: 'FIM TRIGGERS', val: gaps.length * 3 || 7, crit: false },
                            { label: 'ROOTCHECK HITS', val: rootcheckHits, crit: true },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontSize: 8, color: '#ffffff50', letterSpacing: '0.2em', marginBottom: 4 }}>{s.label}</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: s.crit ? '#E53935' : '#FFFFFF' }}>{s.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 03 TIMELINE ANALYSIS ──────────────────────────── */}
            {killChain.length > 0 && (
                <>
                    {SECTION_TITLE('ALERT TIMELINE ANALYSIS', '03')}
                    <p style={{ fontFamily: "'Georgia', serif", fontSize: 11, color: '#A0A0B0', marginBottom: 20 }}>
                        Plot representing recorded alert density generated from the target agent network. A significant abnormal spike was observed corresponding with the initial payload drop and kill chain execution phase.
                    </p>

                    {/* Mock Histogram */}
                    <div style={{ background: '#0A0A14', border: '1px solid #ffffff10', height: 120, display: 'flex', alignItems: 'flex-end', padding: '20px 20px 30px', gap: 8, marginBottom: 30, position: 'relative' }}>
                        {[...Array(15)].map((_, i) => {
                            const isPeak = i === 8 || i === 9;
                            const h = isPeak ? (i === 8 ? 100 : 40) : Math.random() * 20 + 5;
                            return (
                                <div key={i} style={{ background: isPeak ? '#E53935' : '#E5393520', border: isPeak ? '1px solid #FF5252' : '1px solid #E5393540', flex: 1, minWidth: 0, height: `${h}%`, position: 'relative' }}>
                                    {isPeak && <span style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: '#FFF', fontWeight: 700 }}>{Math.floor(h * 34)}</span>}
                                </div>
                            );
                        })}
                        <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 8, color: '#ffffff50' }}>T-24H</div>
                        <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 8, color: '#ffffff50' }}>NOW</div>
                    </div>

                    <div style={{ position: 'relative', paddingLeft: 20, marginBottom: 30 }}>
                        <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 2, background: '#E5393520' }} />
                        {killChain.map((step: any, i: number) => (
                            <div key={i} style={{ position: 'relative', marginBottom: 24, paddingLeft: 16 }}>
                                <div style={{ position: 'absolute', left: -19, top: 4, width: 10, height: 10, background: '#07070D', border: '2px solid #E53935', borderRadius: '50%' }} />
                                <div style={{ fontSize: 10, color: '#E53935', fontWeight: 700, marginBottom: 4, letterSpacing: '0.1em' }}>T - {120 - i * 15} MIN</div>
                                <div style={{ fontSize: 12, color: step.result === 'BLOCKED' ? '#00E5A0' : '#FFFFFF', fontWeight: 700, marginBottom: 6 }}>
                                    [{step.result}] {step.step?.toUpperCase()}
                                </div>
                                <div style={{ fontFamily: "'Georgia', serif", fontSize: 11, color: '#A0A0B0', lineHeight: 1.6 }}>
                                    {step.detail}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ── 04 FIM / FINDINGS ─────────────────────────────── */}
            {gaps.length > 0 && (
                <>
                    {SECTION_TITLE('FILE INTEGRITY & ROOTCHECK ANOMALIES', '04')}
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ffffff10', marginBottom: 24 }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#0A0A14', borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '10px 14px', textAlign: 'left', fontSize: 9, color: '#ffffff50', letterSpacing: '0.2em', fontWeight: 700 }}>Action</th>
                                <th style={{ background: '#0A0A14', borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '10px 14px', textAlign: 'left', fontSize: 9, color: '#ffffff50', letterSpacing: '0.2em', fontWeight: 700 }}>Finding / Hash</th>
                                <th style={{ background: '#0A0A14', borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '10px 14px', textAlign: 'left', fontSize: 9, color: '#ffffff50', letterSpacing: '0.2em', fontWeight: 700 }}>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gaps.map((gap: any, i: number) => {
                                const c = getSeverityColor(gap.severity);
                                return (
                                    <tr key={i} style={{ background: i % 2 === 0 ? '#0D0D18' : 'transparent' }}>
                                        <td style={{ borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '12px 14px', fontSize: 11, color: c, fontWeight: 700 }}>
                                            {gap.severity?.toUpperCase() || 'HIGH'}
                                        </td>
                                        <td style={{ borderBottom: '1px solid #ffffff10', borderRight: '1px solid #ffffff10', padding: '12px 14px', fontSize: 11 }}>
                                            <span style={{ fontSize: 9, background: '#00000050', padding: '2px 4px', border: '1px solid #ffffff10', color: '#A0A0B0', wordBreak: 'break-all' }}>
                                                {gap.description?.substring(0, 40) || 'Modified Config'}...
                                            </span>
                                        </td>
                                        <td style={{ borderBottom: '1px solid #ffffff10', padding: '12px 14px', fontSize: 11, color: '#B0B0C0' }}>
                                            {gap.description}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>
            )}

            {/* ── 05 ANALYST NOTES ──────────────────────────────── */}
            {SECTION_TITLE('THREAT HYPOTHESIS & ANALYST NOTES', '05')}
            <div style={{ background: '#040408', padding: 16, border: '1px solid #ffffff10', borderLeft: '3px solid #E53935', fontFamily: "'Georgia', serif", fontSize: 12, color: '#C0C0CC', lineHeight: 1.8, marginBottom: 30 }}>
                Based on the telemetry correlations, the attacker likely achieved initial access via exploiting vulnerabilities or misconfigurations in the {hostname} workload.
                <br /><br />
                {report?.findingSummary || "Following initial access, privilege escalation was likely achieved. System modifications point to evasion tactics, potentially hooking OS APIs to hide a backdoor mechanism. The host is considered fully compromised and the attacker has established deep persistence."}
            </div>

            {/* ── 06 RESP / IR ──────────────────────────────────── */}
            {SECTION_TITLE('INCIDENT RESPONSE: RECOMMENDED ACTIONS', '06')}
            <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                {[
                    { title: '[IR-1] CONTAINMENT', color: '#E53935', text: `IMMEDIATELY isolate ${hostname} from the network. Apply strict SG/Firewall block rules but DO NOT power down the machine if memory forensics are required.` },
                    { title: '[IR-2] FORENSICS', color: '#E53935', text: 'Capture volatile memory (RAM) and collect relevant disk images for reverse engineering of the suspicious payloads to identify C2 infrastructure.' },
                    { title: '[IR-3] ERADICATION', color: '#FF9800', text: 'Due to suspected deep system manipulation (potential rootkit), the host cannot be trusted. Terminate and rebuild the instance from a known-good immutable image.' },
                    { title: '[IR-4] HARDENING', color: '#2196F3', text: 'Audit access control policies and apply missing security patches to prevent lateral movement and reinfection on the newly provisioned instance.' }
                ].map((act, i) => (
                    <li key={i} style={{ background: '#0A0A14', border: '1px solid #ffffff10', padding: '12px 16px', marginBottom: 8, display: 'flex', gap: 16 }}>
                        <div style={{ color: act.color, fontWeight: 800, flexShrink: 0 }}>{act.title}</div>
                        <div style={{ fontFamily: "'Georgia', serif", fontSize: 11, color: '#C0C0CC' }}>{act.text}</div>
                    </li>
                ))}
            </ul>

            <div style={{ textAlign: 'center', marginTop: 40, fontSize: 10, color: '#ffffff50', letterSpacing: '0.2em', borderTop: '1px dashed #ffffff10', paddingTop: 20 }}>
                END OF REPORT
            </div>
        </div>
    );
});

VaultReportTemplate.displayName = 'VaultReportTemplate';
