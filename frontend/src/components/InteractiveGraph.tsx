import * as d3 from "d3";
import { useEffect, useRef } from "react";

export default function InteractiveGraph() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const width = 400;
    const height = 300;

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    
    const data = [
      { x: 0, y: 100 },
      { x: 100, y: 50 },
      { x: 200, y: 20 },
      { x: 300, y: 10 },
    ];

    const line = d3.line<{ x: number; y: number }>().x((d) => d.x).y((d) => d.y);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "magenta")
      .attr("stroke-width", 3)
      .attr("d", line);

    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 6)
      .attr("fill", "magenta")
      .call(d3.drag().on("drag", (event, d) => {
        d3.select(event.sourceEvent.target).attr("cx", d.x = event.x).attr("cy", d.y = event.y);
      }));
  }, []);

  return <svg ref={svgRef}></svg>;
}
