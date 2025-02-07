import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import UtilityTable from '@/components/UtilityTable';
import { NetworkGraph } from '@/components/NetworkGraph';
import AllocationChart from '@/components/AllocationChart';

const example_recommenders = [
  { name: 'Recommender 1', allocation: 10, color: '#ff0000' },
  { name: 'Recommender 2', allocation: 20, color: '#00ff00' },
  { name: 'Recommender 3', allocation: 30, color: '#0000ff' },
];

const example_organizations = [
  { name: 'Organization 1', allocation: 10, colorStrip: '#ff0000' },
  { name: 'Organization 2', allocation: 20, colorStrip: '#00ff00' },
  { name: 'Organization 3', allocation: 30, colorStrip: '#0000ff' },
];

const example_utility_table = [
  { name: 'Company 1', fdv: 100, ldt: '100k', conc: 10 },
  { name: 'Company 2', fdv: 200, ldt: '200k', conc: 20 },
  { name: 'Company 3', fdv: 300, ldt: '300k', conc: 30 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col">
      {/* Navbar at the top */}
      <Navbar profileName="JT" onLogout={() => console.log('Logout Clicked')} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar on the left */}
        <div className="w-max h-full overflow-y-visible overflow-x-scroll">
          <Sidebar recommenders={example_recommenders} organizations={example_organizations} />
        </div>

        {/* Middle Section with Network Graph and D3 Curve */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4 overflow-auto">
          <div className="w-full flex justify-center">
            <NetworkGraph />
          </div>
          <div className="w-full flex justify-center">
            <AllocationChart />
          </div>
        </div>

        {/* Utility Table on the right */}
        <div className="w-80 h-full overflow-y-auto p-4">
          <UtilityTable initialBudget={100} maxBudget={1000} companies={example_utility_table} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
