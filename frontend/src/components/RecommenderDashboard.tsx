import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AllocationSidebar from '@/components/AllocationSidebar';
import UtilityTable from '@/components/UtilityTable';
import NetworkGraph from '@/components/NetworkGraph';
import AllocationChart from '@/components/AllocationChart';

import { User, Colors, Profile, Utility, Allocation, ApiData } from '@/lib/types';

// use selector and dispatch
import { useSelector, useDispatch } from 'react-redux';

const RecommenderDashboard = () => {
    return (
        <div className="w-full h-screen flex flex-col">
            {/* Navbar at the top */}
            <Navbar profileName={user?.profile_name} onLogout={() => console.log('Logout Clicked')} />

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
    )
}

export default RecommenderDashboard;