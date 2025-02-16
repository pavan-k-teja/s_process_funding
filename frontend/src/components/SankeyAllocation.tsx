import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

import Plot from "react-plotly.js";

const lightenColor = (color: string, percent: number) => {

  if (color.length === 4) {
    color = color.replace(/#(\w)(\w)(\w)/, '#$1$1$2$2$3$3');
  }

  const hexPercent = Math.floor(percent / 100 * 255).toString(16);

  const lighten = color + hexPercent;

  return lighten;
}


const SankeyAllocation: React.FC = () => {
  const allocations = useSelector((state: RootState) => state.allocations);
  const users = useSelector((state: RootState) => state.users);
  const colors = useSelector((state: RootState) => state.colors);

  // Extract funders and recommenders from users
  const funderNames = users.filter((u) => u.role === "funder").map((u) => u.username);
  const recommenderNames = users.filter((u) => u.role === "recommender").map((u) => u.username);

  // Find funder → recommender and recommender → organization links
  const funderToRecommender = allocations.filter((a) => funderNames.includes(a.from_name) && recommenderNames.includes(a.to_name) && a.allocation_type === "budget");
  const recommenderToOrg = allocations.filter((a) => recommenderNames.includes(a.from_name) && a.allocation_type == "funders");

  // Extract organization names
  const orgNames = Array.from(new Set(recommenderToOrg.map((a) => a.to_name)));
  console.log("FunderNames", funderNames);
  console.log("RecommenderNames", recommenderNames);
  console.log("ORGS", orgNames);
  console.log("ALL ALLOCATIONS", allocations);
  console.log("FunderToRecommender", funderToRecommender);
  console.log("RecommenderToOrg", recommenderToOrg);

  // Combine all unique names to create node labels
  const nodeLabels = [...funderNames, ...recommenderNames, ...orgNames];
  const nodeMap = new Map(nodeLabels.map((name, index) => [name, index])); // Map names to indexes

  // Create links using indexes from nodeMap
  const links = [
    ...funderToRecommender.map((a) => ({
      source: nodeMap.get(a.from_name) as number,
      target: nodeMap.get(a.to_name) as number,
      value: a.allocation,
    })),
    ...recommenderToOrg.map((a) => ({
      source: nodeMap.get(a.from_name) as number,
      target: nodeMap.get(a.to_name) as number,
      value: a.allocation,
    })),
  ].filter((l) => l.value > 0 && l.source !== l.target);

  console.log("NODES", nodeLabels);
  console.log("LINKS", links);

  const nodeColors = nodeLabels.map((name) =>
    funderNames.includes(name) || recommenderNames.includes(name) ? lightenColor("#4682B4", 40) : lightenColor(colors[name], 40) || "gray"
  );

  // const linkColors = links.map((link) => lightenColor(nodeColors[link.target], 40));


  return (
    <div className="flex justify-center items-start w-full h-screen">
      <Plot
        data={[
          {
            type: "sankey",
            orientation: "h",
            node: {
              thickness: 10,
              // line: { color: "black", width: 0.5 },
              label: nodeLabels,
              // color: nodeLabels.map(() => "steelblue"),
              color: nodeLabels.map((name) =>
                funderNames.includes(name) || recommenderNames.includes(name) ? lightenColor("#4682B4", 40) : lightenColor(colors[name], 40) || "gray"
              ),
            },
            link: {
              source: links.map((l) => l.source),
              target: links.map((l) => l.target),
              value: links.map((l) => l.value),
              // color: "grey",
            },
          },
        ]}
        layout={{
          title: "Fund Allocation Sankey Diagram",
          font: { size: 12 },
          width: 600,
          height: 700,
          hoverlabel: { bgcolor: "rgba(255, 255, 255, 0.5)" }
        }}
        config={{ responsive: false, displayModeBar: false }}
      />
    </div>
  );

};

export default SankeyAllocation;
