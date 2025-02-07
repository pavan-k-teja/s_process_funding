import { useEffect, useRef, useState } from "react";
import { select, line, drag, curveCatmullRom } from "d3";

interface Point {
  id: number;
  x: number;
  y: number;
}

const width = 600;
const height = 400;

// Initial control points
const initialPoints: Point[] = [
  { id: 0, x: 100, y: 200 },
  { id: 1, x: 300, y: 100 },
  { id: 2, x: 500, y: 300 }
];

export default function AllocationChart() {
  const [points, setPoints] = useState<Point[]>(initialPoints);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);

    // Line generator
    const curve = line<Point>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(curveCatmullRom.alpha(0.5)); // Smooth curve

    const update = () => {
      // Update curve path
      svg
        .selectAll("path")
        .data([points])
        .join("path")
        .attr("d", curve)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2);

      // Update circles
      const circles = svg
        .selectAll<SVGCircleElement, Point>("circle")
        .data(points)
        .join("circle")
        .attr("r", 8)
        .attr("fill", "red")
        .attr("stroke", "black")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      // Drag behavior
      circles.call(
        // drag<SVGCircleElement, Point>()
        //   .on("drag", (event, d) => {
        //     d.x = Math.max(0, Math.min(width, event.x));
        //     d.y = Math.max(0, Math.min(height, event.y));
        //     setPoints([...points]);
        //     update();
        //   })

        drag<SVGCircleElement, Point>()
          .on("drag", (event, d) => {
            d.x = Math.max(10, Math.min(width - 10, event.x)); // Keep points within width
            d.y = Math.max(10, Math.min(height - 10, event.y)); // Keep points within height
            setPoints([...points]);
            update();
          });

      );
};

update();
  }, [points]);

return (
  <svg ref={svgRef} width={width} height={height} className="border bg-white" />
);
}
