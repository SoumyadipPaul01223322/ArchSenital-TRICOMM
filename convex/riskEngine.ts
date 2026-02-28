import { mutation } from "./_generated/server";
import { v } from "convex/values";

interface FindingDetail {
    message: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    mitreTactic: string;
    mitreTechnique: string;
    mitreId: string;
    remediationCode?: string;
    complianceMappings: string[];
}

function calculateBaseVulnerability(nodeData: any) {
    let vulnerabilityScore = 0;
    let localFindings: FindingDetail[] = [];

    // Network Vulnerabilities
    if (nodeData.exposure === "Public") {
        vulnerabilityScore += 15;
        localFindings.push({
            message: "Component is publicly exposed to the internet.",
            severity: 'High',
            mitreTactic: "Initial Access",
            mitreTechnique: "Exploit Public-Facing Application",
            mitreId: "T1190",
            complianceMappings: ["SOC2 CC6.6", "ISO 27001:A.13.1.1"]
        });
    }

    // Security Vulnerabilities
    if (nodeData.componentType === 'api') {
        if (nodeData.authType === "None") {
            vulnerabilityScore += 25;
            localFindings.push({
                message: "Critical: API Endpoint lacks authentication.",
                severity: 'Critical',
                mitreTactic: "Credential Access",
                mitreTechnique: "Exploit Public-Facing Application",
                mitreId: "T1190",
                complianceMappings: ["OWASP A07:2021", "SOC2 CC6.1"],
                remediationCode: `resource "aws_api_gateway_authorizer" "jwt" {\n  name = "jwt-auth"\n  rest_api_id = aws_api_gateway_rest_api.api.id\n  type = "COGNITO_USER_POOLS"\n  provider_arns = [aws_cognito_user_pool.pool.arn]\n}`
            });
        }
        if (nodeData.inputValidation === false) {
            vulnerabilityScore += 10;
            localFindings.push({
                message: "API Input Validation is disabled (Injection Risk).",
                severity: 'High',
                mitreTactic: "Execution",
                mitreTechnique: "Command and Scripting Interpreter",
                mitreId: "T1059",
                complianceMappings: ["OWASP A03:2021", "NIST SP 800-53 SI-10"],
                remediationCode: `resource "aws_wafv2_web_acl" "api_waf" {\n  name = "api-waf"\n  scope = "REGIONAL"\n  default_action { allow {} }\n  rule {\n    name = "AWSManagedRulesCommonRuleSet"\n    priority = 1\n    override_action { none {} }\n    statement {\n      managed_rule_group_statement {\n        name = "AWSManagedRulesCommonRuleSet"\n        vendor_name = "AWS"\n      }\n    }\n    visibility_config {\n      cloudwatch_metrics_enabled = true\n      metric_name = "AWSManagedRulesCommonRuleSetMetric"\n      sampled_requests_enabled = true\n    }\n  }\n}`
            });
        }
    }

    if (nodeData.componentType === 'db') {
        if (!nodeData.encryptionAtRest) {
            vulnerabilityScore += 15;
            localFindings.push({
                message: "High: Database is missing Encryption at Rest.",
                severity: 'Critical',
                mitreTactic: "Impact",
                mitreTechnique: "Data Encrypted for Impact",
                mitreId: "T1486",
                complianceMappings: ["SOC2 CC6.1", "GDPR Art. 32"],
                remediationCode: `resource "aws_db_instance" "secure_db" {\n  # ... other config\n  storage_encrypted = true\n  kms_key_id        = aws_kms_key.db_key.arn\n}`
            });
        }
        if (!nodeData.auditLoggingEnabled) {
            vulnerabilityScore += 5;
            localFindings.push({
                message: "Database audit logging is disabled.",
                severity: 'Medium',
                mitreTactic: "Defense Evasion",
                mitreTechnique: "Indicator Removal on Host",
                mitreId: "T1070",
                complianceMappings: ["SOC2 CC7.2", "HIPAA 164.312(b)"]
            });
        }
    }

    if (nodeData.encryptionInTransit === false) {
        vulnerabilityScore += 15;
        localFindings.push({
            message: "Traffic to component is unencrypted (No TLS/HTTPS).",
            severity: 'High',
            mitreTactic: "Credential Access",
            mitreTechnique: "Network Sniffing",
            mitreId: "T1040",
            complianceMappings: ["SOC2 CC6.1", "PCI-DSS 4.1"]
        });
    }

    // ── FIREWALL (Upgraded) ──────────────────────────────────────────────────
    if (nodeData.componentType === 'firewall') {
        if (nodeData.defaultPolicy === "Default Allow (Insecure)" || nodeData.defaultPolicy === "Allow All (Insecure)") {
            vulnerabilityScore += 30;
            localFindings.push({
                message: "Critical: Firewall default policy is overly permissive (Allow All).",
                severity: 'Critical',
                mitreTactic: "Discovery",
                mitreTechnique: "Network Service Discovery",
                mitreId: "T1046",
                complianceMappings: ["SOC2 CC6.6", "ISO 27001:A.13.1.1"]
            });
        }
        if (nodeData.statefulInspection === false) {
            vulnerabilityScore += 15;
            localFindings.push({
                message: "Stateful Packet Inspection is disabled — firewall operates as a basic stateless ACL.",
                severity: 'High',
                mitreTactic: "Defense Evasion",
                mitreTechnique: "Impair Defenses",
                mitreId: "T1562",
                complianceMappings: ["PCI-DSS 1.2"]
            });
        }
        // Only flag IDS as disabled if it was explicitly set to false by the user.
        // undefined = toggle was never touched = defaults to the UI's defaultVal (true)
        if (nodeData.enableIDS === false) {
            vulnerabilityScore += 20;
            localFindings.push({
                message: "Firewall IDS/IPS is explicitly disabled — intrusion attempts will not be detected or blocked.",
                severity: 'High',
                mitreTactic: "Defense Evasion",
                mitreTechnique: "Impair Defenses: Disable or Modify System Firewall",
                mitreId: "T1562.004",
                complianceMappings: ["SOC2 CC7.2", "PCI-DSS 11.4", "NIST SP 800-53 SI-3"]
            });
        }
    }

    // ── SERVER / VPS ──────────────────────────────────────────────────────────
    if (nodeData.componentType === 'server' || nodeData.componentType === 'vps') {
        if (nodeData.sshEnabled && nodeData.authMethod === 'Password') {
            vulnerabilityScore += 25;
            localFindings.push({
                message: "Server allows SSH with Password authentication — highly vulnerable to brute forcing.",
                severity: 'Critical',
                mitreTactic: "Credential Access",
                mitreTechnique: "Brute Force: Password Guessing",
                mitreId: "T1110.001",
                complianceMappings: ["CIS Benchmark 5.2.5", "PCI-DSS 8.2"]
            });
        }
        if (nodeData.localFirewall === false) {
            vulnerabilityScore += 15;
            localFindings.push({
                message: "Local host firewall (iptables/Windows Firewall) is disabled.",
                severity: 'High',
                mitreTactic: "Lateral Movement",
                mitreTechnique: "Exploitation of Remote Services",
                mitreId: "T1210",
                complianceMappings: ["SOC2 CC6.6"]
            });
        }
        if (nodeData.dbService && nodeData.dbService !== 'None' && nodeData.exposure === 'Public') {
            vulnerabilityScore += 30;
            localFindings.push({
                message: "Database service running directly on a public-facing server.",
                severity: 'Critical',
                mitreTactic: "Initial Access",
                mitreTechnique: "Exploit Public-Facing Application",
                mitreId: "T1190",
                complianceMappings: ["PCI-DSS 1.3"]
            });
        }
    }

    // ── ENDPOINT / WORKSTATION ────────────────────────────────────────────────
    if (nodeData.componentType === 'node') {
        if (nodeData.privilegeLevel === 'Local Administrator') {
            vulnerabilityScore += 20;
            localFindings.push({
                message: "User operates as Local Administrator — malware execution guarantees full system compromise.",
                severity: 'Critical',
                mitreTactic: "Privilege Escalation",
                mitreTechnique: "Valid Accounts: Local Accounts",
                mitreId: "T1078.003",
                complianceMappings: ["CIS Control 5.4"]
            });
        }
        if (nodeData.antivirusEnabled === false) {
            vulnerabilityScore += 25;
            localFindings.push({
                message: "Endpoint AV/Defender is disabled — entirely defenseless against basic commodity malware.",
                severity: 'Critical',
                mitreTactic: "Defense Evasion",
                mitreTechnique: "Impair Defenses: Disable or Modify Tools",
                mitreId: "T1562.001",
                complianceMappings: ["SOC2 CC6.1", "PCI-DSS 5.1"]
            });
        }
    }

    // ── ROUTER / SWITCH ────────────────────────────────────────────────────────
    if (nodeData.componentType === 'router' || nodeData.componentType === 'switch') {
        if (nodeData.componentType === 'switch' && nodeData.stpEnabled === false) {
            vulnerabilityScore += 15;
            localFindings.push({
                message: "Spanning Tree Protocol (STP) disabled — vulnerable to catastrophic Layer 2 network loops / broadcast storms.",
                severity: 'High',
                mitreTactic: "Impact",
                mitreTechnique: "Network Denial of Service",
                mitreId: "T1498",
                complianceMappings: ["CIS Network Devices"]
            });
        }
        if (nodeData.sshEnabled === false) { // This implies Telnet if SSH is unselected in our UI logic
            vulnerabilityScore += 25;
            localFindings.push({
                message: "Device management relies on unencrypted protocols (Telnet) rather than SSH.",
                severity: 'Critical',
                mitreTactic: "Credential Access",
                mitreTechnique: "Network Sniffing",
                mitreId: "T1040",
                complianceMappings: ["PCI-DSS 4.1"]
            });
        }
    }

    // ── INTERNET ──────────────────────────────────────────────────────────
    if (nodeData.componentType === 'internet') {
        if (!nodeData.rateLimitEnabled) {
            vulnerabilityScore += 15;
            localFindings.push({ message: "Internet gateway has no rate limiting — brute-force risk.", severity: 'High', mitreTactic: "Credential Access", mitreTechnique: "Brute Force", mitreId: "T1110", complianceMappings: ["SOC2 CC6.6", "OWASP API4:2023"] });
        }
        if (!nodeData.trafficFiltered) {
            vulnerabilityScore += 10;
            localFindings.push({ message: "No traffic filtering on internet component — all ingress allowed.", severity: 'High', mitreTactic: "Initial Access", mitreTechnique: "Exploit Public-Facing Application", mitreId: "T1190", complianceMappings: ["ISO 27001:A.13.1.1"] });
        }
        if (!nodeData.tlsEnforced) {
            vulnerabilityScore += 12;
            localFindings.push({ message: "TLS not enforced on public internet entry point — MITM risk.", severity: 'Critical', mitreTactic: "Credential Access", mitreTechnique: "Network Sniffing", mitreId: "T1040", complianceMappings: ["PCI-DSS 4.1", "SOC2 CC6.1"] });
        }
        if ((nodeData.openPorts || "").includes("22")) {
            vulnerabilityScore += 20;
            localFindings.push({ message: "Port 22 (SSH) exposed to internet — remote exploitation risk.", severity: 'Critical', mitreTactic: "Lateral Movement", mitreTechnique: "Remote Services: SSH", mitreId: "T1021.004", complianceMappings: ["CIS Benchmark 5.3", "NIST AC-17"] });
        }
    }

    // ── WAF ────────────────────────────────────────────────────────────────
    if (nodeData.componentType === 'waf') {
        if (nodeData.wafMode === 'Detect Only' || nodeData.wafMode === 'Count') {
            vulnerabilityScore += 20;
            localFindings.push({ message: "WAF is in non-blocking mode — attacks are logged but not prevented.", severity: 'High', mitreTactic: "Initial Access", mitreTechnique: "Exploit Public-Facing Application", mitreId: "T1190", complianceMappings: ["OWASP A01:2021", "SOC2 CC6.6"] });
        }
        if (!nodeData.loggingEnabled) {
            vulnerabilityScore += 8;
            localFindings.push({ message: "WAF request logging is disabled — no visibility into attack patterns.", severity: 'Medium', mitreTactic: "Defense Evasion", mitreTechnique: "Impair Defenses: Disable Logging", mitreId: "T1562.001", complianceMappings: ["SOC2 CC7.2"] });
        }
    }

    // ── VPN ─────────────────────────────────────────────────────────────────
    if (nodeData.componentType === 'vpn') {
        if (!nodeData.mfaRequired) {
            vulnerabilityScore += 20;
            localFindings.push({ message: "VPN lacks MFA — credential stuffing can lead to full network access.", severity: 'Critical', mitreTactic: "Initial Access", mitreTechnique: "Valid Accounts", mitreId: "T1078", complianceMappings: ["NIST 800-63B", "SOC2 CC6.1"], remediationCode: `# Enforce MFA via Okta or Azure AD Conditional Access\nconditional_access_policy "vpn_mfa" {\n  require_mfa = true\n}` });
        }
        if (nodeData.encryptionCipher === '3DES (Weak)') {
            vulnerabilityScore += 15;
            localFindings.push({ message: "VPN uses 3DES cipher — cryptographically weak, vulnerable to SWEET32.", severity: 'High', mitreTactic: "Credential Access", mitreTechnique: "Network Sniffing", mitreId: "T1040", complianceMappings: ["PCI-DSS 4.2.1", "NIST 800-131A"] });
        }
        if (nodeData.splitTunneling) {
            vulnerabilityScore += 10;
            localFindings.push({ message: "Split tunneling enabled — malicious traffic may bypass VPN inspection.", severity: 'Medium', mitreTactic: "Defense Evasion", mitreTechnique: "Traffic Signaling", mitreId: "T1205", complianceMappings: ["NIST AC-17(6)"] });
        }
    }

    // ── LAMBDA / SERVERLESS ───────────────────────────────────────────────
    if (nodeData.componentType === 'lambda') {
        if ((nodeData.iamRoleScope || '').includes('Admin') || (nodeData.iamRoleScope || '').includes('Broad')) {
            vulnerabilityScore += 25;
            localFindings.push({ message: "Lambda function has overly broad IAM role — violates least privilege.", severity: 'Critical', mitreTactic: "Privilege Escalation", mitreTechnique: "Valid Accounts: Cloud Accounts", mitreId: "T1078.004", complianceMappings: ["AWS Well-Architected: SEC 5", "CIS AWS 1.3"] });
        }
        if (nodeData.envSecretsExposed) {
            vulnerabilityScore += 20;
            localFindings.push({ message: "Lambda env vars contain secrets — risk of credential exposure via logs/metadata.", severity: 'Critical', mitreTactic: "Credential Access", mitreTechnique: "Credentials in Files", mitreId: "T1552.001", complianceMappings: ["OWASP A02:2021", "SOC2 CC6.1"] });
        }
        if (nodeData.publicEndpoint && !nodeData.tlsEnforced) {
            vulnerabilityScore += 15;
            localFindings.push({ message: "Lambda has public HTTP endpoint without HTTPS enforcement.", severity: 'High', mitreTactic: "Initial Access", mitreTechnique: "Exploit Public-Facing Application", mitreId: "T1190", complianceMappings: ["PCI-DSS 6.4", "SOC2 CC6.7"] });
        }
        if (!nodeData.vpcEnabled && nodeData.publicEndpoint) {
            vulnerabilityScore += 10;
            localFindings.push({ message: "Lambda runs outside VPC with public endpoint — isolation boundary missing.", severity: 'High', mitreTactic: "Lateral Movement", mitreTechnique: "Remote Service Session Hijacking", mitreId: "T1563", complianceMappings: ["CIS AWS Benchmark 3.9"] });
        }
    }

    // ── KUBERNETES / CONTAINER ────────────────────────────────────────────
    if (nodeData.componentType === 'container') {
        if (!nodeData.rbacEnabled) {
            vulnerabilityScore += 20;
            localFindings.push({ message: "Kubernetes RBAC is disabled — any pod can access the API server.", severity: 'Critical', mitreTactic: "Privilege Escalation", mitreTechnique: "Escape to Host", mitreId: "T1611", complianceMappings: ["CIS Kubernetes Benchmark 5.1.1", "NSA Kubernetes Hardening"] });
        }
        if (!nodeData.networkPolicies) {
            vulnerabilityScore += 15;
            localFindings.push({ message: "No Kubernetes Network Policies — all pods can communicate freely.", severity: 'High', mitreTactic: "Lateral Movement", mitreTechnique: "Exploitation of Remote Services", mitreId: "T1210", complianceMappings: ["NSA/CISA Kubernetes Guide 2022"] });
        }
        if (!nodeData.secretsEncrypted) {
            vulnerabilityScore += 15;
            localFindings.push({ message: "Kubernetes secrets stored unencrypted in etcd — exposure risk.", severity: 'Critical', mitreTactic: "Credential Access", mitreTechnique: "Credentials in Files", mitreId: "T1552.001", complianceMappings: ["CIS Kubernetes 1.2.29"] });
        }
        if (!nodeData.imageScanning) {
            vulnerabilityScore += 10;
            localFindings.push({ message: "Container image scanning disabled — vulnerable base images may be deployed.", severity: 'High', mitreTactic: "Execution", mitreTechnique: "Deploy Container", mitreId: "T1610", complianceMappings: ["NIST SP 800-190", "OWASP A06:2021"] });
        }
    }

    // ── OBJECT STORAGE (S3) ────────────────────────────────────────────────
    if (nodeData.componentType === 'storage') {
        if ((nodeData.exposure || 'Private').includes('Public')) {
            const isWritable = (nodeData.exposure || '').includes('Write');
            vulnerabilityScore += isWritable ? 40 : 20;
            localFindings.push({
                message: isWritable ? "CRITICAL: Object storage bucket is PUBLIC READ-WRITE — data exfiltration and ransomware risk." : "Object storage bucket is public read — sensitive data may be exposed.",
                severity: isWritable ? 'Critical' : 'High',
                mitreTactic: "Exfiltration",
                mitreTechnique: "Exfiltration to Cloud Storage",
                mitreId: "T1567.002",
                complianceMappings: ["GDPR Art. 32", "SOC2 CC6.1", "CIS AWS 2.3"]
            });
        }
        if (!nodeData.encryptionAtRest) {
            vulnerabilityScore += 15;
            localFindings.push({ message: "Object storage lacks server-side encryption at rest.", severity: 'High', mitreTactic: "Impact", mitreTechnique: "Data Encrypted for Impact", mitreId: "T1486", complianceMappings: ["SOC2 CC6.1", "GDPR Art. 32"] });
        }
        if (!nodeData.accessLogging) {
            vulnerabilityScore += 8;
            localFindings.push({ message: "Storage access logging disabled — data exfiltration may go undetected.", severity: 'Medium', mitreTactic: "Defense Evasion", mitreTechnique: "Impair Defenses: Disable Logging", mitreId: "T1562.001", complianceMappings: ["SOC2 CC7.2", "HIPAA 164.312(b)"] });
        }
        if (!nodeData.versioning) {
            vulnerabilityScore += 5;
            localFindings.push({ message: "Object versioning disabled — ransomware can permanently destroy data.", severity: 'Medium', mitreTactic: "Impact", mitreTechnique: "Data Destruction", mitreId: "T1485", complianceMappings: ["SOC2 A1.3"] });
        }
    }

    // ── CACHE LAYER ────────────────────────────────────────────────────────
    if (nodeData.componentType === 'cache') {
        if (!nodeData.authEnabled && (nodeData.exposure || 'Private') !== 'Private') {
            vulnerabilityScore += 25;
            localFindings.push({ message: "Cache (Redis/Memcached) accessible without authentication — unauthorized data access risk.", severity: 'Critical', mitreTactic: "Collection", mitreTechnique: "Data from Local System", mitreId: "T1005", complianceMappings: ["OWASP A02:2021", "CIS Redis Benchmark"] });
        }
        if ((nodeData.exposure || 'Private') === 'Public') {
            vulnerabilityScore += 20;
            localFindings.push({ message: "Cache layer is publicly accessible — session tokens and sensitive data exposed.", severity: 'Critical', mitreTactic: "Collection", mitreTechnique: "Adversary-in-the-Middle", mitreId: "T1557", complianceMappings: ["SOC2 CC6.6"] });
        }
    }

    // ── CDN ────────────────────────────────────────────────────────────────
    if (nodeData.componentType === 'cdn') {
        if (!nodeData.httpsOnly) {
            vulnerabilityScore += 12;
            localFindings.push({ message: "CDN allows HTTP — MITM downgrade attacks possible.", severity: 'High', mitreTactic: "Credential Access", mitreTechnique: "Adversary-in-the-Middle: HTTPS Spoofing", mitreId: "T1557.003", complianceMappings: ["PCI-DSS 4.1"] });
        }
        if (!nodeData.wafEnabled) {
            vulnerabilityScore += 10;
            localFindings.push({ message: "CDN has no WAF layer — XSS/SQLi attacks reach origin directly.", severity: 'High', mitreTactic: "Initial Access", mitreTechnique: "Exploit Public-Facing Application", mitreId: "T1190", complianceMappings: ["OWASP A03:2021"] });
        }
    }

    // ── SECRETS MANAGER ────────────────────────────────────────────────────
    if (nodeData.componentType === 'secrets') {
        if (nodeData.publicAccessible) {
            vulnerabilityScore += 40;
            localFindings.push({ message: "CRITICAL: Secrets Manager is publicly accessible — all secrets exposed.", severity: 'Critical', mitreTactic: "Credential Access", mitreTechnique: "Unsecured Credentials", mitreId: "T1552", complianceMappings: ["SOC2 CC6.1", "GDPR Art. 32", "PCI-DSS 8.3"] });
        }
        if (!nodeData.autoRotation) {
            vulnerabilityScore += 15;
            localFindings.push({ message: "Secret auto-rotation disabled — long-lived credentials increase breach window.", severity: 'High', mitreTactic: "Credential Access", mitreTechnique: "Steal Application Access Token", mitreId: "T1528", complianceMappings: ["NIST 800-63B", "SOC2 CC6.7"] });
        }
        if (!nodeData.rbacEnabled) {
            vulnerabilityScore += 15;
            localFindings.push({ message: "Secrets Manager lacks fine-grained RBAC — over-permissive access.", severity: 'High', mitreTactic: "Privilege Escalation", mitreTechnique: "Valid Accounts", mitreId: "T1078", complianceMappings: ["CIS AWS 1.3", "SOC2 CC6.3"] });
        }
        if (!nodeData.auditLoggingEnabled) {
            vulnerabilityScore += 8;
            localFindings.push({ message: "Secrets Manager audit logging off — no trail for unauthorized secret access.", severity: 'Medium', mitreTactic: "Defense Evasion", mitreTechnique: "Impair Defenses: Disable Logging", mitreId: "T1562.001", complianceMappings: ["SOC2 CC7.2", "HIPAA"] });
        }
    }

    // ── AUTH SERVICE ────────────────────────────────────────────────────────
    if (nodeData.componentType === 'auth') {
        if (!nodeData.mfaRequired) {
            vulnerabilityScore += 20;
            localFindings.push({ message: "Auth service does not require MFA — account takeover risk via credential stuffing.", severity: 'Critical', mitreTactic: "Initial Access", mitreTechnique: "Valid Accounts", mitreId: "T1078", complianceMappings: ["NIST 800-63B Level 2", "SOC2 CC6.1"] });
        }
        if ((nodeData.passwordStrength || '').includes('Weak')) {
            vulnerabilityScore += 15;
            localFindings.push({ message: "Weak password policy — susceptible to password spraying attacks.", severity: 'High', mitreTactic: "Credential Access", mitreTechnique: "Brute Force: Password Spraying", mitreId: "T1110.003", complianceMappings: ["NIST 800-63B", "CIS Control 5.2"] });
        }
        if (!nodeData.bruteForceProtection) {
            vulnerabilityScore += 15;
            localFindings.push({ message: "No brute force protection on auth service — unlimited login attempts allowed.", severity: 'High', mitreTactic: "Credential Access", mitreTechnique: "Brute Force", mitreId: "T1110", complianceMappings: ["OWASP A07:2021"] });
        }
    }

    // ── LOAD BALANCER ────────────────────────────────────────────────────────
    if (nodeData.componentType === 'lb') {
        if (!nodeData.wafEnabled) {
            vulnerabilityScore += 10;
            localFindings.push({ message: "Load balancer has no WAF — L7 attacks bypass to backend services.", severity: 'High', mitreTactic: "Initial Access", mitreTechnique: "Exploit Public-Facing Application", mitreId: "T1190", complianceMappings: ["OWASP A01:2021"] });
        }
        if (!nodeData.ddosProtection) {
            vulnerabilityScore += 10;
            localFindings.push({ message: "No DDoS protection on load balancer — service unavailability risk.", severity: 'High', mitreTactic: "Impact", mitreTechnique: "Endpoint Denial of Service", mitreId: "T1499", complianceMappings: ["SOC2 A1.1", "ISO 27001:A.17.2.1"] });
        }
        if ((nodeData.redundancyZones || 1) < 2) {
            vulnerabilityScore += 8;
            localFindings.push({ message: "Load balancer spans fewer than 2 availability zones — regional failure risk.", severity: 'Medium', mitreTactic: "Impact", mitreTechnique: "Service Stop", mitreId: "T1489", complianceMappings: ["SOC2 A1.2"] });
        }
    }

    // ── MONITORING ────────────────────────────────────────────────────────
    if (nodeData.componentType === 'monitoring') {
        if (!nodeData.alertsEnabled) {
            vulnerabilityScore += 8;
            localFindings.push({ message: "No alert thresholds configured — anomalies will not trigger incident response.", severity: 'Medium', mitreTactic: "Defense Evasion", mitreTechnique: "Impair Defenses", mitreId: "T1562", complianceMappings: ["SOC2 CC7.3"] });
        }
        if (!nodeData.realTimeEnabled) {
            vulnerabilityScore += 5;
            localFindings.push({ message: "Real-time monitoring disabled — breach detection delayed.", severity: 'Medium', mitreTactic: "Defense Evasion", mitreTechnique: "Indicator Removal", mitreId: "T1070", complianceMappings: ["SOC2 CC7.2"] });
        }
    }

    // Impact Weighting based on Data

    if (nodeData.instanceCount === 1 && !nodeData.autoScaling) {
        vulnerabilityScore += 5;
        localFindings.push({
            message: "Single Point of Failure: Instance count is 1 with no Auto-Scaling.",
            severity: 'Medium',
            mitreTactic: "Impact",
            mitreTechnique: "Endpoint Denial of Service",
            mitreId: "T1499",
            complianceMappings: ["SOC2 A1.2"]
        });
    }

    // Impact Weighting based on Data
    const sensitivity = parseInt(nodeData.sensitivityLevel?.toString() || '1');
    const impactMultiplier = 1 + (sensitivity * 0.1);

    const finalScore = Math.round(vulnerabilityScore * impactMultiplier);

    if (sensitivity >= 4 && finalScore > 0) {
        localFindings.push({
            message: `Elevated risk modifier applied due to hosting highly sensitive data (${nodeData.dataType}).`,
            severity: 'High',
            mitreTactic: "Exfiltration",
            mitreTechnique: "Exfiltration Over C2 Channel",
            mitreId: "T1041",
            complianceMappings: ["GDPR Art. 9", "HIPAA"]
        });
    }

    return { score: finalScore, findings: localFindings, sensitivity };
}

