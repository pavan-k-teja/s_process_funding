import React from 'react';

import { Allocation } from '@/lib/types';


interface SidebarProps {
  profileName?: string,
  recommenders?: Allocation[];
  organizations?: Allocation[];
  colors?: { [key: string]: string };
}

const lightenColor = (color: string, percent: number) => {
  console.log('color', color);
  console.log('percent', percent);

  if (color.length === 4) {
    color = color.replace(/#(\w)(\w)(\w)/, '#$1$1$2$2$3$3');
  }

  const hexPercent = Math.floor(percent / 100 * 255).toString(16);

  const lighten = color + hexPercent;

  console.log('lighten', lighten);

  return lighten;
}

// const example_recommenders: Recommender[] = [
//   { name: 'Recommender 1', allocation: 10, color: '#ff0000' },
//   { name: 'Recommender 2', allocation: 20, color: '#00ff00' },
//   { name: 'Recommender 3', allocation: 30, color: '#0000ff' },
// ];

// const example_organizations: Organization[] = [
//   {
//     name: 'Organization 1',
//     allocation: 10,
//     colorStrip: '#ff0000',
//   },
//   {
//     name: 'Organization 2',
//     allocation: 20,
//     colorStrip: '#00ff00',
//   },
//   {
//     name: 'Organization 3',
//     allocation: 30,
//     colorStrip: '#0000ff',
//   },
// ];

const Sidebar: React.FC<SidebarProps> = ({ profileName, recommenders, organizations, colors }) => {

  console.log('sidebar colors', colors);
  // filter out recommenders and organizations with 0 allocation
  recommenders = recommenders?.filter((r) => r.allocation > 0);
  organizations = organizations?.filter((o) => o.allocation > 0);

  recommenders?.sort((a, b) => b.allocation - a.allocation);
  organizations?.sort((a, b) => b.allocation - a.allocation);

  const totalOrganizationAllocation = organizations?.reduce((sum, o) => sum + o.allocation, 0);
  const totalRecommenderAllocation = recommenders?.reduce((sum, r) => sum + r.allocation, 0);

  return (
    <div className="w-64 h-full bg-gray-100 flex pt-1 flex-col overflow-x-hidden">
      <h4 className='font-semibold p-1'>{profileName}'s UNILATERAL ALLOCATION</h4>
      {/* Recommenders Section */}
      {recommenders && recommenders.length > 0 && (
        <div className="flex flex-col space-y-0.5 mb-1" style={{ flex: '0 0 20%' }}>
          {recommenders?.map((recommender) => {
            const heightPercentage = (recommender.allocation / (totalRecommenderAllocation ?? 1)) * 100;
            return (
              <div
                key={recommender.name}
                className="flex items-center justify-between px-2 text-white text-sm font-medium rounded"
                style={{ backgroundColor: colors ? colors[recommender.name] : "#ffffff", height: `${heightPercentage}%` }}
              >
                <span>{recommender.name}</span>
                <span>${recommender.allocation}k</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Organizations Section */}
      <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200  space-y-0.5">
        {organizations?.map((organization) => {
          const heightPercentage = (organization.allocation / (totalOrganizationAllocation ?? 1)) * 100;
          const orgColor = colors ? colors[organization.name] : '#000000';
          return (
            <div
              key={organization.name}
              className="flex items-center px-0 py-0 text-sm font-medium rounded"
              style={{
                backgroundColor: `${lightenColor(orgColor, 10)}`,
                height: `${heightPercentage}%`,
              }}
            >
              <div
                className="w-3 h-full mr-2 ml-0 pl-0 rounded"
                style={{ backgroundColor: orgColor }}
              ></div>
              <span>{organization.name}</span>
              <span className="ml-auto mr-1">${organization.allocation}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
