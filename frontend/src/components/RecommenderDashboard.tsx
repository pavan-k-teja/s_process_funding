import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AllocationSidebar from '@/components/AllocationSidebar';
import UtilityTable from '@/components/UtilityTable';
import NetworkGraph from '@/components/NetworkGraph';
import AllocationChart from '@/components/AllocationChart';
import { CurrentUser, UserRole } from '@/lib/types';

// use selector and dispatch
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setCurrentUser, setAllocations, setUtilities, setDynamicUtilities } from '@/store';

const RecommenderDashboard: React.FC = () => {

    const enableUtilityHighlight = true;
    const dispatch = useDispatch<AppDispatch>();
    const apiData = useSelector((state: RootState) => state.apiData);
    const [showSaveButton, setShowSaveButton] = useState(false);


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
    const allocations = useSelector((state: RootState) => state.allocations);

    const handleDragChange = () => {
        setShowSaveButton(true);
    };

    const handleReset = () => {
        setShowSaveButton(false);
    };

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Navbar at the top */}
            <Navbar profileName={profileName} />

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
                        <AllocationChart enableReadOnly={false} enableUtilityHighlight={enableUtilityHighlight} viewType={"recommender" as UserRole} />
                    </div>
                </div>

                {/* Utility Table on the right */}
                <div className=" h-full overflow-y-auto p-0 z-0 width-full">
                    <UtilityTable enableReadOnly={false} viewType={"recommender"} />
                </div>
            </div>

            {/* Save Changes Button */}
            {showSaveButton && (
                <div className="fixed bottom-4 right-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => alert('Changes saved!')}>
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    )
}

export default RecommenderDashboard;