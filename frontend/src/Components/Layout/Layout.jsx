

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

    return (
        <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-y-auto transition-colors duration-300">
            <Navbar onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
            <div className="flex pt-16 h-[calc(100vh-64px)]"> {/* Fill viewport height minus navbar */}
                {/* Sidebar - scrolls independently */}
                <Sidebar
                    className="h-full overflow-y-auto"
                    isOpen={isMobileSidebarOpen}
                    onClose={() => setIsMobileSidebarOpen(false)}
                />

                {/* Main content - NO scrolling here */}
                <main className="flex-1 overflow-y-auto bg-[var(--bg-secondary)] transition-colors duration-300">
                    {/* Outlet renders ChatRoom/Dashboard here - they handle their own scrolling */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;