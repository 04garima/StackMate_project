import React from 'react';
import Sidebar from './Sidebar';

import DashboardHeader from './DashboardHeader';

function DashboardLayout({ children }) {
  return (
    <div className="d-flex vh-100 text-white overflow-hidden position-relative" style={{background: '#111111'}}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column w-100 h-100 position-relative" style={{zIndex: 10}}>
        <DashboardHeader />
        
        <main className="flex-grow-1 overflow-auto w-100 p-4 pb-5">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
