import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuthStore } from '../../stores/authStore'

export const AppLayout: React.FC = () => {
  const { sidebarOpen } = useAuthStore()

  return (
    <div className="min-h-[100dvh] bg-background transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={`flex min-h-[100dvh] flex-col transition-[padding] duration-200 ${
          sidebarOpen ? 'lg:pl-64 pl-[4.5rem]' : 'pl-[4.5rem]'
        }`}
      >
        {/* Top Navbar */}
        <Header />

        {/* Page Outlet container */}
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
