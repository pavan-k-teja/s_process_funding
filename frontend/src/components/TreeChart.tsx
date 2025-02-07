import * as d3 from "d3";
import { useEffect, useRef } from "react";

const data = {
  name: "I",
  children: [
    {
      name: "JT",
      children: [{ name: "VA" }, { name: "IF" }],
    },
    {
      name: "JM",
      children: [{ name: "GZ" }, { name: "CF" }],
    },
    {
      name: "DM",
      children: [{ name: "BO" }],
    },
  ],
};

export default function TreeChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const width = 400;
    const height = 300;
    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([width, height - 50]);
    treeLayout(root);

    svg.selectAll("*").remove();

    svg
      .selectAll("line")
      .data(root.links())
      .join("line")
      .attr("x1", (d) => d.source.x ?? 0)
      .attr("y1", (d) => d.source.y ?? 0)
      .attr("x2", (d) => d.target.x ?? 0)
      .attr("y2", (d) => d.target.y ?? 0)
      .attr("stroke", "gray");

    svg
      .selectAll("circle")
      .data(root.descendants())
      .join("circle")
      .attr("cx", (d) => d.x ?? 0)
      .attr("cy", (d) => d.y ?? 0)
      .attr("r", 15)
      .attr("fill", "black");

    svg
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .attr("x", (d) => d.x ?? 0)
      .attr("y", (d) => d.y ?? 0 - 20)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .attr("fill", "white");
  }, []);

  return <svg ref={svgRef}></svg>;
}
