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

  const funderNames = users.filter((u) => u.role === "funder").map((u) => u.username);
  const recommenderNames = users.filter((u) => u.role === "recommender").map((u) => u.username);

  const funderToRecommender = allocations.filter((a) => funderNames.includes(a.from_name) && recommenderNames.includes(a.to_name) && a.allocation_type === "budget");
  const recommenderToOrg = allocations.filter((a) => recommenderNames.includes(a.from_name) && a.allocation_type == "funders");

  const orgNames = Array.from(new Set(recommenderToOrg.map((a) => a.to_name)));

  const nodeLabels = [...funderNames, ...recommenderNames, ...orgNames];
  const nodeMap = new Map(nodeLabels.map((name, index) => [name, index])); // Map names to indexes

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

  return (
    <div className="flex justify-center items-start w-full h-screen">
      <Plot
        data={[
          {
            type: "sankey",
            orientation: "h",
            node: {
              thickness: 10,
              label: nodeLabels,
              color: nodeLabels.map((name) =>
                funderNames.includes(name) || recommenderNames.includes(name) ? lightenColor("#4682B4", 40) : lightenColor(colors[name], 40) || "gray"
              ),
            },
            link: {
              source: links.map((l) => l.source),
              target: links.map((l) => l.target),
              value: links.map((l) => l.value),
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
