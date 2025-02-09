import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Profile } from '@/lib/types';

interface NetworkGraphProps {
  profiles: Profile[];
  user: string;
}

interface Node {
  id: string;
  name: string;
  level: number;
}

interface Link {
  source: Node;
  target: Node;
}

const levelSpacing = 80;  // Vertical gap between levels
const nodeRadius = 16;    // Radius of the node circles

const NetworkGraph: React.FC<NetworkGraphProps> = ({ profiles, user }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Create nodes from profiles
  const nodes: Node[] = profiles.map((profile) => {
    let level: number = 0;
    if (profile.role === "funder") {
      level = 1;
    } else if (profile.role === "recommender") {
      level = 2;
    }
    return {
      id: profile.profile_name,
      name: profile.username,
      level: level,
    };
  });

  // Create links between nodes
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

    // Calculate width and height based on levels and nodes
    const maxLevel = Math.max(...nodes.map(node => node.level));
    const width = Math.max(...Object.values(levelGroups).map(group => group.length)) * (nodeRadius * 4);
    const height = (maxLevel) * levelSpacing + nodeRadius * 2;

    // Assign x, y positions based on levelSpacing and calculated width
    return {
      width,
      height,
      nodes: nodes.map(node => {
        const levelNodes = levelGroups[node.level];
        const index = levelNodes.indexOf(node);
        const totalNodes = levelNodes.length;

        return {
          ...node,
          x: (width / (totalNodes + 1)) * (index + 1), // Spread evenly
          y: node.level * levelSpacing + nodeRadius,  // Stack levels
        };
      })
    };
  };

  const { width, height, nodes: positionedNodes } = calculatePositions(nodes);

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Draw links first (so they appear behind nodes)
    svg.selectAll(".link")
      .data(links)
      .enter().append("line")
      .attr("stroke", "lightgray")
      .attr("stroke-width", 1.5)
      .attr("stroke-linecap", "round")
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
      .attr("r", nodeRadius)
      // .attr("fill", "black");
      .attr("fill", d => (user && d.name === user) ? "steelblue" : "black");


    // Text inside nodes
    nodeGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "white")
      .style("font-size", "12px")
      .text(d => d.id);
  }, [width, height, positionedNodes, links]);

  return (
    <div className="p-0 m-0">
      <svg ref={svgRef} className='h-max'></svg>
    </div>
  );
};

export default NetworkGraph;