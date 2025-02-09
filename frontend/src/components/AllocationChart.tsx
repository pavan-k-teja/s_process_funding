import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Colors, Utility } from '@/lib/types';

type Point = [number, number];

interface AllocationChartProps {
  utilities: Utility[];
  colors: Colors;
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

// }

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

const findMidPoint = (fdv: number, ldt: number, conc: number, maxXValue: number): Point => {

  let midX = Math.min(0.5 * ldt, 0.5 * maxXValue);

  let midY = fdv * Math.pow(1 - Math.pow(midX / ldt, Math.exp(conc)), 1 / Math.exp(conc));

  return [midX, midY];

}

const AllocationChart: React.FC<AllocationChartProps> = ({ utilities, colors }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const maxXValue = 3000000; // $3M cutoff on the x-axis

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const focus = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, maxXValue]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

    // focus.append("g")
    // .call(d3.axisLeft(y))
    // show lables at 0.0, 0.5, 1.0
    // remove other ticks and labels

    focus.append("g")
      .call(d3.axisLeft(y)
        .tickValues([0, 0.5, 1])
        .tickFormat(d3.format(".1f"))
      );

    focus.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(3)
        .tickFormat(d => `$${d3.format(".2s")(d)}`)
      )
      .selectAll("text")
      .style("text-anchor", "middle")



    focus.selectAll(".tick text")
      // .style("font-size", "12px")
      .style("font-weight", "bolder");




    const line = d3
      .line<Point>()
      .curve(d3.curveMonotoneX)
      .x((d) => x(d[0]))
      .y((d) => y(d[1]));

    utilities.forEach((utility) => {
      if (utility.fdv === 0 || utility.ldt === 0) return;

      let points: Point[] = [
        [0, utility.fdv], // First point on Y-axis.  Cap at max Y
        findMidPoint(utility.fdv, utility.ldt, utility.conc, maxXValue), // Midpoint
        [utility.ldt, 0], // Third point on X-axis.  Cap at maxXValue.
      ];

      const minPxDist = 10;
      const minXCoordDist = () => x.invert(minPxDist) - x.invert(0);
      const minYCoordDist = () => y.invert(0) - y.invert(minPxDist);

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
          d[1] = Math.max(0.01, Math.min(height, y.invert(event.y)));

          if (points[1][1] > d[1]) {
            points[1][1] = d[1];
          }

        } else if (i === 2) {
          // d[0] = Math.max(0, Math.min(width, x.invert(event.x))); is there any issue here? 
          d[0] = Math.max(0.01, Math.min(maxXValue, x.invert(event.x)));
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

        let p = points[1][0] / points[2][0];
        let q = points[1][1] / points[0][1];

        let k = solveForX(p, q);
        if (k !== null) {
          const curvePoints = generateCurvePoints(points[2][0], points[0][1], k);
          curvePath.datum(curvePoints).attr("d", line);
        }
        else {
          // make it a straight line
          curvePath.datum([points[0], points[2]]).attr("d", line);



        }

        d3.select(this).attr("cx", x(d[0])).attr("cy", y(d[1]));

        points.forEach((point, i) => {
          focus.select(`#circle_${utility.utility_name}_${i}`).attr("cx", x(point[0])).attr("cy", y(point[1]));
        });

      });

      const curvePoints = generateCurvePoints(points[2][0], points[0][1], Math.exp(utility.conc)); // Initial k=1
      const curvePath = focus.append("path")
        .datum(curvePoints)
        .attr("fill", "none")
        .attr("stroke", colors[utility.utility_name] || "red")
        .attr("stroke-width", 2.5)
        .attr("d", line);


      // first create circles based on points. dont do select all circles, this will modify the other circles as well
      // focus
      //   .append("circle")
      //   .data([points[0]])
      //   .attr("cx", x(points[0][0]))
      //   .attr("cy", y(points[0][1]))
      //   .attr("r", 5)
      //   .attr("cursor", "grab")
      //   .style("fill", colors[utility.utility_name] || "steelblue")
      //   .call(drag);

      // focus
      //   .append("circle")
      //   .data([points[1]])
      //   .attr("cx", x(points[1][0]))
      //   .attr("cy", y(points[1][1]))
      //   .attr("r", 5)
      //   .attr("cursor", "grab")
      //   .style("fill", colors[utility.utility_name] || "steelblue")
      //   .call(drag);

      // focus
      //   .append("circle")
      //   .data([points[2]])
      //   .attr("cx", x(points[2][0]))
      //   .attr("cy", y(points[2][1]))
      //   .attr("r", 5)
      //   .attr("cursor", "grab")
      //   .style("fill", colors[utility.utility_name] || "steelblue")
      //   .call(drag);

      // do an iteration and create circles based on points
      // focus
      //   .selectAll(`circle_${utility.utility_name}`)
      //   .data(points)
      //   .enter()
      //   .append("circle")
      //   .attr("r", 5)
      //   .attr("cx", (d) => x(d[0]))
      //   .attr("cy", (d) => y(d[1]))
      //   .style("cursor", "pointer")
      //   .style("fill", colors[utility.utility_name] || "steelblue")
      //   .call(drag);

      const circleGroup = focus.append("g").attr("id", `circle_${utility.utility_name}`);

      circleGroup.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("id", (_, i) => `circle_${utility.utility_name}_${i}`)
        .attr("r", 5)
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .style("cursor", "pointer")
        .style("fill", colors[utility.utility_name] || "steelblue")
        .call(drag);

      // focus
      //   .selectAll("circle")
      //   .data(points)
      //   .enter()
      //   .append("circle")
      //   .attr("r", 5)
      //   .attr("cx", (d) => x(d[0]))
      //   .attr("cy", (d) => y(d[1]))
      //   .style("cursor", "pointer")
      //   .style("fill", colors[utility.utility_name] || "steelblue")
      //   .call(drag);




      // focus
      //   .selectAll("circle")
      //   .on("mouseover", function (event, d: any) {
      //     focus
      //       .append("text")
      //       .attr("id", "tooltip")
      //       .attr("x", x(d[0]) - 10)
      //       .attr("y", y(d[1]) - 10)
      //       .text(`(${Math.round(d[0] * 100) / 100}, ${Math.round(d[1] * 100) / 100})`);
      //   })
      //   .on("mouseout", function () {
      //     focus.select("#tooltip").remove();
      //   });
    });






  }, [utilities, colors]);

  return <svg ref={svgRef} width={700} height={400} ></svg>;
};

export default AllocationChart;
