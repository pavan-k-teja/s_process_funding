import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { updateViewUser } from "@/store";

interface Node {
  id: string;
  // name: string;
  level: number;
}

interface Link {
  source: Node;
  target: Node;
}

const levelSpacing = 60;
const nodeRadius = 16;
const horizontalSpacing = 70;

const userToLevel = (role: string): number => {
  switch (role) {
    case "recommender":
      return 2;
    case "funder":
      return 1;
    default:
      return 0;
  }
};

const NetworkGraph: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profiles = useSelector((state: RootState) => state.users);
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const currentUserLevel = userToLevel(currentUser?.user?.role ?? "");
  const svgRef = useRef<SVGSVGElement>(null);
  const viewUser = currentUser?.viewUser;
  console.log("View User", viewUser);

  // Create nodes from profiles
  const nodes: Node[] = profiles.map((profile) => ({
    id: profile.profile_name,
    // name: profile.username,
    level: userToLevel(profile.role),
  }));

  // Create links between nodes
  const links: Link[] = [];
  nodes.forEach((source) => {
    nodes.forEach((target) => {
      if (source.level + 1 === target.level) {
        links.push({ source, target });
      }
    });
  });

  // Function to calculate positions dynamically
  const calculatePositions = (nodes: Node[]) => {
    const levelGroups: { [key: number]: Node[] } = {};

    // Group nodes by level
    nodes.forEach((node) => {
      if (!levelGroups[node.level]) levelGroups[node.level] = [];
      levelGroups[node.level].push(node);
    });

    // Calculate width and height based on levels and nodes
    const maxLevel = Math.max(...nodes.map((node) => node.level));
    const width = Math.max(...Object.values(levelGroups).map((group) => group.length)) * horizontalSpacing;
    const height = maxLevel * levelSpacing + nodeRadius * 2 + 10;

    // Assign x, y positions based on levelSpacing and calculated width
    return {
      width,
      height,
      nodes: nodes.map((node) => {
        const levelNodes = levelGroups[node.level];
        const index = levelNodes.indexOf(node);
        const totalNodes = levelNodes.length;

        return {
          ...node,
          x: width / 2 - ((totalNodes - 1) * horizontalSpacing) / 2 + index * horizontalSpacing, // Center nodes horizontally
          y: node.level * levelSpacing + nodeRadius, // Stack levels
        };
      }),
    };
  };

  const { width, height, nodes: positionedNodes } = calculatePositions(nodes);

  const handleViewChange = (profileName: string) => {
    console.log(`Changing view to: ${profileName}`);
    const newViewUser = profiles.find((profile) => profile.profile_name === profileName);
    if (newViewUser) {
      dispatch(updateViewUser(newViewUser));
      console.log("Modified View User", newViewUser);
    }
  };

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.attr("width", width).attr("height", height);
      svg.selectAll("*").remove(); // Clear previous elements to avoid duplicates

      // Draw links
      svg.selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1.5)
        .attr("stroke-linecap", "round")
        .attr("x1", (d) => positionedNodes.find((n) => n.id === d.source.id)?.x ?? 0)
        .attr("y1", (d) => positionedNodes.find((n) => n.id === d.source.id)?.y ?? 0)
        .attr("x2", (d) => positionedNodes.find((n) => n.id === d.target.id)?.x ?? 0)
        .attr("y2", (d) => positionedNodes.find((n) => n.id === d.target.id)?.y ?? 0)
        .lower();

      // Draw nodes
      const nodeGroup = svg
        .selectAll(".node")
        .data(positionedNodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
        .each(function (d) {  
          if (
            (d.level > currentUserLevel || d.id === currentUser?.user?.profile_name) &&
            currentUser?.viewUser?.profile_name !== d.id
          ) {
            d3.select(this).style("cursor", "pointer").on("click", () => {
              console.log(`Node clicked: ${d.id}`);
              handleViewChange(d.id);
            });
          }
        });

      // Draw circles
      nodeGroup
        .append("circle")
        .attr("r", nodeRadius)
        .attr("fill", (d) => (d.id === currentUser?.viewUser?.profile_name ? "steelblue" : "black"))
        .attr("stroke", "white")
        .attr("stroke-width", 2.5);

      // Draw text inside nodes
      nodeGroup
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "white")
        .style("font-size", "12px")
        .text((d) => d.id);
    }
  }, [profiles, currentUser]); // Re-run when profiles or currentUser changes

  return (
    <div className="p-0 m-0">
      <svg ref={svgRef} className="h-max"></svg>
    </div>
  );
};

export default NetworkGraph;
