import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import UtilityTable from '@/components/UtilityTable';
import { NetworkGraph } from '@/components/NetworkGraph';
import AllocationChart from '@/components/AllocationChart';

import { User, Colors, Profile, Utility, Allocation, RecommenderData } from '@/lib/types';

// const example_recommenders = [
//     { name: 'Recommender 1', allocation: 10, color: '#ff0000' },
//     { name: 'Recommender 2', allocation: 20, color: '#00ff00' },
//     { name: 'Recommender 3', allocation: 30, color: '#0000ff' },
// ];

// const example_organizations = [
//     { name: 'Organization 1', allocation: 10, colorStrip: '#ff0000' },
//     { name: 'Organization 2', allocation: 20, colorStrip: '#00ff00' },
//     { name: 'Organization 3', allocation: 30, colorStrip: '#0000ff' },
// ];

const example_utility_table = [
    { name: 'Company 1', fdv: 100, ldt: '100k', conc: 10 },
    { name: 'Company 2', fdv: 200, ldt: '200k', conc: 20 },
    { name: 'Company 3', fdv: 300, ldt: '300k', conc: 30 },
];

const Dashboard: React.FC = () => {

    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [utilities, setUtilities] = useState<Utility[]>([]);
    const [user, setUser] = useState<User>();
    const [colors, setColors] = useState<Colors>({});

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

                const recommenderData: RecommenderData = await response.json()
                console.log(recommenderData)

                setAllProfiles(recommenderData.all_profiles)
                setAllocations(recommenderData.allocations)
                setUtilities(recommenderData.utilities)
                setUser(recommenderData.user)
                setColors(recommenderData.colors)
                console.log("Colors", recommenderData.colors)

            } catch (err) {
                console.log(err)
            } finally {
                console.log("fetch recommender data")
            }
        }

        getRecommenderData();

    }, []);

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Navbar at the top */}
            <Navbar profileName={user?.profile_name} onLogout={() => console.log('Logout Clicked')} />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar on the left */}
                <div className="w-max h-full pt-0 pb-0 mb-0 overflow-y-visible overflow-x-scroll">
                    <Sidebar profileName={user?.profile_name} organizations={allocations} colors={colors}/>
                </div>

                {/* Middle Section with Network Graph and D3 Curve */}
                <div className="flex-1 flex flex-col items-center justify-center p-3 space-y-4 overflow-auto">
                    <div className="w-full flex justify-center m-0 p-0">
                        <NetworkGraph profiles={allProfiles} userName={user?.profile_name} />
                    </div>
                    <div className="w-full flex justify-center m-0 p-0 border-r-0">
                        {/* <AllocationChart organizations={utilities} /> */}
                    </div>
                </div>

                {/* Utility Table on the right */}
                <div className="w-80 h-full overflow-y-auto p-4">
                    {/* <UtilityTable initialBudget={100} maxBudget={1000} companies={example_utility_table} /> */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
