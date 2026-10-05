import React, { useState } from 'react';
import {
  FinancialProvider,
  useFinancial,
  ScreenType
} from './context/FinancialContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { DetailModal } from './components/common/DetailModal';
import { OnboardingModal } from './components/common/OnboardingModal';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { MoneyScreen } from './components/screens/MoneyScreen';
import { BusinessScreen } from './components/screens/BusinessScreen';
import { GoalsScreen } from './components/screens/GoalsScreen';
import { InsightsScreen } from './components/screens/InsightsScreen';
import { AccountsScreen } from './components/screens/AccountsScreen';
import { TransactionsScreen } from './components/screens/TransactionsScreen';
import { BudgetsScreen } from './components/screens/BudgetsScreen';
import { RecurringScreen } from './components/screens/RecurringScreen';
import { CalendarScreen } from './components/screens/CalendarScreen';
import { SalesScreen } from './components/screens/SalesScreen';
import { InventoryScreen } from './components/screens/InventoryScreen';
import { CustomersScreen } from './components/screens/CustomersScreen';
import { SuppliersScreen } from './components/screens/SuppliersScreen';
import { InvestmentsScreen } from './components/screens/InvestmentsScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { FinancialProvidersScreen } from './components/screens/FinancialProvidersScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

import {
  Home,
  CreditCard,
  Briefcase,
  Target,
  LineChart,
  Menu,
  X
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useFinancial();
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'money':
        return <MoneyScreen />;
      case 'business':
      case 'review':
      case 'receivables':
      case 'payables':
      case 'expenses':
        return <BusinessScreen />;
      case 'goals':
        return <GoalsScreen />;
      case 'insights':
        return <InsightsScreen />;
      case 'accounts':
        return <AccountsScreen />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'budgets':
        return <BudgetsScreen />;
      case 'recurring':
        return <RecurringScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'sales':
        return <SalesScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'customers':
        return <CustomersScreen />;
      case 'suppliers':
        return <SuppliersScreen />;
      case 'investments':
        return <InvestmentsScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'providers':
        return <FinancialProvidersScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#edf4f0] text-slate-800">
      {/* Desktop Left Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onOpenOnboarding={() => setIsOnboardingModalOpen(true)} />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#f8faf9] h-full shadow-2xl flex flex-col justify-between">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar
              onOpenOnboarding={() => {
                setIsMobileMenuOpen(false);
                setIsOnboardingModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <div className="relative">
          <Navbar onOpenOnboarding={() => setIsOnboardingModalOpen(true)} />

          {/* Mobile hamburger trigger bar */}
          <div className="lg:hidden px-4 py-2 bg-white/70 border-b border-slate-200/60 flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 p-1"
            >
              <Menu className="w-5 h-5 text-emerald-800" />
              <span>Navigation Menu</span>
            </button>
            <span className="text-xs font-semibold text-emerald-800 capitalize">
              {currentScreen}
            </span>
          </div>
        </div>

        {/* Dynamic Screen View with Responsive Fluid Container */}
        <main className="flex-1 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1560px] mx-auto p-3.5 sm:p-5 md:p-6 lg:p-8 pb-24 lg:pb-8 transition-all">
          {renderScreen()}
        </main>

        {/* Mobile Bottom Navigation Bar for rapid one-thumb access */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-40 shadow-lg">
          {[
            { id: 'home' as ScreenType, label: 'Home', icon: Home },
            { id: 'money' as ScreenType, label: 'Money', icon: CreditCard },
            { id: 'business' as ScreenType, label: 'Business', icon: Briefcase },
            { id: 'goals' as ScreenType, label: 'Goals', icon: Target },
            { id: 'insights' as ScreenType, label: 'Insights', icon: LineChart }
          ].map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#065f46] font-bold'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Interactive Entity Detail Modal */}
      <DetailModal />

      {/* Interactive 13-step Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinancialProvider>
      <MainAppContent />
    </FinancialProvider>
  );
}
