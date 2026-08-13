import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuthStore } from '../../stores/authStore'

export const AppLayout: React.FC = () => {
  const { sidebarOpen } = useAuthStore()

  return (
    <div className="min-h-screen bg-surface dark:bg-[#1A1A24] transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-64 pl-20' : 'pl-20'
        }`}
      >
        {/* Top Navbar */}
        <Header />

        {/* Page Outlet container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
