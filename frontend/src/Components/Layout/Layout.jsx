import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
            <Navbar onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Sidebar */}
                <Sidebar
                    isOpen={isMobileSidebarOpen}
                    onClose={() => setIsMobileSidebarOpen(false)}
                />

                {/* Main content */}
                <main className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[var(--bg-primary)] transition-colors duration-300">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;