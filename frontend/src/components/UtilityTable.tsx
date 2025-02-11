import React, { useEffect, useState, useCallback, memo } from "react";
import { debounce, throttle } from 'radash';
import { Utility } from "@/lib/types";
import { shortenNumber } from "@/helpers/helper";



interface UtilityTableProps {
  maxBudget: number;
  utilities: Utility[];
  currBudget: number;
  setCurrBudget: (currBudget: number) => void;
}

const UtilityTable: React.FC<UtilityTableProps> = ({
  maxBudget,
  utilities,
  currBudget,
  setCurrBudget,
}) => {

  const [sliderValue, setSliderValue] = useState<number>(currBudget);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBudget = Number(event.target.value);
    if (newBudget < 0 || newBudget > maxBudget) return;
    if (newBudget == currBudget) return;
    setSliderValue(newBudget);
  };


  useEffect(() => {
    if (sliderValue !== currBudget) {
      setSliderValue(currBudget);
    }

  }, [currBudget, sliderValue]);


  const debouncedOnAction = useCallback(debounce({ delay: 600 }, setCurrBudget), [setCurrBudget]);
  const throttledOnAction = useCallback(throttle({ interval: 600 }, setCurrBudget), [setCurrBudget]);

  useEffect(() => {
    debouncedOnAction(sliderValue);
    // throttledOnAction(sliderValue);

    return () => {
      debouncedOnAction.cancel();
      // throttledOnAction.cancel();
    };

  }, [sliderValue]);

  console.log('currentBudget', currBudget)
  console.log('setCurrentBudget', setCurrBudget)
  console.log('maxBudget', maxBudget)

  return (
    <div className="flex flex-col w-full h-full p-4 bg-gray-50 m-0">
      {/* Budget Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={maxBudget}
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-2 appearance-none bg-gray-200 rounded-full focus:outline-none focus:ring-blue-400 slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(sliderValue / maxBudget) * 100 - 2
              }%, #e5e7eb ${(sliderValue / maxBudget) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <div className="text-sm text-gray-600 mb-2 text-left">
          Simulated Budget: {shortenNumber(sliderValue, 3, 10, 0, 1)}
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

export default memo(UtilityTable);

