import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { debounce, throttle } from 'radash';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
// import { setActiveUtility } from '@/store/utilitiesSlice';

import { Colors, Utility } from '@/lib/types';
import { shortenNumber } from '@/helpers/helper';

type Point = [number, number];

interface AllocationChartProps {
  utilities: Utility[];
  setUtilities: (utilities: Utility[]) => void;
  colors: Colors;
  onActive: (utility_name: string) => void;
  // onUtilitiesChange?: (newUtilities: Utility[]) => void;
};

interface currentUtility {
  utility_name: string;
  fdv: number;
  ldt: number;
  conc: number;
  midPoint: Point;
}



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
// const nearestPoint = (a: number, b: number, px: number, py: number): [number, number] => {
//   if (px < 0 && py > b) return [0, b];
//   if (px > a && py < 0) return [a, 0];
//   let check_below = Math.pow(px / a, Math.exp(-3)) + Math.pow(py / b, Math.exp(-3)) < 1
//   if (check_below) {
//     const k = Math.exp(-3);
//     let slope = Math.pow((b / a), k) * Math.pow((px / py), k - 1)
//     // equation for x: (x/a)^k + ((slope*(x-px)+py)/b)^k = 1
//     // equation for y given x is found: b * (1 - (x/a)^(k))^1/k
//   }
//   return [px, py];
// }



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

  let exp_conc = Math.exp(conc);
  let midY = fdv * Math.pow(1 - Math.pow(midX / ldt, exp_conc), 1 / exp_conc);

  return [midX, midY];

}

