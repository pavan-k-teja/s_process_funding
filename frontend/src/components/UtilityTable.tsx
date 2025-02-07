import React, { useState } from "react";

interface CompanyData {
  name: string;
  fdv: number;
  ldt: string; // Assuming this is a formatted string like "243k"
  conc: number;
}

interface UtilityTableProps {
  initialBudget: number;
  maxBudget: number;
  companies: CompanyData[];
}

const UtilityTable: React.FC<UtilityTableProps> = ({
  initialBudget,
  maxBudget,
  companies,
}) => {
  const [currentBudget, setCurrentBudget] = useState(initialBudget);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentBudget(Number(event.target.value));
  };

  return (
    <div className="flex flex-col w-full h-full p-4 bg-gray-50">
      {/* Budget Slider */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          Simulated Budget: {currentBudget.toLocaleString()}k
        </div>
        <input
          type="range"
          min="0"
          max={maxBudget}
          value={currentBudget}
          onChange={handleSliderChange}
          className="w-full h-2 appearance-none bg-gray-200 rounded-full focus:outline-none focus:ring-blue-400 slider-thumb"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentBudget / maxBudget) * 100
              }%, #e5e7eb ${(currentBudget / maxBudget) * 100}%, #e5e7eb 100%)`,
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-y-auto border rounded-md shadow-sm bg-white max-h-[80vh]">
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
            {companies.map((company, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100 text-left`}
              >
                <td className=" text-gray-600 font-bold">{company.name}</td>
                <td
                  className={` ${company.fdv > 0 ? "text-gray-800" : ""
                    }`}
                >
                  {company.fdv > 0 ? `${company.fdv.toLocaleString()}k` : "0.00"}
                </td>
                <td className=" text-gray-800">{company.ldt || "0.00"}</td>
                <td
                  className={` ${company.conc < 0
                      ? "text-red-600 font-medium"
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
