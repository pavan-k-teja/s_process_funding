import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const AllocationChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const points: [number, number][] = [
      [0, height / 2], // Constrained to the y-axis
      [width / 2, height / 3], // Freely movable within bounds
      [width, 0], // Constrained to the x-axis
    ];

    // Define scales
    const x = d3.scaleLinear().domain([0, width]).range([0, width]);
    const y = d3.scaleLinear().domain([0, height]).range([height, 0]);

    // Define line generator with curve
    const line = d3
      .line<[number, number]>()
      .curve(d3.curveMonotoneX) // Smooth curve passing through the points
      .x((d) => x(d[0]))
      .y((d) => y(d[1]));

    // Select the SVG element
    const svg = d3.select(svgRef.current);

    // Clear previous content
    svg.selectAll("*").remove();

    const focus = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Append line path
    const path = focus
      .append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    // Append circles for draggable points
    const circles = focus
      .selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("cx", (d) => x(d[0]))
      .attr("cy", (d) => y(d[1]))
      .style("cursor", "pointer")
      .style("fill", "steelblue");

    // Define drag behavior
    const drag = d3
      .drag<SVGCircleElement, [number, number]>()
      .on("start", function () {
        d3.select(this).raise().classed("active", true);
      })
      .on("drag", function (event, d) {
        const i = points.indexOf(d);

        if (i === 0) {
          // Constrain point 0 to the y-axis
          d[1] = Math.max(0, Math.min(height, y.invert(event.y)));
          d[0] = 0;
        } else if (i === 2) {
          // Constrain point 2 to the x-axis
          d[0] = Math.max(0, Math.min(width, x.invert(event.x)));
          d[1] = 0;
        } else if (i === 1) {
          // Constrain middle point within bounds of points 0 and 2
          d[0] = Math.max(points[0][0], Math.min(points[2][0], x.invert(event.x)));
          d[1] = Math.max(points[2][1], Math.min(points[0][1], y.invert(event.y)));
        }

        // Update circle position
        d3.select(this)
          .attr("cx", x(d[0]))
          .attr("cy", y(d[1]));

        // Update line path
        path.attr("d", line);
      })
      .on("end", function () {
        d3.select(this).classed("active", false);
      });

    // Apply drag behavior to circles
    circles.call(drag);

    // Add axes
    focus
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    focus.append("g").call(d3.axisLeft(y));
  }, []);

  return (
    <svg
      ref={svgRef}
      width={600}
      height={400}
      style={{ border: "1px solid black" }}
    ></svg>
  );
};

export default AllocationChart;
