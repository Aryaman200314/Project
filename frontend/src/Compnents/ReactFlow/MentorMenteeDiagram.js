import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';

const MentorMenteeDiagram = () => {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/assignments');
        const data = res.data;

        const nodes = [];
        const edges = [];
        const addedMentors = new Set();
        const addedMentees = new Set();

        let mentorX = 0;

        data.forEach((row, index) => {
          if (!addedMentors.has(row.mentor_id)) {
            nodes.push({
              id: `mentor-${row.mentor_id}`,
              data: { label: row.mentor_name },
              position: { x: mentorX, y: 0 },
            });
            addedMentors.add(row.mentor_id);
            mentorX += 250;
          }

          if (!addedMentees.has(row.mentee_id)) {
            nodes.push({
              id: `mentee-${row.mentee_id}`,
              data: { label: row.mentee_name },
              position: { x: 100 + index * 100, y: 150 },
            });
            addedMentees.add(row.mentee_id);
          }

          edges.push({
            id: `e-${row.mentor_id}-${row.mentee_id}`,
            source: `mentor-${row.mentor_id}`,
            target: `mentee-${row.mentee_id}`,
            animated: true,
          });
        });

        setElements([...nodes, ...edges]);
      } catch (err) {
        console.error("Failed to fetch diagram data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ height: '600px' }}>
      <ReactFlow elements={elements}>
        <Background />
      </ReactFlow>
    </div>
  );
};

export default MentorMenteeDiagram;
