import React, { useEffect, useState, useRef, useMemo } from "react";
import { throttle } from 'lodash';
import { Allocation, Utility } from "@/lib/types";
import { shortenNumber } from "@/helpers/helper";

import { RootState, AppDispatch } from '@/store';
import { useSelector, useDispatch } from 'react-redux';
import { setAllocations } from '@/store';
import { allocate_budget, funder_allocations } from '@/helpers/helper';
import { setBudgetChange } from "@/store";

interface UtilityTableProps {
  enableReadOnly: boolean;
  viewType: "recommender" | "funder" | "sigma";
}

const UtilityTable: React.FC<UtilityTableProps> = ({ enableReadOnly, viewType }) => {

  const dispatch = useDispatch<AppDispatch>();

  const originalUtilities = useSelector((state: RootState) => state.utilities);

  const formattedOriginalUtilities: { [key: string]: Utility; } = {};
  for (const utility of originalUtilities) {
    formattedOriginalUtilities[utility.utility_name] = utility;
  }


  const utilities = useSelector((state: RootState) => state.dynamicUtilities);
  const viewUser = useSelector((state: RootState) => state.currentUser?.viewUser);
  const userBudget = viewUser?.budget || 1000;
  const maxBudget = viewUser?.max_budget || 1000;


  const funderName: string = useSelector((state: RootState) => state.currentUser?.user?.username) || "";
  const recommenderNames = useSelector((state: RootState) => state.users.filter(user => user.role === "recommender").map(user => user.username));
  const apiData = useSelector((state: RootState) => state.apiData);
  const recommenderToOrgUtilities = apiData.utilities.filter(utility => recommenderNames.includes(utility.username));

  const [currBudget, setCurrBudget] = useState<number>(userBudget);

  const changeDetection = useSelector((state: RootState) => state.changeDetection);
  const budgetChanged = changeDetection.isBudgetChanged;


  useEffect(() => {
    setCurrBudget(userBudget);
  }, [maxBudget, userBudget]);


  useEffect(() => {
    if (budgetChanged == -2) {
      setCurrBudget(userBudget);
    }
  }, [budgetChanged]);



  const updateAllocations = () => {

    let newAllocations: Allocation[] = [] as Allocation[]
    if (viewType == "recommender") {
      newAllocations = allocate_budget(utilities, currBudget ?? (userBudget ?? 0));

    }
    else if (viewType == "funder") {
      const allUtilities = recommenderToOrgUtilities.concat(utilities);
      newAllocations = funder_allocations(allUtilities, currBudget ?? (userBudget ?? 0), funderName, recommenderNames);
    }

    dispatch(setAllocations(newAllocations));

  }

  const ref = useRef(updateAllocations);

  useEffect(() => {
    ref.current = updateAllocations;

    if (userBudget && currBudget != userBudget) {
      dispatch(setBudgetChange(currBudget));
    }
    else {
      dispatch(setBudgetChange(-1));
    }
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
            {utilities.map((company, index) => {

              const currentOriginalUtility = formattedOriginalUtilities[company.utility_name];
              if (!currentOriginalUtility) return null;
              const fdvClass = currentOriginalUtility && company.fdv < currentOriginalUtility.fdv ? "bg-red-500 text-white" : currentOriginalUtility && company.fdv > currentOriginalUtility.fdv ? "bg-[#005a16] text-white" : "";

              const ldtClass = currentOriginalUtility && company.ldt < currentOriginalUtility.ldt ? "bg-red-500 text-white" : currentOriginalUtility && company.ldt > currentOriginalUtility.ldt ? "bg-[#005a16] text-white" : "";

              const concClass = currentOriginalUtility && company.conc < currentOriginalUtility.conc ? "bg-red-500 text-white" : currentOriginalUtility && company.conc > currentOriginalUtility.conc ? "bg-[#005a16] text-white" : "";


              return (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 text-left`}
                >
                  <td className="pr-2 text-gray-600 font-bold">{company.utility_name}</td>
                  <td

                    className={`pr-1 ${company.fdv > 0 ? "text-gray-800" : ""
                      } ${fdvClass}`}
                  >
                    {company.fdv > 0 ? `${company.fdv.toFixed(2)}` : "0.00"}
                  </td>
                  <td className={`pl-1 text-gray-800 ${ldtClass}`}>{shortenNumber(company.ldt, 3, 6, 0, 1) || "0.00"}</td>
                  <td
                    className={`pl-1 ${company.conc < 0
                      ? "text-gray-800 "
                      : company.conc > 0
                        ? "text-gray-800"
                        : "text-gray-800"
                      } ${concClass}`}
                  >
                    {company.conc.toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UtilityTable;

