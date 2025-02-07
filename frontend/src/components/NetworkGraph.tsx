import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  level: number;
}

interface Link {
  source: Node;
  target: Node;
}

const width = 400;
const height = 300;
const levelSpacing = 80;  // Vertical gap between levels
// const rowSpacing = 100;    // Horizontal gap between nodes at the same level

const nodes: Node[] = [
  { id: "Σ", level: 0 },
  { id: "JT", level: 1 }, { id: "JM", level: 1 }, { id: "DM", level: 1 },
  { id: "VA", level: 2 }, { id: "IF", level: 2 }, { id: "GZ", level: 2 },
  { id: "CF", level: 2 }, { id: "BO", level: 2 }, { id: "XO", level: 2 }
];

const links: Link[] = [];
nodes.forEach(source => {
  nodes.forEach(target => {
    if (source.level + 1 === target.level) {
      links.push({ source, target });
    }
  });
});

// Function to calculate positions dynamically
const calculatePositions = (nodes: Node[]) => {
  const levelGroups: { [key: number]: Node[] } = {};
  
  // Group nodes by level
  nodes.forEach(node => {
    if (!levelGroups[node.level]) levelGroups[node.level] = [];
    levelGroups[node.level].push(node);
  });

  // Assign x, y positions based on levelSpacing and rowSpacing
  return nodes.map(node => {
    const levelNodes = levelGroups[node.level];
    const index = levelNodes.indexOf(node);
    const totalNodes = levelNodes.length;
    
    return {
      ...node,
      // x: (width / (totalNodes + 1)) * (index + 1), // Spread evenly
      x: (width / (totalNodes + 1)) * (index + 1), // Spread evenly
      y: node.level * levelSpacing + 50,          // Stack levels
    };
  });
};

export const NetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const positionedNodes = calculatePositions(nodes);

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Draw links first (so they appear behind nodes)
    svg.selectAll(".link")
      .data(links)
      .enter().append("line")
      .attr("stroke", "gray")
      .attr("stroke-width", 1.5)
      .attr("x1", d => positionedNodes.find(n => n.id === d.source.id)?.x ?? 0)
      .attr("y1", d => positionedNodes.find(n => n.id === d.source.id)?.y ?? 0)
      .attr("x2", d => positionedNodes.find(n => n.id === d.target.id)?.x ?? 0)
      .attr("y2", d => positionedNodes.find(n => n.id === d.target.id)?.y ?? 0)
      .lower();

    const nodeGroup = svg.selectAll(".node")
      .data(positionedNodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);

    nodeGroup.append("circle")
      .attr("r", 15)
      .attr("fill", "black");

    // Text inside nodes
    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .style("font-size", "12px")
      .text(d => d.id);
  }, []);

  return <svg ref={svgRef}></svg>;
};
