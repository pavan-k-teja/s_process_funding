import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Colors, Disagreements } from "@/lib/types";
import { shortenNumber } from "@/helpers/helper";

const DisagreementsSidebar: React.FC = () => {
    const colors = useSelector((state: RootState) => state.colors);
    const disagreements = useSelector((state: RootState) => state.disagreements);

    const [selectedRecommender, setSelectedRecommender] = useState<string | null>("JT");
    const [showAll, setShowAll] = useState<boolean>(false);

    const recommenders = Object.keys(disagreements);

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRecommender(event.target.value);
    };

    const getSortedDisagreements = (recommender: string) => {
        const orgDisagreements = disagreements[recommender] || {};
        const filteredDisagreements = Object.fromEntries(Object.entries(orgDisagreements).filter(([org, value]) => value !== 0));

        return Object.entries(filteredDisagreements)
            .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));
    };

    return (
        <div className="p-2 bg-white shadow-md rounded-lg w-full max-w-lg">
            <div className="flex items-center mb-1 justify-center">
                <h2 className="text-sm font-semibold mr-1">Σ's disagreements with</h2>

                <select
                    value={selectedRecommender || ""}
                    onChange={handleSelectChange}
                    className="border p-1 rounded bg-white text-gray-800 focus:outline-none focus:ring focus:border-blue-400 w-min text-xs"
                >
                    {recommenders.map((rec) => (
                        <option key={rec} value={rec}>{rec}</option>
                    ))}
                </select>
            </div>

            {selectedRecommender && (
                <div className="max-h-64 overflow-y-auto border rounded p-1">
                    {getSortedDisagreements(selectedRecommender)
                        .map(([org, value]) => (
                            <div key={org} className="flex items-center justify-between p-1 border-b last:border-0 text-xs">
                                <div className="flex items-center">
                                    <span
                                        className="w-3 h-3 mr-1"
                                        style={{ backgroundColor: colors[org] || "#ccc" }}
                                    />
                                    <span className="font-medium">{org}</span>
                                </div>

                                <span className={`font-semibold ${value > 0 ? "text-green-600" : "text-red-600"}`}>
                                    {value > 0 ? "+" : "-"}{shortenNumber(Math.abs(value), 3, 7, 0, 0)}
                                </span>
                            </div>
                        ))
                    }
                </div>
            )}

            {/* {selectedRecommender && getSortedDisagreements(selectedRecommender).length > 10 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="mt-2 px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 text-xs w-full"
                >
                    {showAll ? "Show Top 10" : "Show All"}
                </button>
            )} */}
        </div>
    );
};

export default DisagreementsSidebar;