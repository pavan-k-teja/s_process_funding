import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { shortenNumber } from "@/helpers/helper";

const DisagreementMatrix: React.FC = () => {
    const utilities = useSelector((state: RootState) => state.utilities);
    const disagreements = useSelector((state: RootState) => state.disagreements);
    const recommenders = useSelector((state: RootState) =>
        state.users.filter(user => user.role === "recommender").map(user => user.username)
    );

    recommenders.sort((a, b) => a.localeCompare(b));

    const recommenderUtilities = utilities.filter(utility => recommenders.includes(utility.username));

    const utilitiesData: Record<string, Record<string, number>> = {};

    const allFDV: number[] = [], allLDT: number[] = [], allConc: number[] = [], allDiff: number[] = [];

    for (const utility of recommenderUtilities) {
        const { utility_name, username, fdv, ldt, conc } = utility;
        const disagreement = disagreements[username]?.[utility_name] || 0;

        if (!utilitiesData[utility_name]) {
            utilitiesData[utility_name] = {};
        }

        utilitiesData[utility_name][`${username}_fdv`] = fdv;
        utilitiesData[utility_name][`${username}_ldt`] = ldt;
        utilitiesData[utility_name][`${username}_conc`] = conc;
        utilitiesData[utility_name][`${username}_diff`] = disagreement;

        allFDV.push(fdv);
        allLDT.push(ldt);
        allConc.push(conc);
        allDiff.push(disagreement);
    }

    const minFDV = Math.min(...allFDV), maxFDV = Math.max(...allFDV);
    const minLDT = Math.min(...allLDT), maxLDT = Math.max(...allLDT);
    const minConc = Math.min(...allConc), maxConc = Math.max(...allConc);
    const minDiff = Math.min(...allDiff), maxDiff = Math.max(...allDiff);

    return (
        <div className="px-0 mx-0 bg-white rounded-lg w-fit max-w-fit overflow-x-visible">
            <h2 className="text-lg font-semibold mb-4">Disagreement Matrix</h2>

            <table className="w-fit text-xs border-spacing-1">
                <thead>
                    {/* Top row with FDV, LDT, Conc, Diff */}
                    <tr className="text-left">
                        <th className="p-1"></th>
                        <th className="p-1 text-left" colSpan={recommenders.length}>First Dollar Value</th>
                        <th className="p-1 text-left" colSpan={recommenders.length}>Last Dollar Threshold</th>
                        <th className="p-1 text-left" colSpan={recommenders.length}>Concavity</th>
                        <th className="p-1 text-left" colSpan={recommenders.length}>Difference</th>
                    </tr>

                    {/* Second row with recommender names */}
                    <tr className="text-left">
                        <th className="p-1 "></th>
                        {Array(4).fill(recommenders).flat().map(recommender => (
                            <th key={recommender} className="p-1 text-center">{recommender}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {Object.entries(utilitiesData).map(([utility_name, values]) => (
                        <tr key={utility_name} className="">
                            <td className="p-1 font-bold">{utility_name}</td>

                            {/* FDV */}
                            {recommenders.map(recommender => (
                                <React.Fragment key={recommender}>
                                    <td className="p-1 text-center w-5"
                                        style={{ backgroundColor: getNormalizedColor(values[`${recommender}_fdv`] || 0, minFDV, maxFDV, "fdv") }}>
                                        {(values[`${recommender}_fdv`]) ? (values[`${recommender}_fdv`] || 0).toFixed(2) : ""}
                                    </td>
                                </React.Fragment>
                            ))}


                            {/* LDT */}
                            {recommenders.map(recommender => (
                                <React.Fragment key={recommender}>
                                    <td className="p-1 text-center w-5"
                                        style={{ backgroundColor: getNormalizedColor(values[`${recommender}_ldt`] || 0, minLDT, maxLDT, "ldt") }}>
                                        {(values[`${recommender}_ldt`]) ? shortenNumber(values[`${recommender}_ldt`] || 0, 3, 6, 0, 1) : ""}
                                    </td>
                                </React.Fragment>
                            ))}


                            {/* Concavity */}
                            {recommenders.map(recommender => (
                                <React.Fragment key={recommender}>
                                    <td className="p-1 text-center w-5"
                                        style={{ backgroundColor: getNormalizedColor(values[`${recommender}_conc`] || 0, minConc, maxConc, "conc") }}>
                                        {values[`${recommender}_conc`] ? values[`${recommender}_conc`].toFixed(2) : ""}
                                    </td>
                                </React.Fragment>
                            ))}


                            {/* Difference */}
                            {recommenders.map(recommender => (
                                <React.Fragment key={recommender}>
                                    <td className="p-1 text-center w-5"
                                        style={{ backgroundColor: getNormalizedColor(values[`${recommender}_diff`] || 0, minDiff, maxDiff, "diff") }}>
                                        {values[`${recommender}_diff`] ? shortenNumber(values[`${recommender}_diff`] || 0, 3, 6, 0, 1) : ""}
                                    </td>
                                </React.Fragment>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const getNormalizedColor = (value: number, min: number, max: number, type: string) => {

    const normalizedToColor = (value: number) => {

        const deepGreen = [0, 80, 24];
        const deepRed = [199, 19, 7];

        if (value < 0) {
            const r = Math.round(deepRed[0] * (Math.abs(value)) + 255 * (1 - Math.abs(value)));
            const g = Math.round(deepRed[1] * (Math.abs(value)) + 255 * (1 - Math.abs(value)));
            const b = Math.round(deepRed[2] * (Math.abs(value)) + 255 * (1 - Math.abs(value)));

            return `rgb(${r}, ${g}, ${b})`;
        } else {
            const r = Math.round(deepGreen[0] * value + 255 * (1 - value));
            const g = Math.round(deepGreen[1] * value + 255 * (1 - value));
            const b = Math.round(deepGreen[2] * value + 255 * (1 - value));

            return `rgb(${r}, ${g}, ${b})`;
        }
    }

    if (type == "fdv") {
        const minVal = 0;
        const maxVal = 3;
        const norm = (value - minVal) / (maxVal - minVal);
        return normalizedToColor(norm);
    }

    else if (type == "ldt") {
        const minVal = 0;
        const maxVal = max;
        const norm = (value - minVal) / (maxVal - minVal);
        return normalizedToColor(norm);
    }

    else if (type == "conc") {
        if (value < 0) {
            const minVal = 0;
            const maxVal = -3;
            const norm = (value - minVal) / (maxVal - minVal);
            return normalizedToColor(-norm);

        }
        const minVal = 0;
        const maxVal = 3;
        const norm = (value - minVal) / (maxVal - minVal);
        return normalizedToColor(norm);
    }

    else if (type == "diff") {
        if (value < 0) {
            const minVal = 0;
            const maxVal = min;
            const norm = (value - minVal) / (maxVal - minVal);
            return normalizedToColor(-norm);
        }
        const minVal = 0;
        const maxVal = max;
        const norm = (value - minVal) / (maxVal - minVal);
        return normalizedToColor(norm);
    }

};

export default DisagreementMatrix;
