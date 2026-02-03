import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-6">
          <main className="flex-1 min-w-0">{children}</main>
          {showSidebar && <Sidebar />}
        </div>
      </div>
    </div>
  );
};

export default Layout;
