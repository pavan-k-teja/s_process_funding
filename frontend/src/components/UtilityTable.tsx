import React, { useState, useEffect } from "react";
import { Utility } from "@/lib/types";
import { shortenNumber } from "@/helpers/helper";

// interface CompanyData {
//   name: string;
//   fdv: number;
//   ldt: string; // Assuming this is a formatted string like "243k"
//   conc: number;
// }

interface UtilityTableProps {
  initialBudget: number;
  maxBudget: number;
  utilities: Utility[];
}

const UtilityTable: React.FC<UtilityTableProps> = ({
  initialBudget,
  maxBudget,
  utilities,
}) => {
  const [currentBudget, setCurrentBudget] = useState(initialBudget);

  useEffect(() => {
    setCurrentBudget(initialBudget);
  }, [initialBudget]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentBudget(Number(event.target.value));
  };

  console.log('initialBudget', initialBudget)
  console.log('currentBudget', currentBudget)
  console.log('maxBudget', maxBudget)

  return (
    <div className="flex flex-col w-full h-full p-4 bg-gray-50 m-0">
      {/* Budget Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={maxBudget}
          value={currentBudget}
          onChange={handleSliderChange}
          className="w-full h-2 appearance-none bg-gray-200 rounded-full focus:outline-none focus:ring-blue-400 slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentBudget / maxBudget) * 100 - 2
              }%, #e5e7eb ${(currentBudget / maxBudget) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <div className="text-sm text-gray-600 mb-2 text-left">
          Simulated Budget: {shortenNumber(currentBudget, 3, 10, 0, 1)}
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
