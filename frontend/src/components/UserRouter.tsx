import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { setCurrentUser, setUsers, setColors, setUtilities, setAllocations, setDisagreements } from '@/store';
import { User, Colors, Profile, Utility, Allocation, ApiData } from '@/lib/types';
import RecommenderDashboard from '@/components/RecommenderDashboard'
import FunderDashboard from '@/components/FunderDashboard'
import SigmaDashboard from '@/components/SigmaDashboard'


const UserRouter: React.FC = () => {

    const [currentRole, setCurrentRole] = useState<string | null>(null);
    const dispatch = useDispatch();

    useEffect(() => {

        const getUserData = async () => {
            try {
                const token = localStorage.getItem("jwt")
                if (!token) throw new Error("No token found")

                const response = await fetch("/api/get_data", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Access-Control-Allow-Origin": "*",
                    },
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch protected data")
                }

                const apiData: ApiData = await response.json()
                console.log(apiData)

                dispatch(setCurrentUser(apiData.current_user));
                dispatch(setUsers(apiData.users));
                dispatch(setColors(apiData.colors));
                dispatch(setUtilities(apiData.utilities));
                dispatch(setAllocations(apiData.allocations));
                dispatch(setDisagreements(apiData.disagreements));
                console.log(apiData.current_user.role)
                setCurrentRole(apiData.current_user.role);

            } catch (err) {
                console.log(err)
            } finally {
                console.log("fetch recommender data")
            }
        }

        getUserData();

    }, []);

    return (
        <>
            <div className="flex items-center justify-center w-full">
                {currentRole === null ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-gray-500" size={48} />

                    </div>
                ) : (
                    <>
                        {currentRole === "recommender" && <RecommenderDashboard />}
                        {currentRole === "funder" && <FunderDashboard />}
                        {currentRole === "sigma" && <SigmaDashboard />}
                    </>
                )}
            </div>


        </>


    );
};

export default UserRouter;