// const AllocationChart: React.FC<AllocationChartProps> = ({ utilities, setUtilities, colors, onActive }) => {
const AllocationChart: React.FC<AllocationChartProps> = () => {

  const dispatch = useDispatch();
  const utilities = useSelector((state: RootState) => state.utilities.utilities);
  const activeUtility = useSelector((state: RootState) => state.utilities.activeUtility);
  
  const svgRef = useRef<SVGSVGElement>(null);
  // const [activeUtility, setActiveUtility] = useState<string | null>(null);
  // const [currentUtilities, setCurrentUtilities] = useState<currentUtility[]>([]);

  const maxXValue = 3000000; // $3M cutoff on the x-axis

  useEffect(() => {
    let newUtilities = utilities.map((utility) => {
      let midPoint = findMidPoint(utility.fdv, utility.ldt, utility.conc, maxXValue);
      return { utility_name: utility.utility_name, fdv: utility.fdv, ldt: utility.ldt, conc: utility.conc, midPoint: midPoint };
    });
    setCurrentUtilities(newUtilities);
  }, [utilities]);

  useEffect(() => {
    if (!activeUtility) {
      let maxLdt = 0;
      let maxLdtUtility = "";
      currentUtilities.forEach((utility) => {
        if (utility.ldt > maxLdt) {
          maxLdt = utility.ldt;
          maxLdtUtility = utility.utility_name;
        }
      });
      if (maxLdtUtility) {
        console.log("Setting active utility to max ldt utility", maxLdtUtility)
        setActiveUtility(maxLdtUtility);
      }
      else {
        console.log("No utility found with ldt > 0")
      }
    }
  }, [activeUtility]);

  useEffect(() => {
    onActive(activeUtility ?? "");
  }, [activeUtility]);


  const debouncedSetUtilities = useCallback(debounce({ "delay": 600 }, setUtilities), [setUtilities]);
  const throttledSetUtilities = useCallback(throttle({ "interval": 600 }, setUtilities), [setUtilities]);

  useEffect(() => {

    const utilities = currentUtilities.map((utility) => {
      return {
        utility_name: utility.utility_name,
        fdv: utility.fdv,
        ldt: utility.ldt,
        conc: utility.conc
      } as Utility;
    });

    debouncedSetUtilities(utilities);
    throttledSetUtilities(utilities);

  }, [currentUtilities]);

  // const updateUtilities = useCallback((updatedUtility: Utility) => {
  //   const updatedUtilities = currentUtilities.map(utility =>
  //     utility.utility_name === updatedUtility.utility_name ? updatedUtility : utility
  //   );
  //   onUtilitiesChange?.(updatedUtilities);
  // }, [currentUtilities, onUtilitiesChange]);

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;



    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const focus = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, maxXValue]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 1]).range([height, 0]);

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
      .style("text-anchor", "middle");

    focus.selectAll(".tick text")
      .style("font-weight", "bolder");

    const line = d3
      .line<Point>()
      .curve(d3.curveCatmullRom.alpha(0.5))
      .x((d) => x(d[0]))
      .y((d) => y(d[1]));

    currentUtilities.forEach((utility) => {
      if (utility.fdv === 0 || utility.ldt === 0) return;

      let points: Point[] = [
        [0, utility.fdv], // First point on Y-axis.  Cap at max Y
        utility.midPoint, // Midpoint
        [utility.ldt, 0], // Third point on X-axis.  Cap at maxXValue.
      ];

      const minPxDist = 10;
      const minXCoordDist = () => x.invert(minPxDist) - x.invert(0);
      const minYCoordDist = () => y.invert(0) - y.invert(minPxDist);

      const generateCurvePoints = (a: number, b: number, k: number, numPoints = 200) => {
        let curvePoints: [number, number][] = [];
        for (let i = 0; i <= numPoints; i++) {
          let xCoord = (i / numPoints) * a;
          if (xCoord > maxXValue) break;
          let yCoord = b * Math.pow(1 - Math.pow(xCoord / a, k), 1 / k);
          if (!isNaN(yCoord)) {
            curvePoints.push([xCoord, yCoord]);
          }
        }

        // smooth the curve by adjusting the points with a minimum distance
        // for (let i = 1; i < curvePoints.length; i++) {
        //   let [x1, y1] = curvePoints[i - 1];
        //   let [x2, y2] = curvePoints[i];
        //   let dist = distance(x1, y1, x2, y2);
        //   if (dist < minPxDist) {
        //     let midX = (x1 + x2) / 2;
        //     let midY = (y1 + y2) / 2;
        //     let angle = Math.atan2(y2 - y1, x2 - x1);
        //     let dx = Math.cos(angle) * minPxDist / 2;
        //     let dy = Math.sin(angle) * minPxDist / 2;
        //     curvePoints[i - 1] = [midX - dx, midY - dy];
        //     curvePoints[i] = [midX + dx, midY + dy];
        //   }
        // }

        return curvePoints;
      };

      // const generateCurvePoints = (a: number, b: number, k: number, numPoints = 200) => {
      //   let curvePoints: [number, number][] = [];
      //   let prevAngle: number | null = null;
      //   const minArcXRadius = minXCoordDist();
      //   const minArcYRadius = minYCoordDist();

      //   for (let i = 0; i <= numPoints; i++) {
      //     let xCoord = (i / numPoints) * a;
      //     if (xCoord > maxXValue) break;
      //     let yCoord = b * Math.pow(1 - Math.pow(xCoord / a, k), 1 / k);
      //     if (!isNaN(yCoord)) {
      //       if (curvePoints.length >= 2) {
      //         let [x1, y1] = curvePoints[curvePoints.length - 2];
      //         let [x2, y2] = curvePoints[curvePoints.length - 1];
      //         let angle1 = Math.atan2(y2 - y1, x2 - x1);
      //         let angle2 = Math.atan2(yCoord - y2, xCoord - x2);
      //         let angleDiff = Math.abs(angle2 - angle1);

      //         if (prevAngle !== null && angleDiff > Math.PI / 6) {
      //           // Insert an arc to smooth the corner
      //           let arcCenterX = x2 + minArcXRadius * Math.cos(angle1 + Math.PI / 2);
      //           let arcCenterY = y2 + minArcYRadius * Math.sin(angle1 + Math.PI / 2);
      //           // remove the last point
      //           curvePoints.pop();
      //           curvePoints.push([arcCenterX, arcCenterY]);
      //         }

      //         prevAngle = angle2;
      //       }
      //       curvePoints.push([xCoord, yCoord]);
      //     }
      //   }
      //   return curvePoints;
      // };

      const drag = d3.drag<SVGCircleElement, Point>().on("drag", function (event, d) {
        setActiveUtility(utility.utility_name);
        const i = points.indexOf(d);

        if (i === 0) {
          d[0] = 0;
          d[1] = Math.max(0.01, Math.min(height, y.invert(event.y)));

          if (points[1][1] > d[1]) {
            points[1][1] = d[1];
          }

        } else if (i === 2) {
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
        let conc = Math.log(k ?? 1);
        let curvePoints: [number, number][] = [];
        if (k !== null) {
          curvePoints = generateCurvePoints(points[2][0], points[0][1], k);
          curvePath.datum(curvePoints).attr("d", line);
        }
        else {
          curvePath.datum([points[0], points[2]]).attr("d", line);
        }

        d3.select(this).attr("cx", x(d[0])).attr("cy", y(d[1]));

        points.forEach((point, i) => {
          focus.select(`#circle_${utility.utility_name}_${i}`).attr("cx", x(point[0])).attr("cy", y(point[1]));
        });

        // Update the text and circle for the holder circle
        if (points[2][0] > maxXValue) {
          focus.select(`#holder_circle_${utility.utility_name}`).attr("cx", x(curvePoints[curvePoints.length - 1][0])).attr("cy", y(curvePoints[curvePoints.length - 1][1]));
          focus.select(`#holder_text_${utility.utility_name}`).attr("x", x(curvePoints[curvePoints.length - 1][0]) + 15).attr("y", y(curvePoints[curvePoints.length - 1][1]) + 5);
        }

        setCurrentUtilities((prevCurrentUtilities) => {
          let updatedUtility = {
            utility_name: utility.utility_name,
            fdv: points[0][1],
            ldt: points[2][0],
            conc: conc,
            midPoint: [points[1][0], points[1][1]] as Point
          };

          let updatedUtilities = prevCurrentUtilities.map((prevUtility) =>
            prevUtility.utility_name === updatedUtility.utility_name ? updatedUtility : prevUtility
          );

          return updatedUtilities;
        });
      });


      const curvePoints = generateCurvePoints(points[2][0], points[0][1], Math.exp(utility.conc)); // Initial k=1
      const curvePath = focus.append("path")
        .datum(curvePoints)
        .attr("fill", "none")
        .attr("stroke", colors[utility.utility_name] || "red")
        .attr("stroke-width", 2.5)
        .attr("d", line)
        .style("opacity", activeUtility === utility.utility_name ? 1 : 0.3)
        .on("click", () => setActiveUtility(utility.utility_name));

      const circleGroup = focus.append("g").attr("id", `circle_${utility.utility_name}`);

      circleGroup.selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("id", (_, i) => `circle_${utility.utility_name}_${i}`)
        .attr("r", 5)
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]))
        .attr("stroke", "white")
        .attr("stroke-width", 2.5)
        .style("cursor", "pointer")
        .style("fill", colors[utility.utility_name] || "steelblue")
        .call(drag)
        .style("opacity", activeUtility === utility.utility_name ? 1 : 0.3)
        .on("click", () => setActiveUtility(utility.utility_name));

      if (points[2][0] > maxXValue) {
        circleGroup.append("circle")
          .attr("id", `holder_circle_${utility.utility_name}`)
          .attr("r", 5)
          .attr("cx", x(curvePoints[curvePoints.length - 1][0]))
          .attr("cy", y(curvePoints[curvePoints.length - 1][1]))
          .attr("stroke", "white")
          .attr("stroke-width", 2.5)
          .style("fill", colors[utility.utility_name] || "steelblue")
          .style("cursor", "default")
          .style("opacity", activeUtility === utility.utility_name ? 1 : 0.3)
          .on("click", () => setActiveUtility(utility.utility_name));

        circleGroup.append("text")
          .attr("id", `holder_text_${utility.utility_name}`)
          .attr("x", x(curvePoints[curvePoints.length - 1][0]) + 15)
          .attr("y", y(curvePoints[curvePoints.length - 1][1]) + 5)
          .attr("fill", colors[utility.utility_name] || "steelblue")
          .style("opacity", activeUtility === utility.utility_name ? 1 : 0.3)
          .text(`$${shortenNumber(utility.ldt, 3, 7, 0, 0)}`)
      }

      if (activeUtility === utility.utility_name) {
        curvePath.raise();
        circleGroup.raise();
      }
      else {
        circleGroup.lower();
        curvePath.lower();
      }

    });

  }, [utilities, colors, activeUtility]);

  return <svg ref={svgRef} width={750} height={400} ></svg>;
};

export default AllocationChart;