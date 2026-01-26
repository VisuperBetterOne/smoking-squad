
import React from 'react';
import { TabType } from '../types';
import { Home, Users, BarChart2 } from 'lucide-react';

interface NavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const NavBar: React.FC<NavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: TabType.HOME, icon: Home, label: '紀錄' },
    { id: TabType.GROUP, icon: Users, label: '排行' },
    { id: TabType.STATS, icon: BarChart2, label: '趨勢' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-zinc-800 flex justify-around items-center py-2 pb-6 px-4 z-50 shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center space-y-1 w-full transition-all ${
              isActive ? 'text-indigo-400' : 'text-zinc-500'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default NavBar;
