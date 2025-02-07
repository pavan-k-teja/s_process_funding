import React from 'react';
import Navbar from './Navbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';

const Dashboard: React.FC = () => {
  return (
    <div className="w-full h-screen flex flex-col overflow-x-auto">
      <Navbar />
      <div className="flex flex-1 w-full">
        <LeftSidebar />
        <main className="flex-1 p-6 flex items-center justify-center bg-white">
          <p className="text-gray-500">Main Content Area</p>
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default Dashboard;