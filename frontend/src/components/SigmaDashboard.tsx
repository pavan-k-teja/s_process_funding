import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import NetworkGraph from '@/components/NetworkGraph';
import AllocationSidebar from '@/components/AllocationSidebar';
import AllocationChart from './AllocationChart';
import UtilityTable from './UtilityTable';
import SankeyAllocation from './SankeyAllocation';
import DisagreementsSidebar from './DisagreementsSidebar';
import DisagreementMatrix from './DisagreementMatrix';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setCurrentUser, setAllocations, setUtilities, setDynamicUtilities } from '@/store';

import { isEmpty } from "lodash";
import { CurrentUser, UserRole } from '@/lib/types';


const SigmaDashboard: React.FC = () => {


    const dispatch = useDispatch<AppDispatch>();
    const apiData = useSelector((state: RootState) => state.apiData);
    const currentUser = useSelector((state: RootState) => state.currentUser);

    const profileName = currentUser?.user?.profile_name ?? "";
    const viewUserRole = currentUser?.viewUser?.role ?? "";
    const viewUserName = currentUser?.viewUser?.profile_name ?? ""

    useEffect(() => {

        if (apiData && isEmpty(currentUser)) {

            const currentUser: CurrentUser = {
                user: apiData.current_user,
                viewUser: apiData.current_user
            }
            dispatch(setCurrentUser(currentUser));

            dispatch(setAllocations(apiData.allocations));

            const recommenderNames = apiData.users.filter(user => user.role === "recommender").map(user => user.username)

            const allRecommenderUtilities = apiData.utilities.filter(utility => recommenderNames.includes(utility.username))

            dispatch(setUtilities(allRecommenderUtilities));

            dispatch(setDynamicUtilities(allRecommenderUtilities));

        }

        else if (apiData && viewUserRole && viewUserRole == "recommender") {

            const filteredAllocations = apiData.allocations.filter((allocation) =>
                allocation.from_name == currentUser?.viewUser?.username && allocation.allocation_type == "budget");
            dispatch(setAllocations(filteredAllocations))

            const recommenderUtilities = apiData.utilities.filter(utility => utility.username === currentUser?.viewUser?.username);

            dispatch(setUtilities(recommenderUtilities));
            dispatch(setDynamicUtilities(recommenderUtilities));

        }

        else if (apiData && viewUserRole && viewUserRole == "funder") {

            const filteredAllocations = apiData.allocations.filter((allocation) =>
                allocation.from_name == currentUser?.viewUser?.username && allocation.allocation_type == "budget"
            )
            dispatch(setAllocations(filteredAllocations));

            const funderToRecommenderUtilities = apiData.utilities.filter(utility => utility.username === currentUser?.viewUser?.username);
            dispatch(setUtilities(funderToRecommenderUtilities));

            dispatch(setDynamicUtilities(funderToRecommenderUtilities));
        }

        else if (apiData && viewUserRole && viewUserRole == "sigma") {
            dispatch(setAllocations(apiData.allocations));

            const recommenderNames = apiData.users.filter(user => user.role === "recommender").map(user => user.username)

            const allRecommenderUtilities = apiData.utilities.filter(utility => recommenderNames.includes(utility.username))

            dispatch(setUtilities(allRecommenderUtilities));

            dispatch(setDynamicUtilities(allRecommenderUtilities));
        }


    }, [apiData, currentUser]);


    const allocations = useSelector((state: RootState) => state.allocations);

    const recommenderNames = useSelector((state: RootState) => state.users.filter(user => user.role === "recommender")).map(recommender => recommender.username);

    const recommenderAllocations = allocations.filter(allocation => (recommenderNames.includes(allocation.to_name) && allocation.from_name === (currentUser?.user?.username ?? "") && allocation.allocation_type === "budget"));
    const organizationAllocations = allocations.filter(allocation => (allocation.from_name === viewUserName && allocation.allocation_type === "budget"));

    const recommenderToOrganizationAllocations = allocations.filter(allocation => (allocation.from_name === viewUserName && allocation.allocation_type === "budget"));

    const sigmaToOrganizationAllocations = allocations.filter(allocation => (allocation.from_name === "sigma" && !recommenderNames.includes(allocation.to_name)));

    return (
        <>
            <div className="w-full h-screen flex flex-col overflow-y-auto">
                {/* Navbar at the top */}
                <Navbar profileName={profileName} />

                <div className="flex-1 flex flex-col overflow-y-auto">

                    <div className="flex">
                        {/* Sidebar on the left */}
                        <div className="w-max h-full pt-0 pb-0 mb-0 ">
                            {
                                (viewUserRole == "recommender") ? (
                                    <AllocationSidebar profileName={viewUserName} organizations={recommenderToOrganizationAllocations} enableUtilityHighlight={false} />
                                ) : (viewUserRole == "funder") ? (
                                    <AllocationSidebar profileName={viewUserName} recommenders={recommenderAllocations} organizations={organizationAllocations} enableUtilityHighlight={false} />
                                ) : (viewUserRole == "sigma") ? (
                                    <AllocationSidebar profileName={viewUserName} organizations={sigmaToOrganizationAllocations} enableUtilityHighlight={false} />
                                ) : null
                            }
                        </div>


                        {/* Middle Section with Network Graph and D3 Curve */}
                        <div className="flex-1 flex flex-col items-center justify-start p-3 pt-12 space-y-4 overflow-y-auto">
                            <div className="w-full flex justify-center m-0 p-0">
                                <NetworkGraph />
                            </div>
                            <div className="w-max flex justify-center align-items m-0 p-0 border-r-0">
                                {/* allocation chart or sankey */}
                                {
                                    (viewUserRole != "sigma") ? (
                                        <AllocationChart enableReadOnly={true} enableUtilityHighlight={false} viewType={viewUserRole as UserRole} />
                                    ) : (
                                        <>
                                            <SankeyAllocation />
                                        </>
                                    )
                                }
                            </div>
                        </div>

                        {/* Utility Table on the right */}
                        <div className=" h-max overflow-y-auto p-0 z-0 width-max">
                            {
                                (viewUserRole != "sigma") ? (
                                    <UtilityTable enableReadOnly={true} viewType={viewUserRole as UserRole} />
                                ) : (
                                    <DisagreementsSidebar />
                                )
                            }
                        </div>

                    </div>
                    <>
                        {
                            (viewUserRole != "sigma") ? null : (
                                <div className=" w-full min-h-fit mt-4 p-4 flex justify-center ">
                                    <DisagreementMatrix />
                                </div>
                            )
                        }
                    </>
                </div>
            </div>
        </>
    )
}
export default SigmaDashboard