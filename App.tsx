
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { INITIAL_USERS, STORAGE_KEY, PROFILES_KEY } from './constants';
import { SmokeHistory, AIInsight, User, AppView } from './types';
import UserCard from './components/UserCard';
import StatsDashboard from './components/StatsDashboard';
import AIPanel from './components/AIPanel';
import ProfilePage from './components/ProfilePage';
import { getAIHealthInsights } from './services/geminiService';

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<AppView>({ type: 'home' });

  // History State
  const [history, setHistory] = useState<SmokeHistory>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Users State (mutable profiles)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(PROFILES_KEY);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Auto-initialize today's record if empty
  useEffect(() => {
    if (!history[today]) {
      setHistory(prev => ({
        ...prev,
        [today]: users.reduce((acc, user) => ({ ...acc, [user.id]: 0 }), {})
      }));
    }
  }, [today, history, users]);

  // Persist history to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // Persist profiles to local storage
  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(users));
  }, [users]);

  const handleIncrement = useCallback((userId: string) => {
    setHistory(prev => {
      const currentDayRecords = prev[today] || {};
      return {
        ...prev,
        [today]: {
          ...currentDayRecords,
          [userId]: (currentDayRecords[userId] || 0) + 1
        }
      };
    });
  }, [today]);

  const handleDecrement = useCallback((userId: string) => {
    setHistory(prev => {
      const currentDayRecords = prev[today] || {};
      const currentCount = currentDayRecords[userId] || 0;
      if (currentCount <= 0) return prev;
      return {
        ...prev,
        [today]: {
          ...currentDayRecords,
          [userId]: currentCount - 1
        }
      };
    });
  }, [today]);

  const handleUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const fetchInsights = async () => {
    setLoadingAI(true);
    const result = await getAIHealthInsights(history);
    setAiInsight(result);
    setLoadingAI(false);
  };

  const totalToday = Object.values(history[today] || {}).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);

  const renderHome = () => (
    <>
      {/* Main Recording Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {users.map(user => (
          <UserCard
            key={user.id}
            user={user}
            count={history[today]?.[user.id] || 0}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onViewProfile={(id) => setView({ type: 'profile', userId: id })}
          />
        ))}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StatsDashboard history={history} users={users} />
        </div>
        <div className="lg:col-span-1">
          <AIPanel insight={aiInsight} loading={loadingAI} onRefresh={fetchInsights} />
        </div>
      </div>
    </>
  );

  const renderProfile = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      setView({ type: 'home' });
      return null;
    }
    return (
      <ProfilePage 
        user={user} 
        history={history} 
        onBack={() => setView({ type: 'home' })} 
        onUpdateUser={handleUpdateUser}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div 
            className="cursor-pointer"
            onClick={() => setView({ type: 'home' })}
          >
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              QuitTogether
            </h1>
            <p className="text-slate-400 font-medium">
              五人小組每日抽菸紀錄 · 共同邁向健康
            </p>
          </div>
          {view.type === 'home' && (
            <div className="glass-card px-8 py-4 rounded-2xl text-center">
              <span className="block text-slate-500 text-xs uppercase tracking-widest mb-1">小組今日總計</span>
              <span className="text-3xl font-bold text-white">{totalToday} 支</span>
            </div>
          )}
        </header>

        {view.type === 'home' ? renderHome() : renderProfile(view.userId)}

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-600 text-sm pb-8">
          <p>© 2024 QuitTogether · 戒菸是為了更長久的相聚</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
