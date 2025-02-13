import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as d3 from "d3";
import { debounce, throttle } from 'lodash';

import { Colors, Utility, Allocation } from '@/lib/types';
import { shortenNumber } from '@/helpers/helper';

import { RootState, AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { setDynamicUtilities, setActiveUtility, setAllocations } from '@/store';
import { allocate_budget } from '@/helpers/helper';



type Point = [number, number];

interface AllocationChartProps {
  // utilities: Utility[];
  // setUtilities: (utilities: Utility[]) => void;
  // colors: Colors;
  // onActive: (utility_name: string) => void;
  // onUtilitiesChange?: (newUtilities: Utility[]) => void;

  enableUtilityHighlight: boolean;
  fundViewCutoff: number;
};

interface currentUtility {
  username: string;
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

// const distance = (x1: number, y1: number, x2: number, y2: number) => {
//   return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
// }

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

const findMidPoint = (fdv: number, ldt: number, conc: number, fundViewCutoff: number): Point => {

  let midX = Math.min(0.5 * ldt, 0.5 * fundViewCutoff);

  let exp_conc = Math.exp(conc);
  let midY = fdv * Math.pow(1 - Math.pow(midX / ldt, exp_conc), 1 / exp_conc);

  return [midX, midY];

}

// const AllocationChart: React.FC<AllocationChartProps> = ({ utilities, setUtilities, colors, onActive }) => {
const AllocationChart: React.FC<AllocationChartProps> = ({ enableUtilityHighlight, fundViewCutoff }) => {
  const dispatch = useDispatch<AppDispatch>();

  const originalUtilities = useSelector((state: RootState) => state.utilities);
  const dynamicUtilities = useSelector((state: RootState) => state.dynamicUtilities);
  const colors = useSelector((state: RootState) => state.colors);
  const focusUtility = useSelector((state: RootState) => state.focusUtility);
  const budget = useSelector((state: RootState) => state.currentUser?.viewUser?.budget);
  const focusedUtility = (enableUtilityHighlight ? focusUtility.hoveredUtility || focusUtility.activeUtility : "");

  const [currentUtilities, setCurrentUtilities] = useState<currentUtility[]>([]);
  const [trigger, setTrigger] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);


  useEffect(() => {
    if (currentUtilities.length == 0) {
      console.log("Setting Current Utilities");
      // const filteredDynamicUtilities = dynamicUtilities.filter((utility) => utility.fdv !== 0 && utility.ldt !== 0);
      const filteredDynamicUtilities = dynamicUtilities;

      const newUtilities = filteredDynamicUtilities.map((utility) => {
        let midPoint = findMidPoint(utility.fdv, utility.ldt, utility.conc, fundViewCutoff);
        return { username: utility.username, utility_name: utility.utility_name, fdv: utility.fdv, ldt: utility.ldt, conc: utility.conc, midPoint: midPoint };
      });

      setCurrentUtilities(newUtilities);
      setTrigger(!trigger);
    }
    else {
      console.log("Current Utilities already set")
    }


  }, [dynamicUtilities]);


  const utilityChangeDetected = () => {
    console.log("INTO UTILITY CHANGE DETECTED", currentUtilities);
    if (currentUtilities.length > 0) {
      console.log("INTO ");
      // update the dynamic utilities with username and utility_name but dont remove the old ones
      // const upd

      // remove mid from each

      const updatedUtilities = currentUtilities.map((utility) => {
        let { midPoint, ...rest } = utility;
        return rest;
      });

      dispatch(setDynamicUtilities(updatedUtilities));
      const allocations_now = allocate_budget(currentUtilities, budget ?? 0);
      dispatch(setAllocations(allocations_now));

    }
  }

  const ref = useRef(utilityChangeDetected);

  useEffect(() => {
    ref.current = utilityChangeDetected;
  }, [currentUtilities]);


  const throttledSetUtilities = useMemo(() => {
    return throttle((() => { ref.current?.(); }), 600, { leading: true, trailing: true })
  }, []);


  const handleReset = () => {

    const newUtilities = originalUtilities.map((utility) => {
      let midPoint = findMidPoint(utility.fdv, utility.ldt, utility.conc, fundViewCutoff);
      return { username: utility.username, utility_name: utility.utility_name, fdv: utility.fdv, ldt: utility.ldt, conc: utility.conc, midPoint: midPoint };
    });

    setCurrentUtilities(newUtilities);
    setTrigger(!trigger);

    dispatch(setDynamicUtilities(originalUtilities));
    const allocations_now = allocate_budget(originalUtilities, budget ?? 0);
    dispatch(setAllocations(allocations_now));

  };



  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const focus = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, fundViewCutoff]).range([0, width]);
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
      .curve(d3.curveMonotoneX)
      .x((d) => x(d[0]))
      .y((d) => y(d[1]));

    currentUtilities.forEach((utility) => {
      if (utility.fdv === 0 || utility.ldt === 0) return;

      let points: Point[] = [
        [0, utility.fdv], // First point on Y-axis.  Cap at max Y
        utility.midPoint, // Midpoint
        [utility.ldt, 0], // Third point on X-axis.  Cap at fundViewCutoff.
      ];

      // const minPxDist = 10;
      // const minXCoordDist = x.invert(minPxDist) - x.invert(0);
      // const minYCoordDist = y.invert(0) - y.invert(minPxDist);

      const generateCurvePoints = (a: number, b: number, k: number, numPoints = 100) => {
        let curvePoints: [number, number][] = [];
        if (k > Math.exp(3)) {
          k = Math.exp(3);
        }
        for (let i = 0; i <= numPoints; i++) {
          let xCoord = (i / numPoints) * a;
          if (xCoord > fundViewCutoff) break;
          let yCoord = b * Math.pow(1 - Math.pow(xCoord / a, k), 1 / k);

          if (!isNaN(yCoord)) {
            curvePoints.push([xCoord, yCoord]);
          }
        }

        return curvePoints;
      };


      const drag = d3.drag<SVGCircleElement, Point>().on("drag", function (event, d) {
        dispatch(setActiveUtility(utility.utility_name));
        const i = points.indexOf(d);

        // Create a copy of the points array
        const newPoints = points.map(point => [...point] as Point);

        let k = null;
        let conc = 0;
        if (i === 0) {
          newPoints[0][0] = 0;
          newPoints[0][1] = Math.max(0.01, Math.min(height, y.invert(event.y)));

          if (newPoints[1][1] > newPoints[0][1]) {
            newPoints[1][1] = newPoints[0][1];
          }

        } else if (i === 2) {
          newPoints[2][0] = Math.max(0.01, Math.min(fundViewCutoff, x.invert(event.x)));
          newPoints[2][1] = 0;

          if (newPoints[1][0] > newPoints[2][0]) {
            newPoints[1][0] = newPoints[2][0];
          }

        } else if (i === 1) {
          newPoints[1][0] = Math.max(0.01 * newPoints[2][0], Math.min(newPoints[2][0], x.invert(event.x)));
          newPoints[1][1] = Math.max(0.01 * newPoints[0][1], Math.min(newPoints[0][1], y.invert(event.y)));

          if (newPoints[1][0] >= newPoints[2][0] && newPoints[1][1] >= newPoints[0][1]) {
            newPoints[1][0] = 0.99 * newPoints[2][0];
            newPoints[1][1] = 0.99 * newPoints[0][1];
          }
        }


        let p = newPoints[1][0] / newPoints[2][0];
        let q = newPoints[1][1] / newPoints[0][1];

        k = solveForX(p, q);
        conc = Math.log(k ?? 1);

        if (k && k > Math.exp(3)) {
          let a = newPoints[2][0];
          let b = newPoints[0][1];
          let k_new = Math.exp(3);
          k = k_new;
          conc = Math.log(k_new);

          if (p > Math.pow(0.5, 1 / k_new) && q > Math.pow(0.5, 1 / k_new)) {
            newPoints[1][0] = a * Math.pow(0.5, 1 / k_new);
            newPoints[1][1] = b * Math.pow(0.5, 1 / k_new);
          } else if (p > q) {
            let yCoord = newPoints[1][1];
            let xCoord = a * Math.pow(1 - Math.pow(yCoord / b, k_new), 1 / k_new);
            newPoints[1][0] = xCoord;
          } else if (p < q) {
            let xCoord = newPoints[1][0];
            let yCoord = b * Math.pow(1 - Math.pow(xCoord / a, k_new), 1 / k_new);
            newPoints[1][1] = yCoord;
          } else {
            newPoints[1][0] = a * Math.pow(0.5, 1 / k_new);
            newPoints[1][1] = b * Math.pow(0.5, 1 / k_new);
          }
        }

        let curvePoints: [number, number][] = [];
        if (k !== null) {
          curvePoints = generateCurvePoints(newPoints[2][0], newPoints[0][1], k);
          curvePath.datum(curvePoints).attr("d", line);
        } else {
          curvePath.datum([newPoints[0], newPoints[2]]).attr("d", line);
        }

        d3.select(this).attr("cx", x(newPoints[i][0])).attr("cy", y(newPoints[i][1]));

        newPoints.forEach((point, i) => {
          focus.select(`#circle_${utility.utility_name}_${i}`).attr("cx", x(point[0])).attr("cy", y(point[1]));
        });

        if (newPoints[2][0] > fundViewCutoff) {
          focus.select(`#holder_circle_${utility.utility_name}`).attr("cx", x(curvePoints[curvePoints.length - 1][0])).attr("cy", y(curvePoints[curvePoints.length - 1][1]));
          focus.select(`#holder_text_${utility.utility_name}`).attr("x", x(curvePoints[curvePoints.length - 1][0]) + 15).attr("y", y(curvePoints[curvePoints.length - 1][1]) + 5);
        }

        // change points to newpoints
        // points = newPoints;

        setCurrentUtilities((prevCurrentUtilities) => {
          let updatedUtility = {
            username: utility.username,
            utility_name: utility.utility_name,
            fdv: newPoints[0][1],
            ldt: newPoints[2][0],
            conc: conc,
            midPoint: [newPoints[1][0], newPoints[1][1]] as Point
          };

          let updatedUtilities = prevCurrentUtilities.map((prevUtility) =>
            prevUtility.utility_name === updatedUtility.utility_name ? updatedUtility : prevUtility
          );

          return updatedUtilities;
        });

        for (let i = 0; i < newPoints.length; i++) {
          for (let j = 0; j < newPoints[i].length; j++) {
            points[i][j] = newPoints[i][j];
          }
        }

        throttledSetUtilities();
      });


      const curvePoints = generateCurvePoints(points[2][0], points[0][1], Math.exp(utility.conc)); // Initial k=1
      const curvePath = focus.append("path")
        .datum(curvePoints)
        .attr("fill", "none")
        .attr("stroke", colors[utility.utility_name] || "red")
        .attr("stroke-width", 2.5)
        .attr("d", line)
        .style("opacity", focusedUtility === utility.utility_name ? 1 : 0.3)
        .on("click", () => dispatch(setActiveUtility(utility.utility_name)));

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
        .style("opacity", focusedUtility === utility.utility_name ? 1 : 0.3)
        .on("click", () => dispatch(setActiveUtility(utility.utility_name)));

      if (points[2][0] > fundViewCutoff) {
        circleGroup.append("circle")
          .attr("id", `holder_circle_${utility.utility_name}`)
          .attr("r", 5)
          .attr("cx", x(curvePoints[curvePoints.length - 1][0]))
          .attr("cy", y(curvePoints[curvePoints.length - 1][1]))
          .attr("stroke", "white")
          .attr("stroke-width", 2.5)
          .style("fill", colors[utility.utility_name] || "steelblue")
          .style("cursor", "default")
          .style("opacity", focusedUtility === utility.utility_name ? 1 : 0.3)
          .on("click", () => dispatch(setActiveUtility(utility.utility_name)));


        circleGroup.append("text")
          .attr("id", `holder_text_${utility.utility_name}`)
          .attr("x", x(curvePoints[curvePoints.length - 1][0]) + 15)
          .attr("y", y(curvePoints[curvePoints.length - 1][1]) + 5)
          .attr("fill", colors[utility.utility_name] || "steelblue")
          .style("opacity", focusedUtility === utility.utility_name ? 1 : 0.3)
          .text(`$${shortenNumber(utility.ldt, 3, 7, 0, 0)}`)
      }

      if (focusedUtility === utility.utility_name) {
        curvePath.raise();
        circleGroup.raise();
      }
      else {
        circleGroup.lower();
        curvePath.lower();
      }

    });

  }, [focusedUtility, trigger]);

  return (
    // <svg ref={svgRef} width={750} height={400} ></svg>

    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width={750} height={400}></svg>
      {/* <button
        onClick={handleReset}
        style={{
          position: 'absolute',
          bottom: '-30px',
          right: '50px',
          padding: '1px 5px',
          backgroundColor: 'transparent',
          color: 'black',
          border: '1px solid #aaa',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          hover: { backgroundColor: '#ddd' }
        }}
      >
        Reset
      </button> */}

      <button
        onClick={handleReset}
        className="absolute bottom-[-30px] right-[45px] px-2 py-0 bg-transparent text-black font-medium border border-gray-400 rounded cursor-pointer text-xs hover:bg-gray-200 hover:border-gray-600"
      >
        Reset
      </button>

    </div>

  );
};

export default AllocationChart;