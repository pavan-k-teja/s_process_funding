import React, { useEffect, useState, useRef, useMemo } from "react";
import { throttle } from 'lodash';
import { Utility } from "@/lib/types";
import { shortenNumber } from "@/helpers/helper";

import { RootState, AppDispatch } from '@/store';
import { useSelector, useDispatch } from 'react-redux';
import { setAllocations } from '@/store';

import { allocate_budget } from '@/helpers/helper';


// interface UtilityTableProps {
//   maxBudget: number;
//   utilities: Utility[];
//   currBudget: number;
//   setCurrBudget: (currBudget: number) => void;
// }

const UtilityTable: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  const utilities = useSelector((state: RootState) => state.dynamicUtilities);
  const viewUser = useSelector((state: RootState) => state.currentUser?.viewUser);
  const maxBudget = viewUser?.max_budget || 1000;
  // const budget = viewUser?.budget || maxBudget;

  const [currBudget, setCurrBudget] = useState<number>(maxBudget);

  useEffect(() => {
    setCurrBudget(maxBudget);
  }, [maxBudget]);


  const updateAllocations = () => {
    const newAllocations = allocate_budget(utilities, currBudget);
    dispatch(setAllocations(newAllocations));
  }

  const ref = useRef(updateAllocations);

  useEffect(() => {
    // updating ref when state changes
    // now, ref.current will have the latest sendRequest with access to the latest state
    ref.current = updateAllocations;
  }, [currBudget]);

  
  const throttledUpdateAllocations = useMemo(() => {
    return throttle((() => { ref.current?.(); }), 600, { leading: true, trailing: true })
  }, []);



  const handleBudgetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBudget = Number(event.target.value);
    if (newBudget < 1000 || newBudget > maxBudget) return;
    if (newBudget == currBudget) return;
    setCurrBudget(newBudget);

    throttledUpdateAllocations();
  };


  // useEffect(() => {
  //   if (sliderValue !== currBudget) {
  //     setSliderValue(currBudget);
  //   }

  // }, [currBudget]);


  // const debouncedOnAction = useCallback(debounce({ delay: 600 }, setCurrBudget), [setCurrBudget]);
  // const throttledOnAction = useCallback(throttle({ interval: 600 }, setCurrBudget), [setCurrBudget]);

  // useEffect(() => {
  //   debouncedOnAction(sliderValue);
  //   // throttledOnAction(sliderValue);

  //   return () => {
  //     debouncedOnAction.cancel();
  //     // throttledOnAction.cancel();
  //   };

  // }, [sliderValue]);

  console.log('currentBudget', currBudget)
  console.log('setCurrentBudget', setCurrBudget)
  console.log('maxBudget', maxBudget)

  return (
    <div className="flex flex-col w-full h-full p-4 bg-gray-50 m-0">
      {/* Budget Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="1000"
          max={maxBudget}
          value={currBudget}
          onChange={handleBudgetChange}
          className="w-full h-2 appearance-none bg-gray-200 rounded-full focus:outline-none focus:ring-blue-400 slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currBudget / maxBudget) * 100 - 2
              }%, #e5e7eb ${(currBudget / maxBudget) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <div className="text-sm text-gray-600 mb-2 text-left">
          Simulated Budget: {shortenNumber(currBudget, 3, 10, 0, 1)}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-y-auto  rounded-md shadow-sm bg-white max-h-[80vh]">
        <table className="w-full table-auto border-collapse text-sm text-gray-700">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className=" text-left font-bold text-gray-600">
                Name
              </th>
              <th className=" text-left font-bold text-gray-600">
                FDV
              </th>
              <th className=" text-left font-bold text-gray-600">
                LDT
              </th>
              <th className=" text-left font-bold text-gray-600">
                CONC
              </th>
            </tr>
          </thead>
          <tbody>
            {utilities.map((company, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 text-left`}
              >
                <td className="pr-2 text-gray-600 font-bold">{company.utility_name}</td>
                <td
                  className={`pr-1 ${company.fdv > 0 ? "text-gray-800" : ""
                    }`}
                >
                  {company.fdv > 0 ? `${company.fdv.toFixed(2)}` : "0.00"}
                </td>
                <td className=" pl-1 text-gray-800">{shortenNumber(company.ldt, 3, 6, 0, 1) || "0.00"}</td>
                <td
                  className={`pl-1 ${company.conc < 0
                    ? "text-gray-800 "
                    : company.conc > 0
                      ? "text-gray-800"
                      : "text-gray-800"
                    }`}
                >
                  {company.conc.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UtilityTable;

