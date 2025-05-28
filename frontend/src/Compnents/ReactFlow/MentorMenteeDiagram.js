import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactFlow, {
    Background,
    useEdgesState,
    useNodesState,
    Controls
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'react-toastify';
import './MentorMenteeDiagram.css';


const MentorMenteeDiagram = ({ refreshTrigger }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [visible, setVisible] = useState(false);

    const customEdgeStyle = {
        strokeWidth: 2,
        stroke: '#888'
    };

    const edgeOptions = {
        style: customEdgeStyle,
        className: 'custom-edge'
    };

    const loadDiagramData = useCallback(async () => {
        setLoading(true);
        setSelectedEdge(null);
        try {
            const res = await axios.get('http://localhost:5000/api/assignments');
            const data = res.data;

            const mentorMap = new Map();
            const menteeMap = new Map();
            const tempNodes = [];
            const tempEdges = [];

            let mentorX = 0;
            let menteeX = 0;

            data.forEach((row) => {
                const mentorId = `mentor-${row.mentor_id}`;
                const menteeId = `mentee-${row.mentee_id}`;

                if (!mentorMap.has(mentorId)) {
                    tempNodes.push({
                        id: mentorId,
                        data: { label: row.mentor_name },
                        position: { x: mentorX, y: 50 },
                        style: { background: '#007BFF', color: 'white', padding: 10, borderRadius: 5 }
                    });
                    mentorMap.set(mentorId, true);
                    mentorX += 200;
                }

                if (!menteeMap.has(menteeId)) {
                    tempNodes.push({
                        id: menteeId,
                        data: { label: row.mentee_name },
                        position: { x: menteeX, y: 200 },
                        style: { background: '#28A745', color: 'white', padding: 10, borderRadius: 5 }
                    });
                    menteeMap.set(menteeId, true);
                    menteeX += 150;
                }

                tempEdges.push({
                    id: `edge-${row.mentor_id}-${row.mentee_id}`,
                    source: mentorId,
                    target: menteeId,
                    animated: true,
                    ...edgeOptions
                });
            });

            setNodes(tempNodes);
            setEdges(tempEdges);
        } catch (err) {
            console.error("Diagram fetch failed:", err);
            toast.error("Failed to load diagram");
        }
        setLoading(false);
    }, [setNodes, setEdges]);

    useEffect(() => {
        loadDiagramData();
    }, [refreshTrigger, loadDiagramData]);

    const onConnect = async (params) => {
        const mentorId = params.source.replace('mentor-', '');
        const menteeId = params.target.replace('mentee-', '');

        try {
            await axios.post('http://localhost:5000/api/assign', { mentorId, menteeId });
            toast.success("Mentee assigned");
            loadDiagramData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Assignment failed");
        }
    };

    return (
        <div style={{ marginTop: 40 }}>
            <div onClick={()=>loadDiagramData()} style={{ textAlign: 'center', paddingBottom: 10 }}>
                <button onClick={() => setVisible(!visible)} style={{ marginBottom: 10 }}>
                    {visible ? 'Hide Diagram' : 'View Diagram'}
                </button>
            </div>

            {visible && (
                <>

                    <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', gap: '10px' }}>
                        <button onClick={loadDiagramData}>🔄 Refresh</button>
                        <button
                            onClick={async () => {
                                if (!selectedEdge) return;
                                const mentorId = selectedEdge.source.replace('mentor-', '');
                                const menteeId = selectedEdge.target.replace('mentee-', '');
                                const confirm = window.confirm("Are you sure you want to unassign this mentee from this mentor?");
                                if (!confirm) return;
                                try {
                                    await axios.post('http://localhost:5000/api/unassign', { mentorId, menteeId });
                                    setEdges(prev => prev.filter(e => e.id !== selectedEdge.id));
                                    setSelectedEdge(null);
                                    loadDiagramData()
                                    toast.success("Relation deleted successfully!");
                                } catch (err) {
                                    toast.error("Failed to delete relation.");
                                }
                            }}
                            disabled={!selectedEdge}
                            style={{ background: selectedEdge ? '#dc3545' : '#aaa', color: 'white', cursor: selectedEdge ? 'pointer' : 'not-allowed' }}
                        >
                            ❌ Delete Relation
                        </button>
                    </div>
                    <div style={{ height: 500, border: '1px solid #ccc' }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges.map(edge =>
                                selectedEdge && edge.id === selectedEdge.id
                                    ? { ...edge, style: { ...customEdgeStyle, stroke: '#e91e63', strokeWidth: 3 } }
                                    : edge
                            )}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onEdgeClick={(event, edge) => {
                                event.preventDefault();
                                setSelectedEdge(edge);
                            }}
                            fitView
                        >
                            <Controls />
                            <Background />
                        </ReactFlow>
                    </div>
                    {selectedEdge && (
                        <div style={{ textAlign: 'center', marginTop: 10 }}>
                            <p>
                                Selected Relation: <strong>{selectedEdge.source}</strong> → <strong>{selectedEdge.target}</strong>
                            </p>
                        </div>
                    )}
                </>)}
        </div>
    );
};

export default MentorMenteeDiagram;











