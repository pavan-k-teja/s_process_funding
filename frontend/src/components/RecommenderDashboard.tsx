import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AllocationSidebar from '@/components/AllocationSidebar';
import UtilityTable from '@/components/UtilityTable';
import NetworkGraph from '@/components/NetworkGraph';
import AllocationChart from '@/components/AllocationChart';

import { CurrentUser } from '@/lib/types';

// use selector and dispatch
import { RootState, AppDispatch } from '@/store';
import { setCurrentUser, setAllocations, setUtilities, setDynamicUtilities } from '@/store';
import { useSelector, useDispatch } from 'react-redux';

const RecommenderDashboard: React.FC = () => {

    const enableUtilityHighlight = true;
    const fundViewCutoff = 3000000;

    const dispatch = useDispatch<AppDispatch>();

    const apiData = useSelector((state: RootState) => state.apiData);
    useEffect(() => {

        // Set the current user from apiData
        if (apiData) {
            // set current user
            const currentUser: CurrentUser = {
                user: apiData.current_user,
                viewUser: apiData.current_user
            }
            dispatch(setCurrentUser(currentUser));
            // set allocations
            dispatch(setAllocations(apiData.allocations));
            // set utilities
            dispatch(setUtilities(apiData.utilities));
            dispatch(setDynamicUtilities(apiData.utilities));
        }

    }, [apiData]);



    const currentUser = useSelector((state: RootState) => state.currentUser);
    const profileName = currentUser?.user?.profile_name ?? "";
    
    // const utilities = currentUser.utilities;
    const allocations = useSelector((state: RootState) => state.allocations);
    // console.log("ALLOCATIONS", allocations);

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Navbar at the top */}
            <Navbar profileName={profileName}/>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar on the left */}
                <div className="w-max h-full pt-0 pb-0 mb-0 overflow-y-visible overflow-x-scroll">
                    <AllocationSidebar profileName={profileName} organizations={allocations} enableUtilityHighlight={enableUtilityHighlight} />
                </div>

                {/* Middle Section with Network Graph and D3 Curve */}
                <div className="flex-1 flex flex-col items-center justify-start p-3 pt-12 space-y-4">
                    <div className="w-full flex justify-center m-0 p-0">
                        <NetworkGraph />
                    </div>
                    <div className="w-max flex justify-center m-0 p-0 border-r-0">
                        <AllocationChart enableUtilityHighlight={enableUtilityHighlight} fundViewCutoff={fundViewCutoff} />
                    </div>
                </div>

                {/* Utility Table on the right */}
                <div className=" h-full overflow-y-auto p-0 z-0 width-full">
                    <UtilityTable  />
                </div>
            </div>
        </div>
    )
}

export default RecommenderDashboard;