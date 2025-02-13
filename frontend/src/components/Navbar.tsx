import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';


import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';
import { logout } from '@/store';


const Navbar: React.FC<{ profileName: string }> = ({ profileName }) => {
    const dispatch = useDispatch<AppDispatch>();

    const onLogout = () => {
        localStorage.removeItem("jwt");
        dispatch(logout());
        window.location.reload();
    };


    return (
        <nav className="flex items-center justify-end px-4 py-1 bg-white text-black shadow-md w-full z-40">
            <div className="flex items-center space-x-4">
                {/* Profile Icon */}
                <Avatar className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white" style={{ borderRadius: '15px' }}>
                    <span className="text-sm font-medium">{profileName}</span>
                </Avatar>

                {/* Logout Button */}
                <Button onClick={onLogout} className="bg-transparent border-gray-100 text-black hover:bg-transparent hover:text-black border  hover:border-gray-700 transition duration-300 ease-in-out">
                    Logout
                </Button>
            </div>
        </nav>
    );
};

export default Navbar;