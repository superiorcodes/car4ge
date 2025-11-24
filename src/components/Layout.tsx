import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Car, 
  Wrench, 
  Building2, 
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

export function Layout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Vehicles', href: '/vehicles', icon: Car },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Garages', href: '/garages', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-200 ease-in-out
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 animate-pulse"></div>
            <Sparkles className="h-6 w-6 text-yellow-300 mr-2 animate-bounce" />
            <h1 className="text-xl font-bold text-white relative z-10">Garage Manager</h1>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 transform hover:scale-105 hover:shadow-md
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm border-l-4 border-indigo-500' 
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-transform duration-200 ${isActive ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={signOut}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-all duration-200 transform hover:scale-105"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}