import React, { useEffect, useState, useRef, useMemo } from "react";
import { throttle } from 'lodash';
import { Allocation } from "@/lib/types";
import { shortenNumber } from "@/helpers/helper";

import { RootState, AppDispatch } from '@/store';
import { useSelector, useDispatch } from 'react-redux';
import { setAllocations } from '@/store';
import { allocate_budget, funder_allocations } from '@/helpers/helper';

interface UtilityTableProps {
  enableReadOnly: boolean;
  viewType: "recommender" | "funder" | "sigma";
}

const UtilityTable: React.FC<UtilityTableProps> = ({ enableReadOnly, viewType }) => {

  const dispatch = useDispatch<AppDispatch>();

  const utilities = useSelector((state: RootState) => state.dynamicUtilities);
  const viewUser = useSelector((state: RootState) => state.currentUser?.viewUser);
  const maxBudget = viewUser?.max_budget || 1000;


  const funderName: string = useSelector((state: RootState) => state.currentUser?.user?.username) || "";
  const recommenderNames = useSelector((state: RootState) => state.users.filter(user => user.role === "recommender").map(user => user.username));
  const apiData = useSelector((state: RootState) => state.apiData);
  const recommenderToOrgUtilities = apiData.utilities.filter(utility => recommenderNames.includes(utility.username));

  const [currBudget, setCurrBudget] = useState<number>(maxBudget);

  useEffect(() => {
    setCurrBudget(maxBudget);
  }, [maxBudget]);


  const updateAllocations = () => {
    // const newAllocations = allocate_budget(utilities, currBudget);
    // dispatch(setAllocations(newAllocations));


    let newAllocations: Allocation[] = [] as Allocation[]
    if (viewType == "recommender") {
      newAllocations = allocate_budget(utilities, currBudget ?? (maxBudget ?? 0));

    }
    else if (viewType = "funder") {
      const allUtilities = recommenderToOrgUtilities.concat(utilities);
      newAllocations = funder_allocations(allUtilities, currBudget ?? (maxBudget ?? 0), funderName, recommenderNames);
    }

    console.log("ALLOCATIONS_NOW", newAllocations);
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



  console.log('currentBudget', currBudget)
  console.log('setCurrentBudget', setCurrBudget)
  console.log('maxBudget', maxBudget)

  return (
    <div className="flex flex-col w-full h-max p-4 bg-gray-50 m-0 opacity-30 hover:opacity-100" style={{ pointerEvents: enableReadOnly ? "none" : "auto" }}>
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

