import React, { useState, useEffect, useCallback } from 'react';
// import { debounce, throttle } from 'radash';
// import Navbar from '@/components/Navbar';
// import AllocationSidebar from '@/components/AllocationSidebar';
// import UtilityTable from '@/components/UtilityTable';
// import NetworkGraph from '@/components/NetworkGraph';
// import AllocationChart from '@/components/AllocationChart';

import { User, Colors, Profile, Utility, Allocation, ApiData } from '@/lib/types';
import { allocate_budget } from '@/helpers/helper';

const Dashboard: React.FC = () => {

    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [originalUtilities, setOriginalUtilities] = useState<Utility[]>([]);
    const [utilities, setUtilities] = useState<Utility[]>([]);
    const [user, setUser] = useState<User>();
    const [colors, setColors] = useState<Colors>({});
    const [activeUtility, setActiveUtility] = useState<string>("");
    const [currBudget, setCurrBudget] = useState<number>(user?.budget ?? 0);

    const setCurrBudgetStable = useCallback((budget: number) => setCurrBudget(budget), []);

    useEffect(() => {
        setCurrBudget(user?.budget ?? 0);
    }, [user]);


    useEffect(() => {
        console.log("onAction Budget Changed", utilities, currBudget);
        const newAllocations = allocate_budget(utilities, currBudget);
        console.log("Allocations after budget change", allocations);
        
        if (JSON.stringify(newAllocations) !== JSON.stringify(allocations)) {
            setAllocations(newAllocations);
        }
    }, [currBudget, utilities]);


    const handleAllocationChartActive = (utility_name: string) => {
        setActiveUtility(utility_name);
    }

    // const handleUtilityChange = (utilities: Utility[]) => {
    // // console.log("onAction Budget Changed", utilities, budget);
    // const allocations = allocate_budget(utilities, budget);
    // // console.log("Allocations after budget change", allocations);
    // setAllocations(allocations);
    // }

    useEffect(() => {

        const getRecommenderData = async () => {
            try {
                const token = localStorage.getItem("jwt")
                if (!token) throw new Error("No token found")

                const response = await fetch("/api/recommender_data", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Access-Control-Allow-Origin": "*",
                    },
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch protected data")
                }

                const recommenderData: ApiData = await response.json()
                console.log(recommenderData)

                setAllProfiles(recommenderData.all_profiles)
                setAllocations(recommenderData.allocations)
                setOriginalUtilities(recommenderData.utilities)
                setUtilities(recommenderData.utilities)
                setUser(recommenderData.current_user)
                setColors(recommenderData.colors)
                console.log("Colors", recommenderData.colors)

            } catch (err) {
                console.log(err)
            } finally {
                console.log("fetch recommender data")
            }
        }

        // getRecommenderData();

    }, []);

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Navbar at the top */}
            {/* <Navbar profileName={user?.profile_name} onLogout={() => console.log('Logout Clicked')} /> */}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar on the left */}
                <div className="w-max h-full pt-0 pb-0 mb-0 overflow-y-visible overflow-x-scroll">
                    {/* <AllocationSidebar profileName={user?.profile_name} organizations={allocations} colors={colors} activeUtility={activeUtility} /> */}
                </div>

                {/* Middle Section with Network Graph and D3 Curve */}
                <div className="flex-1 flex flex-col items-center justify-start p-3 pt-12 space-y-4">
                    <div className="w-full flex justify-center m-0 p-0">
                        {/* <NetworkGraph profiles={allProfiles} user={user?.profile_name ?? ""} /> */}
                    </div>
                    <div className="w-max flex justify-center m-0 p-0 border-r-0">
                        {/* <AllocationChart utilities={utilities} setUtilities={setUtilities} colors={colors} onActive={handleAllocationChartActive} /> */}
                    </div>
                </div>

                {/* Utility Table on the right */}
                <div className=" h-full overflow-y-auto p-0 z-0 width-full">
                    {/* <UtilityTable maxBudget={user?.max_budget ?? 0} utilities={utilities} currBudget={currBudget} setCurrBudget={setCurrBudgetStable} /> */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