export const simulateAttack = mutation({
    args: { diagramId: v.id("diagrams") },
    handler: async (ctx, args) => {
        const diagram = await ctx.db.get(args.diagramId);

        if (!diagram) throw new Error("Graph not found");

        const nodes = diagram.nodes;
        const edges = diagram.edges;

        // 1. Build Adjacency List for O(V+E) performance
        const adjacencyList = new Map<string, string[]>();
        nodes.forEach((node: any) => adjacencyList.set(node.id, []));

        edges.forEach((edge: any) => {
            adjacencyList.get(edge.source)?.push(edge.target);
        });

        // 2. Pre-calculate Base Vulnerabilities per Node
        const nodeMap = new Map();
        const nodeVulnerabilities = new Map();

        nodes.forEach((node: any) => {
            nodeMap.set(node.id, node);
            nodeVulnerabilities.set(node.id, calculateBaseVulnerability(node.data));
        });

        // 3. DFS Engine for Lateral Movement (Blast Radius)
        const compromised = new Set<string>();
        const visited = new Set<string>();

        // Attackers start at Public/Internet exposed nodes
        // Attackers start at Public/Internet exposed nodes or explicit Attacker machines
        const entryPoints = nodes.filter((n: any) =>
            n.data.exposure === "Public" ||
            n.data.componentType === "internet" ||
            n.data.componentType === "attacker"
        );

        function isCompromisable(currentNodeId: string, sourceNodeId: string | null) {
            const currentNode = nodeMap.get(currentNodeId);
            const vulnData = nodeVulnerabilities.get(currentNodeId);

            // Attacker nodes are obviously already compromised conceptually
            if (currentNode.data.componentType === "attacker") return true;

            // Firewalls and connectivity nodes always get traversed — they are not "targets",
            // they are gateways. A secured firewall still passes traffic; it just adds risk findings
            // of its own. This ensures downstream nodes are always evaluated for their own vulnerabilities.
            if (['router', 'switch', 'internet', 'firewall', 'lb', 'cdn'].includes(currentNode.data.componentType)) return true;

            // If an attacker is moving laterally from a compromised source
            if (sourceNodeId) {
                // Any node with a vulnerability score > 0 will fall to a direct connection from a compromised node
                if (vulnData.score > 0) return true;
            }

            // Internet nodes are entry points and always "compromisable" from the outside
            if (currentNode.data.componentType === "internet") return true;

            return false;
        }

        function dfs(currentNodeId: string, sourceNodeId: string | null) {
            if (visited.has(currentNodeId)) return;
            visited.add(currentNodeId);

            if (isCompromisable(currentNodeId, sourceNodeId)) {
                compromised.add(currentNodeId);

                const neighbors = adjacencyList.get(currentNodeId) || [];
                for (const neighborId of neighbors) {
                    dfs(neighborId, currentNodeId);
                }
            }
        }

        for (const entry of entryPoints) {
            dfs(entry.id, null);
        }

        // 4. Aggregation and Compliance Mapping
        let totalSystemRisk = 0;
        const allFindings: {
            componentId: string,
            description: string,
            severity: 'Critical' | 'High' | 'Medium' | 'Low',
            complianceMappings: string[],
            mitreTactic?: string,
            mitreTechnique?: string,
            mitreId?: string,
            remediationCode?: string
        }[] = [];

        nodes.forEach((node: any) => {
            const vuln = nodeVulnerabilities.get(node.id);
            totalSystemRisk += vuln.score;

            // Map findings to framework
            vuln.findings.forEach((f: FindingDetail) => {
                allFindings.push({
                    componentId: node.id,
                    description: `[${node.data.label || node.id}] ${f.message}`,
                    severity: f.severity,
                    complianceMappings: f.complianceMappings,
                    mitreTactic: f.mitreTactic,
                    mitreTechnique: f.mitreTechnique,
                    mitreId: f.mitreId,
                    remediationCode: f.remediationCode
                });
            });
        });

        // 4b. Architecture-wide IDS/SIEM absence check
        const hasAnyIDS = nodes.some((n: any) =>
            n.data?.componentType === 'siem' ||
            n.data?.enableIDS === true
        );
        if (!hasAnyIDS && nodes.length > 0) {
            totalSystemRisk += 25;
            allFindings.unshift({
                componentId: 'architecture',
                description: '[Architecture] No IDS/IPS or SIEM detected in the entire infrastructure. Intrusions, lateral movement, and data exfiltration will go completely undetected.',
                severity: 'Critical',
                mitreTactic: 'Defense Evasion',
                mitreTechnique: 'Impair Defenses: Disable or Modify Tools',
                mitreId: 'T1562.001',
                complianceMappings: ['SOC2 CC7.2', 'PCI-DSS 10.6', 'NIST SP 800-53 SI-4', 'ISO 27001:A.12.4.1']
            });
        }

        // Multiply total risk by blast radius percentage
        const blastRadiusPercentage = compromised.size / Math.max(nodes.length, 1);
        let finalQuantifiedRisk = Math.round(totalSystemRisk * (1 + blastRadiusPercentage));

        // Scale to 0-100 logically
        if (finalQuantifiedRisk > 100) finalQuantifiedRisk = 100;
        if (nodes.length === 0) finalQuantifiedRisk = 0;

        // Update risk model in Convex DB
        await ctx.db.patch(diagram._id, { riskScore: finalQuantifiedRisk });
        await ctx.db.patch(diagram.projectId, { riskScore: finalQuantifiedRisk });

        return {
            compromisedNodes: Array.from(compromised),
            impactScore: Math.round(finalQuantifiedRisk),
            findings: allFindings
        };
    }
});
