"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
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
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Shield, Database, Globe, Server, Activity, Zap, ShieldAlert, Cpu, MessageSquare, Key, BarChart3, Trash2 } from "lucide-react";

// Mock initial nodes to show judges right away
const initialNodes: Node[] = [
    {
        id: "internet",
        type: "default",
        position: { x: 250, y: 50 },
        data: { label: "Public Internet" },
        style: {
            background: "#000",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: "8px",
            width: 150,
            padding: 10,
        }
    },
    {
        id: "lb",
        type: "default",
        position: { x: 250, y: 150 },
        data: { label: "Load Balancer" },
        style: {
            background: "#0a0a0a",
            color: "#fff",
            border: "1px solid #444",
            borderRadius: "8px",
            width: 150,
            padding: 10,
        }
    },
    {
        id: "api",
        type: "default",
        position: { x: 250, y: 250 },
        data: { label: "API Gateway" },
        style: {
            background: "#1e1b4b", // Indigo tint for logic
            color: "#fff",
            border: "1px solid #4f46e5",
            borderRadius: "8px",
            width: 150,
            padding: 10,
        }
    },
    {
        id: "db",
        type: "default",
        position: { x: 250, y: 350 },
        data: { label: "Postgres Database" },
        style: {
            background: "#2e1065", // Purple tint for data storage
            color: "#fff",
            border: "1px solid #9333ea",
            borderRadius: "8px",
            width: 150,
            padding: 10,
        }
    },
];

