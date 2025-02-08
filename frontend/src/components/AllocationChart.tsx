import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

type Point = [number, number];

type Props = {
  a: number;
  b: number;
};



// const isOutOfBounds = (a: number, b: number, x: number, y: number, cx: number, cy: number) => {

// let check_below = Math.pow(x / a, Math.exp(-3)) + Math.pow(y / b, Math.exp(-3)) < 1

// if (check_below) {
//   return true;
// }

// let check_above = Math.pow(x / a, Math.exp(3)) + Math.pow(y / b, Math.exp(3)) > 1;

// if (check_above) {
//   return true;
// }

// return false;

//   let step = 0.01; // step size to move back towards valid region
//   let originalX = cx;
//   let originalY = cy;

//   let directionX = originalX < x ? -1 : 1;
//   let directionY = originalY < y ? -1 : 1;


//   while (!isValid) {
//     x += directionX * (width * step); // Scale step by width to ensure meaningful steps
//     y += directionY * (height * step); // Scale step by height

//     // Keep within bounds of the chart
//     x = Math.max(0, Math.min(width, x));
//     y = Math.max(0, Math.min(height, y));

//     isValid = !isOutOfBounds(points.current[2][0], points.current[0][1], x, y);
//     if (Math.abs(x - originalX) < 1e-6 && Math.abs(y - originalY) < 1e-6) {
//       // Prevent infinite loop if step is too small and can't get back in bounds
//       x = originalX;
//       y = originalY;
//       isValid = true; // Break loop, revert to original position if stuck
//       break;
//     }

//   }
// };


const nearestPoint = (a: number, b: number, px: number, py: number): [number, number] => {


  if (px < 0 && py > b) return [0, b];
  if (px > a && py < 0) return [a, 0];

  let check_below = Math.pow(px / a, Math.exp(-3)) + Math.pow(py / b, Math.exp(-3)) < 1

  if (check_below) {
    const k = Math.exp(-3);
    let slope = Math.pow((b / a), k) * Math.pow((px / py), k - 1)

    // equation for x: (x/a)^k + ((slope*(x-px)+py)/b)^k = 1
    // equation for y given x is found: b * (1 - (x/a)^(k))^1/k
  }


  return [px, py];
}



const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function solveForX(p: number, q: number, tolerance: number = 1e-7, maxIterations: number = 500): number | null {
  if (p <= 0 || q <= 0 || p > 1 || q > 1) {
    throw new Error("p and q must be in the range (0,1] for real solutions.");
  }

  let x = 0.5; // Initial guess, adjust if needed

  for (let i = 0; i < maxIterations; i++) {
    let fx = Math.pow(p, x) + Math.pow(q, x) - 1;
    let dfx = Math.log(p) * Math.pow(p, x) + Math.log(q) * Math.pow(q, x); // Derivative

    if (Math.abs(fx) < tolerance) return x;

    x -= fx / dfx; // Newton-Raphson update
  }

  return null; // No convergence
}

// Example usage
console.log(solveForX(0.6, 0.8)); // Example constants p and q



