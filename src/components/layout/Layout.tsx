import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topnav } from './Topnav';

export const Layout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-50 font-sans">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col h-full bg-gradient-to-br from-slate-900 via-[#0b0f19] to-slate-950 relative">
                {/* Glow ambient background effects */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

                <Topnav />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