const initialEdges: Edge[] = [
    { id: "e1", source: "internet", target: "lb", animated: true, style: { stroke: "#fff" } },
    { id: "e2", source: "lb", target: "api", style: { stroke: "#fff" } },
    { id: "e3", source: "api", target: "db", style: { stroke: "#fff" } },
];

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

    const [nodes, setNodes] = useNodesState<Node>([]);
    const [edges, setEdges] = useEdgesState<Edge>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

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
        if (!projectId || !orgId) return;
        setIsSimulating(true);
        try {
            const diagramId = await saveArch({
                projectId: projectId as any,
                orgId,
                nodes,
                edges
            });

            await simulateAttack({ diagramId: diagramId as any });
            alert("Threat Model Simulation completed! Risk profiles have been applied across the component edge mappings.");
        } catch (err) {
            console.error(err);
            alert("Simulation engine failed to execute.");
        } finally {
            setIsSimulating(false);
        }
    };

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#fff' } }, eds)),
        [setEdges]
    );

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const updateNodeData = useCallback((key: string, value: any) => {
        if (!selectedNode) return;

        const newData = { ...selectedNode.data, [key]: value };

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
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
        setSelectedNode(null);
    }, [selectedNode, setNodes, setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/label');

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

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type: "default",
                position,
                data: {
                    label,
                    componentType: type, // Matches schema 'type'
                    networkConfig: {},
                    securityConfig: {},
                    availabilityConfig: {},
                    dataConfig: {},
                },
                style: {
                    background: type === "internet" ? "#000" :
                        type === "firewall" ? "#3f0a0a" :
                            type === "api" ? "#1e1b4b" :
                                type === "db" ? "#2e1065" :
                                    type === "lb" ? "#0a0a0a" :
                                        "#111",
                    color: "#fff",
                    border: `1px solid ${type === "internet" ? "#333" :
                        type === "firewall" ? "#ef4444" :
                            type === "api" ? "#4f46e5" :
                                type === "db" ? "#9333ea" :
                                    type === "lb" ? "#444" :
                                        "#666"
                        }`,
                    borderRadius: "8px",
                    width: 150,
                    padding: 10,
                }
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [setNodes]
    );

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] w-full border border-white/10 rounded-xl overflow-hidden shadow-2xl">

            {/* Component Palette (Left Sidebar) */}
            <div className="w-64 bg-black border-r border-white/10 p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
                <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Components</h3>

                <div className="space-y-3">
                    <div
                        onDragStart={(e) => onDragStart(e, 'internet', 'Internet')} draggable
                        className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center cursor-grab hover:bg-white/10 hover:border-purple-500/30 transition-all">
                        <Globe className="h-5 w-5 mr-3 text-blue-400" />
                        <span className="text-sm font-medium">Internet / Proxy</span>
                    </div>

                    <div
                        onDragStart={(e) => onDragStart(e, 'firewall', 'Firewall')} draggable
                        className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center cursor-grab hover:bg-white/10 hover:border-purple-500/30 transition-all">
                        <Shield className="h-5 w-5 mr-3 text-red-400" />
                        <span className="text-sm font-medium">Firewall / WAF</span>
                    </div>

                    <div
                        onDragStart={(e) => onDragStart(e, 'lb', 'Load Balancer')} draggable
                        className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center cursor-grab hover:bg-white/10 hover:border-purple-500/30 transition-all">
                        <Activity className="h-5 w-5 mr-3 text-green-400" />
                        <span className="text-sm font-medium">Load Balancer</span>
                    </div>

                    <div
                        onDragStart={(e) => onDragStart(e, 'api', 'API Service')} draggable
                        className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center cursor-grab hover:bg-white/10 hover:border-purple-500/30 transition-all">
                        <Cpu className="h-5 w-5 mr-3 text-purple-400" />
                        <span className="text-sm font-medium">API Service</span>
                    </div>

                    <div
                        onDragStart={(e) => onDragStart(e, 'db', 'Database')} draggable
                        className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center cursor-grab hover:bg-white/10 hover:border-purple-500/30 transition-all">
                        <Database className="h-5 w-5 mr-3 text-yellow-400" />
                        <span className="text-sm font-medium">Database</span>
                    </div>

                    <div
                        onDragStart={(e) => onDragStart(e, 'queue', 'Message Queue')} draggable
                        className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center cursor-grab hover:bg-white/10 hover:border-purple-500/30 transition-all">
                        <MessageSquare className="h-5 w-5 mr-3 text-pink-400" />
                        <span className="text-sm font-medium">Message Queue</span>
                    </div>

                    <div
                        onDragStart={(e) => onDragStart(e, 'auth', 'Auth Service')} draggable
                        className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center cursor-grab hover:bg-white/10 hover:border-purple-500/30 transition-all">
                        <Key className="h-5 w-5 mr-3 text-orange-400" />
                        <span className="text-sm font-medium">Auth Service</span>
                    </div>

                    <div
                        onDragStart={(e) => onDragStart(e, 'monitoring', 'Monitoring')} draggable
                        className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center cursor-grab hover:bg-white/10 hover:border-purple-500/30 transition-all">
                        <BarChart3 className="h-5 w-5 mr-3 text-cyan-400" />
                        <span className="text-sm font-medium">Monitoring</span>
                    </div>
                </div>

                <div className="mt-auto pt-6">
                    <button
                        onClick={handleSaveAndSimulate}
                        disabled={isSimulating}
                        className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3 rounded-lg font-medium shadow-lg shadow-red-500/20 flex items-center justify-center transition-colors"
                    >
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        {isSimulating ? "Running DFS..." : "Save & Simulate"}
                    </button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 h-full bg-[#0a0a0a] relative" ref={reactFlowWrapper}>
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
                    fitView
                    className="bg-black/80"
                    defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
                >
                    <Background color="#333" gap={16} />
                    <Controls className="bg-white/10 border-white/20 fill-white" />
                    <MiniMap className="bg-black border border-white/10" maskColor="rgba(255, 255, 255, 0.1)" nodeColor="#666" />
                </ReactFlow>

                {/* Floating Metrics Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg pointer-events-auto">
                        <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Total Architecture Risk</div>
                        <div className="flex items-end space-x-2">
                            <span className="text-2xl font-bold text-red-500 leading-none">85</span>
                            <span className="text-sm text-red-400 font-medium mb-0.5">Critical</span>
                        </div>
                    </div>

                    <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg pointer-events-auto flex items-center space-x-6">
                        <div>
                            <div className="text-xs text-white/50 mb-1">Nodes</div>
                            <div className="font-semibold text-white/90">4</div>
                        </div>
                        <div>
                            <div className="text-xs text-white/50 mb-1">State</div>
                            <div className="font-semibold text-green-400 flex items-center">
                                <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                                Saved
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuration Right Panel - Sliding Entry */}
            <div className={`w-80 bg-black border-l border-white/10 flex flex-col transition-all duration-300 ${selectedNode ? 'translate-x-0' : 'translate-x-full hidden'}`}>
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-lg">{selectedNode?.data.label as string || "Component config"}</h3>
                        <p className="text-sm text-white/50">ID: {selectedNode?.id}</p>
                    </div>
                    <button
                        onClick={deleteSelectedNode}
                        className="p-2 hover:bg-red-500/20 text-white/50 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                        title="Delete Component">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Dynamic Configurations based on Node Type */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase text-purple-400 tracking-wider">Configuration</h4>

                        {/* Common Network settings for all components except Auth/Monitoring */}
                        {selectedNode?.data?.componentType !== 'auth' && selectedNode?.data?.componentType !== 'monitoring' && (
                            <div className="space-y-1 mt-2">
                                <label className="text-sm text-white/70">Exposure</label>
                                <select
                                    value={selectedNode?.data?.exposure as string || "Public"}
                                    onChange={(e) => updateNodeData("exposure", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                                >
                                    <option value="Public">Public / Internet Facing</option>
                                    <option value="Private">Private Subnet</option>
                                    <option value="Internal VPC">Internal VPC Only</option>
                                </select>
                            </div>
                        )}

                        {/* Firewall Specific */}
                        {selectedNode?.data?.componentType === 'firewall' && (
                            <div className="space-y-3 mt-4">
                                <label className="text-sm text-white/70">Default Policy</label>
                                <select
                                    value={selectedNode?.data?.defaultPolicy as string || "Deny All (Secure)"}
                                    onChange={(e) => updateNodeData("defaultPolicy", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-500 transition-colors">
                                    <option value="Deny All (Secure)">Deny All (Secure)</option>
                                    <option value="Allow All (Insecure)">Allow All (Insecure)</option>
                                </select>
                                <label className="flex items-center space-x-3 cursor-pointer mt-2">
                                    <input type="checkbox"
                                        checked={(selectedNode?.data?.enableIDS as boolean) ?? true}
                                        onChange={(e) => updateNodeData("enableIDS", e.target.checked)}
                                        className="form-checkbox bg-black border-white/20 text-purple-600 rounded" />
                                    <span className="text-sm text-white/80">Enable IDS/IPS</span>
                                </label>
                            </div>
                        )}

                        {/* Database Specific */}
                        {selectedNode?.data?.componentType === 'db' && (
                            <div className="space-y-3 mt-4">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox"
                                        checked={(selectedNode?.data?.encryptionAtRest as boolean) ?? false}
                                        onChange={(e) => updateNodeData("encryptionAtRest", e.target.checked)}
                                        className="form-checkbox bg-black border-white/20 text-purple-600 rounded" />
                                    <span className="text-sm text-white/80">Encryption at Rest</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox"
                                        checked={(selectedNode?.data?.automatedBackups as boolean) ?? true}
                                        onChange={(e) => updateNodeData("automatedBackups", e.target.checked)}
                                        className="form-checkbox bg-black border-white/20 text-purple-600 rounded" />
                                    <span className="text-sm text-white/80">Automated Backups</span>
                                </label>
                                {selectedNode?.data?.exposure === 'Public' && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mt-2">
                                        <div className="flex items-start">
                                            <ShieldAlert className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-red-300">
                                                Warning: Database is publicly exposed. This contributes +15 to the vulnerability risk score and violates SOC2.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* API Specific */}
                        {selectedNode?.data?.componentType === 'api' && (
                            <div className="space-y-3 mt-4">
                                <label className="text-sm text-white/70">Auth Type</label>
                                <select
                                    value={selectedNode?.data?.authType as string || "JWT"}
                                    onChange={(e) => updateNodeData("authType", e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-purple-500 transition-colors">
                                    <option value="JWT">JWT</option>
                                    <option value="OAuth2">OAuth2</option>
                                    <option value="None">None (Public)</option>
                                </select>
                                <label className="flex items-center space-x-3 cursor-pointer mt-2">
                                    <input type="checkbox"
                                        checked={(selectedNode?.data?.rateLimiting as boolean) ?? true}
                                        onChange={(e) => updateNodeData("rateLimiting", e.target.checked)}
                                        className="form-checkbox bg-black border-white/20 text-purple-600 rounded" />
                                    <span className="text-sm text-white/80">Rate Limiting Enabled</span>
                                </label>
                            </div>
                        )}

                        {/* Auth Specific */}
                        {selectedNode?.data?.componentType === 'auth' && (
                            <div className="space-y-3 mt-4">
                                <label className="flex items-center space-x-3 cursor-pointer mt-2">
                                    <input type="checkbox"
                                        checked={(selectedNode?.data?.requireMFA as boolean) ?? true}
                                        onChange={(e) => updateNodeData("requireMFA", e.target.checked)}
                                        className="form-checkbox bg-black border-white/20 text-purple-600 rounded" />
                                    <span className="text-sm text-white/80">Require MFA</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox"
                                        checked={(selectedNode?.data?.strictPasswordPolicy as boolean) ?? true}
                                        onChange={(e) => updateNodeData("strictPasswordPolicy", e.target.checked)}
                                        className="form-checkbox bg-black border-white/20 text-purple-600 rounded" />
                                    <span className="text-sm text-white/80">Strict Password Policy</span>
                                </label>
                            </div>
                        )}
                    </div>

                </div>
            </div>

        </div>
    );
}

export default function ArchitectPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center border border-white/10 rounded-xl bg-black shadow-2xl">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-white/50 text-sm">Loading architecture workspace...</p>
                </div>
            </div>
        }>
            <ArchitectContent />
        </Suspense>
    );
}
