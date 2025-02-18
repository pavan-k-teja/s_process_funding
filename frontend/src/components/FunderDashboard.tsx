import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AllocationSidebar from '@/components/AllocationSidebar';
import UtilityTable from '@/components/UtilityTable';
import NetworkGraph from '@/components/NetworkGraph';
import AllocationChart from '@/components/AllocationChart';
import { isEmpty } from "lodash";

import { CurrentUser, UserRole } from '@/lib/types';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setCurrentUser, setAllocations, setUtilities, setDynamicUtilities, resetChangeDetection } from '@/store';

const API_URL = import.meta.env.VITE_API_URL;

const FunderDashboard: React.FC = () => {
    const enableUtilityHighlight = false;

    const dispatch = useDispatch<AppDispatch>();
    const apiData = useSelector((state: RootState) => state.apiData);
    const currentUser = useSelector((state: RootState) => state.currentUser);
    const viewUserRole = currentUser?.viewUser?.role ?? "";
    const viewUserName = currentUser?.viewUser?.profile_name ?? ""
    const [showSaveButton, setShowSaveButton] = useState(false);


    useEffect(() => {

        if (apiData && isEmpty(currentUser)) {
            const currentUser: CurrentUser = {
                user: apiData.current_user,
                viewUser: apiData.current_user
            }
            dispatch(setCurrentUser(currentUser));
            
            dispatch(setAllocations(apiData.allocations));
            
            const funderToRecommenderUtilities = apiData.utilities.filter(utility => utility.username === currentUser?.user?.username);
            dispatch(setUtilities(funderToRecommenderUtilities));
            
            dispatch(setDynamicUtilities(funderToRecommenderUtilities));

        }

        else if (apiData && viewUserRole && viewUserRole == "recommender") {

            // const allAllocations = apiData.allocations;
            const filteredAllocations = apiData.allocations.filter((allocation) => {
                return (
                    allocation.from_name == currentUser?.viewUser?.username && allocation.allocation_type == "budget"
                )

            })
            dispatch(setAllocations(filteredAllocations))

            const recommenderUtilities = apiData.utilities.filter(utility => utility.username === currentUser?.viewUser?.username);

            dispatch(setUtilities(recommenderUtilities));
            dispatch(setDynamicUtilities(recommenderUtilities));

        }
        else if (apiData && viewUserRole && viewUserRole == "funder") {
            dispatch(setAllocations(apiData.allocations));
            const funderToRecommenderUtilities = apiData.utilities.filter(utility => utility.username === currentUser?.user?.username);
            dispatch(setUtilities(funderToRecommenderUtilities));

            dispatch(setDynamicUtilities(funderToRecommenderUtilities));
        }

    }, [apiData, currentUser]);


    const profileName = currentUser?.user?.profile_name ?? "";

    const allocations = useSelector((state: RootState) => state.allocations);

    const recommenderNames = useSelector((state: RootState) => state.users.filter(user => user.role === "recommender")).map(recommender => recommender.username);

    const recommenderAllocations = allocations.filter(allocation => (recommenderNames.includes(allocation.to_name) && allocation.from_name === (currentUser?.user?.username ?? "") && allocation.allocation_type === "budget"));
    const organizationAllocations = allocations.filter(allocation => (recommenderNames.includes(allocation.to_name) === false && allocation.from_name === (currentUser?.user?.username ?? "") && allocation.allocation_type === "budget"));

    const recommenderToOrganizationAllocations = allocations.filter(allocation => (allocation.from_name === viewUserName && allocation.allocation_type === "budget"));

    const utilities = useSelector((state: RootState) => state.dynamicUtilities);

    const changeDetection = useSelector((state: RootState) => state.changeDetection);
    const currBudget = changeDetection?.isBudgetChanged;

    useEffect(() => {
        if (changeDetection.isUtilityChanged || changeDetection.isBudgetChanged >= 0) {
            setShowSaveButton(true);
        }
        else {
            setShowSaveButton(false);
        }

    }, [changeDetection]);


    const handleSaveChanges = async () => {

        const confirmed = window.confirm("Are you sure you want to save the changes?");
        if (!confirmed) {
            return;
        }

        try {
            await fetch(`${API_URL}/api/save_data`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
                    "Access-Control-Allow-Origin": "*",
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "utilities": utilities, "budget": currBudget < 0 ? null : currBudget })
            })
        }
        catch (error) {
            console.error(error);
        }

        dispatch(setUtilities(utilities));
        dispatch(setDynamicUtilities(utilities));

        dispatch(resetChangeDetection());
        setShowSaveButton(false);
    }

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Navbar at the top */}
            <Navbar profileName={profileName} />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar on the left */}
                <div className="w-max h-full pt-0 pb-0 mb-0 overflow-y-visible overflow-x-scroll">
                    {
                        viewUserRole == "recommender" ? (
                            <AllocationSidebar profileName={viewUserName} organizations={recommenderToOrganizationAllocations} enableUtilityHighlight={enableUtilityHighlight} />
                        ) : (
                            <AllocationSidebar profileName={viewUserName} recommenders={recommenderAllocations} organizations={organizationAllocations} enableUtilityHighlight={enableUtilityHighlight} />
                        )
                    }
                </div>

                {/* Middle Section with Network Graph and D3 Curve */}
                <div className="flex-1 flex flex-col items-center justify-start p-3 pt-12 space-y-4">
                    <div className="w-full flex justify-center m-0 p-0">
                        <NetworkGraph />
                    </div>
                    <div className="w-max flex justify-center m-0 p-0 border-r-0">
                        <AllocationChart enableReadOnly={profileName != viewUserName} enableUtilityHighlight={enableUtilityHighlight} viewType={viewUserRole as UserRole} />
                    </div>
                </div>

                {/* Utility Table on the right */}
                <div className=" h-full overflow-y-auto p-0 z-0 width-full">
                    <UtilityTable enableReadOnly={profileName != viewUserName} viewType={viewUserRole as UserRole} />
                </div>
            </div>

            {/* Save Changes Button */}
            {showSaveButton && (
                <div className="fixed bottom-4 right-4">
                    <button className="bg-[#005a16] text-white px-4 py-2 rounded transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none hover:border-transparent" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    )
}

export default FunderDashboard;