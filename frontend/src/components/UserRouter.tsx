import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { setApiData, setUsers, setColors, setDisagreements } from '@/store';
import { ApiData } from '@/lib/types';
import RecommenderDashboard from '@/components/RecommenderDashboard'
import FunderDashboard from '@/components/FunderDashboard'
import SigmaDashboard from '@/components/SigmaDashboard'


const UserRouter: React.FC = () => {

    const [currentRole, setCurrentRole] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();

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
                dispatch(setApiData(apiData));

                const users = apiData.users;
                dispatch(setUsers(users));

                const colors = apiData.colors;
                dispatch(setColors(colors));

                const disagreements = apiData.disagreements;
                dispatch(setDisagreements(disagreements));

                setCurrentRole(apiData.current_user.role);

            } catch (err) {
                console.error(err)
            } finally {
                console.log("User data fetched")
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
                        {currentRole === "recommender" ? <RecommenderDashboard /> : currentRole === "funder" ? <FunderDashboard /> : currentRole === "sigma" ? <SigmaDashboard /> : <div>Role not found</div>}
                    </>
                )}
            </div>


        </>


    );
};

export default UserRouter;