const AllocationChart: React.FC<Props> = ({ a, b }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const points: Point[] = [
      [0, height / 2],
      [width * 3 / 8, height / 4],
      [width * 3 / 4, 0],
    ];


    const x = d3.scaleLinear().domain([0, width]).range([0, width]);
    const y = d3.scaleLinear().domain([0, height]).range([height, 0]);

    const minPxDist = 5; // I want 2 pixel distance in both x and y from the second point to the top right and bottom left corners
    const minXCoordDist = () => x.invert(minPxDist) - x.invert(0);
    const minYCoordDist = () => y.invert(0) - y.invert(minPxDist);

    console.log('minXCoordDist', minXCoordDist());
    console.log('minYCoordDist', minYCoordDist());


    // const xPixelDist = (xCoordDist : number) => {
    //   return x.invert(xCoordDist) - x.invert(0);
    // }

    // const yPixelDist = (yCoordDist : number) => {
    //   return y.invert(0) - y.invert(yCoordDist);
    // }


    const line = d3
      .line<Point>()
      .curve(d3.curveMonotoneX)
      .x((d) => x(d[0]))
      .y((d) => y(d[1]));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const focus = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    focus.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
    focus.append("g").call(d3.axisLeft(y));

    // const path = focus
    //   .append("path")
    //   .datum(points)
    //   .attr("fill", "none")
    //   .attr("stroke", "steelblue")
    //   .attr("stroke-width", 1.5)
    //   .attr("d", line);

    const generateCurvePoints = (a: number, b: number, k: number, numPoints = 100) => {
      let curvePoints: [number, number][] = [];
      for (let i = 0; i <= numPoints; i++) {
        let xCoord = (i / numPoints) * a;
        let yCoord = b * Math.pow(1 - Math.pow(xCoord / a, k), 1 / k);
        if (!isNaN(yCoord)) {
          curvePoints.push([xCoord, yCoord]);
        }
      }
      return curvePoints;
    };

    const drag = d3.drag<SVGCircleElement, Point>().on("drag", function (event, d) {
      const i = points.indexOf(d);

      if (i === 0) {
        d[0] = 0;
        d[1] = Math.max(0, Math.min(height, y.invert(event.y)));

        // points[1][1] > d[1] 
        if (points[1][1] > d[1]) {
          points[1][1] = d[1];
        }

      } else if (i === 2) {
        d[0] = Math.max(0, Math.min(width, x.invert(event.x)));
        d[1] = 0;

        if (points[1][0] > d[0]) {
          points[1][0] = d[0];
        }

      } else if (i === 1) {

        d[0] = Math.max(0.001 * points[2][0], Math.min(points[2][0], x.invert(event.x)));
        d[1] = Math.max(0.001 * points[0][1], Math.min(points[0][1], y.invert(event.y)));



      }

      if (distance(points[1][0], points[1][1], points[2][0] - minXCoordDist(), points[0][1] - minYCoordDist()) <= distance(0, 0, minXCoordDist(), minYCoordDist()) && points[1][0] > points[2][0] - minXCoordDist() && points[1][1] > points[0][1] - minYCoordDist()) {

        let new_x = points[2][0] - minXCoordDist() + Math.pow(minXCoordDist(), 0.5);
        let new_y = points[0][1] - minYCoordDist() + Math.pow(minYCoordDist(), 0.5);

        points[1][0] = new_x;
        points[1][1] = new_y;
      }

      // now create a line equation that passes through the all 3 points in form (x/a)^k + (y/b)^k = 1
      let p = points[1][0] / points[2][0];
      let q = points[1][1] / points[0][1];

      let k = solveForX(p, q);
      if (k !== null) {
        const curvePoints = generateCurvePoints(points[2][0], points[0][1], k);
        curvePath.datum(curvePoints).attr("d", line);
      }

      d3.select(this).attr("cx", x(d[0])).attr("cy", y(d[1]));
      focus.selectAll("circle").data(points).attr("cx", (d) => x(d[0])).attr("cy", (d) => y(d[1]));
      // path.attr("d", line);
    });

    const curvePoints = generateCurvePoints(points[2][0], points[0][1], 1); // Initial k=1
    const curvePath = focus.append("path")
      .datum(curvePoints)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    focus
      .selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("cx", (d) => x(d[0]))
      .attr("cy", (d) => y(d[1]))
      .style("cursor", "pointer")
      .style("fill", "steelblue")
      .call(drag);

    // on hover, show the x and y coordinates of the point
    focus
      .selectAll("circle")
      .on("mouseover", function (event, d: any) {
        focus
          .append("text")
          .attr("id", "tooltip")
          .attr("x", x(d[0]) - 10)
          .attr("y", y(d[1]) - 10)
          .text(`(${Math.round(d[0] * 100) / 100}, ${Math.round(d[1] * 100) / 100})`)
      })
      .on("mouseout", function () {
        focus.select("#tooltip").remove()
      });


  }, [a, b]);

  return <svg ref={svgRef} width={600} height={400} style={{ border: "1px solid black" }}></svg>;
};

export default AllocationChart;
