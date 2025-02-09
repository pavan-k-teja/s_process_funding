import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

import { User } from '@/lib/types';

interface NavbarProps {
    profileName?: User["profile_name"]; // Profile name to display inside the avatar
    onLogout: () => void; // Function to handle logout
}

const Navbar: React.FC<NavbarProps> = ({ profileName, onLogout }) => {
    return (
        <nav className="flex items-center justify-end px-4 py-1 bg-white text-black shadow-md w-full z-40">
            <div className="flex items-center space-x-4">
                {/* Profile Icon */}
                <Avatar className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white" style={{ borderRadius: '15px' }}>
                    <span className="text-sm font-medium">{profileName}</span>
                </Avatar>

                {/* Logout Button */}
                {/* <Button onClick={onLogout} className="bg-transparent text-black hover:bg-gray-100 hover:border-black border-white">
                    Logout
                </Button> */}
                <Button onClick={onLogout} className="bg-transparent border-gray-100 text-black hover:bg-transparent hover:text-black border  hover:border-gray-700 transition duration-300 ease-in-out">
                    Logout
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;