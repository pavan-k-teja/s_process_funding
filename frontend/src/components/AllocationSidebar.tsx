import React, { useEffect, useMemo, useRef } from 'react';

import { Allocation } from '@/lib/types';
import { shortenNumber } from '@/helpers/helper';

import { RootState, AppDispatch } from '@/store';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveUtility, setHoveredUtility } from '@/store';

interface AllocationSidebarProps {
  profileName?: string,
  recommenders?: Allocation[];
  organizations?: Allocation[];
  enableUtilityHighlight?: boolean;
}

const lightenColor = (color: string, percent: number) => {

  if (color.length === 4) {
    color = color.replace(/#(\w)(\w)(\w)/, '#$1$1$2$2$3$3');
  }

  const hexPercent = Math.floor(percent / 100 * 255).toString(16);

  const lighten = color + hexPercent;

  return lighten;
}

const AllocationSidebar: React.FC<AllocationSidebarProps> = ({ profileName, recommenders, organizations, enableUtilityHighlight }) => {

  const dispatch = useDispatch<AppDispatch>();
  const colors = useSelector((state: RootState) => state.colors);
  const focusUtility = useSelector((state: RootState) => state.focusUtility);
  
  const lastHoveredUtility = useRef<string | null>(null);

  // const focusedUtility = useMemo(() => (enableUtilityHighlight ? lastHoveredUtility.current || activeUtility : ""), [enableUtilityHighlight, lastHoveredUtility.current, activeUtility]);

  const focusedUtility = (enableUtilityHighlight ? focusUtility.hoveredUtility || focusUtility.activeUtility : "");

  const filteredRecommenders = useMemo(() => recommenders?.filter(r => r.allocation > 0).sort((a, b) => b.allocation - a.allocation), [recommenders]);
  const filteredOrganizations = useMemo(() => organizations?.filter(o => o.allocation > 0).sort((a, b) => b.allocation - a.allocation), [organizations]);

  const totalOrganizationAllocation = useMemo(() => filteredOrganizations?.reduce((sum, o) => sum + o.allocation, 0) || 1, [filteredOrganizations]);
  const totalRecommenderAllocation = useMemo(() => filteredRecommenders?.reduce((sum, r) => sum + r.allocation, 0) || 1, [filteredRecommenders]);

  useEffect(() => {
    if (focusedUtility=="" && enableUtilityHighlight && filteredOrganizations && filteredOrganizations.length > 0) {
      dispatch(setActiveUtility(filteredOrganizations[0].to_name));
    }
  }, [enableUtilityHighlight, filteredOrganizations, dispatch]);


  const handleMouseEnter = (utilityName: string) => {
    if (lastHoveredUtility.current !== utilityName) {
      lastHoveredUtility.current = utilityName;
      dispatch(setHoveredUtility(utilityName));
    }
  };

  const handleMouseLeave = () => {
    if (lastHoveredUtility.current !== "") {
      lastHoveredUtility.current = "";
      dispatch(setHoveredUtility(""));
    }
  };



  return (
    <div className="w-72 h-full bg-gray-100 flex pt-1 flex-col overflow-x-hidden">
      <h4 className='font-semibold p-1'>{profileName}'s UNILATERAL ALLOCATION</h4>
      {/* Recommenders Section */}
      {filteredRecommenders && filteredRecommenders.length > 0 && (
        <div className="flex flex-col space-y-0.5 mb-1" style={{ flex: '0 0 20%' }}>
          {filteredRecommenders?.map((recommender) => {
            const heightPercentage = (recommender.allocation / (totalRecommenderAllocation ?? 1)) * 100;
            const fontSize = heightPercentage < 10 ? 'text-xs' : 'text-sm';
            return (
              <div
                key={recommender.to_name}
                className={`flex items-center justify-between px-2 text-white text-sm font-medium rounded ${fontSize}`}
                style={{ backgroundColor: colors ? colors[recommender.to_name] : "#ffffff", height: `${heightPercentage}%` }}
              >
                <span>{recommender.to_name}</span>
                <span>${shortenNumber(recommender.allocation, 3, 10)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Organizations Section */}
      {filteredOrganizations && filteredOrganizations.length > 0 && (
        <div className="flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200  space-y-0.5">
          {filteredOrganizations?.map((organization) => {
            const heightPercentage = (organization.allocation / (totalOrganizationAllocation ?? 1)) * 100;
            const orgColor = colors ? colors[organization.to_name] : '#000000';
            const fontSize = heightPercentage < 10 ? 'text-xs' : 'text-sm';
            return (
              <div
                key={organization.to_name}
                className={`flex items-center px-0 py-0 text-sm font-semibold ${fontSize}`} /* round */
                style={{
                  backgroundColor: `${(focusedUtility === organization.to_name) ? orgColor : lightenColor(orgColor, 10)}`,
                  height: `${heightPercentage}%`,
                }}
                onMouseEnter={() => handleMouseEnter(organization.to_name)}
                onMouseLeave={handleMouseLeave}
                onClick={() => dispatch(setActiveUtility(organization.to_name))}
              >
                <div
                  className="w-3 h-full mr-2 ml-0 pl-0 " /* round */
                  style={{ backgroundColor: orgColor }}
                ></div>
                <span>{organization.to_name}</span>
                <span className="ml-auto mr-1">${shortenNumber(organization.allocation, 3, 10, 0)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllocationSidebar;
