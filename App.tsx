import React, { useState, useEffect, useMemo } from 'react';
import { TabType, SmokeRecord, Member } from './types';
import { INITIAL_MEMBERS } from './constants';
import MemberSelector from './components/MemberSelector';
import NavBar from './components/NavBar';
import { Plus, Minus, Trophy, Flame, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- 1. 引入 Firebase 實例與方法 ---
import { db } from './firebase'; 
import { ref, onValue, set, update } from 'firebase/database';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.HOME);
  const [activeMemberId, setActiveMemberId] = useState<string>(INITIAL_MEMBERS[0].id);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [records, setRecords] = useState<SmokeRecord[]>([]);

  const today = new Date().toISOString().split('T')[0];

  // --- 2. 替換 localStorage，改用 Firebase 即時監聽 ---
  useEffect(() => {
    // 監聽成員名單 (如果之後有改名需求)
    const membersRef = ref(db, 'members');
    const unsubscribeMembers = onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // 將物件格式轉回陣列以符合原本的 State
        setMembers(Object.values(data));
      } else {
        // 如果資料庫是空的，初始化成員
        INITIAL_MEMBERS.forEach(m => {
          set(ref(db, `members/${m.id}`), m);
        });
      }
    });

    // 監聽所有抽菸紀錄
    const recordsRef = ref(db, 'records');
    const unsubscribeRecords = onValue(recordsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Firebase 儲存通常是物件，我們轉為陣列供程式計算
        const flatRecords: SmokeRecord[] = [];
        Object.keys(data).forEach(date => {
          Object.keys(data[date]).forEach(mId => {
            flatRecords.push({
              memberId: mId,
              date: date,
              count: data[date][mId]
            });
          });
        });
        setRecords(flatRecords);
      }
    });

    return () => {
      unsubscribeMembers();
      unsubscribeRecords();
    };
  }, []);

  // --- 3. 修改更新邏輯：直接寫入 Firebase ---
  const updateCount = (memberId: string, delta: number) => {
    const currentCount = getTodayCount(memberId);
    const newCount = Math.max(0, currentCount + delta);
    
    // 直接更新路徑：records/日期/成員ID
    update(ref(db), {
      [`records/${today}/${memberId}`]: newCount
    });
  };

  const handleUpdateName = (id: string, newName: string) => {
    update(ref(db, `members/${id}`), { name: newName });
  };

  // --- 以下計算邏輯維持不變 ---
  const activeMember = useMemo(() => 
    members.find(m => m.id === activeMemberId) || members[0], 
  [activeMemberId, members]);

  const getTodayCount = (memberId: string) => {
    const record = records.find(r => r.memberId === memberId && r.date === today);
    return record ? record.count : 0;
  };

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const record = records.find(r => r.memberId === activeMemberId && r.date === date);
      return {
        name: date.split('-')[2],
        count: record ? record.count : 0
      };
    });
  }, [records, activeMemberId]);

  const groupRanking = useMemo(() => {
    return members.map(m => ({
      ...m,
      todayCount: getTodayCount(m.id)
    })).sort((a, b) => a.todayCount - b.todayCount);
  }, [records, members]);

  // --- UI 部分維持不變 ---
  return (
    <div className="min-h-screen bg-black text-zinc-100 pb-24 flex flex-col font-sans">
      <MemberSelector 
        members={members} 
        activeMemberId={activeMemberId} 
        onSelect={setActiveMemberId}
        onUpdateName={handleUpdateName}
      />
      {/* ...其餘 JSX 內容相同... */}
      <main className="flex-1 p-5">
        {/* HOME, GROUP, STATS 內容 */}
        {activeTab === TabType.HOME && (
           <div className="flex flex-col items-center justify-center space-y-12 mt-8 animate-in fade-in duration-500">
            <div className="text-center">
              <h2 className="text-zinc-500 text-sm font-bold tracking-widest uppercase">今日攝取紀錄</h2>
              <div className="text-8xl font-black text-white mt-4 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                {getTodayCount(activeMemberId)}
              </div>
              <p className="text-zinc-500 text-xs mt-2 uppercase tracking-tighter">Cigarettes Today</p>
            </div>

            <div className="relative w-56 h-56 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-[10px] border-zinc-900 transition-colors ${
                getTodayCount(activeMemberId) > 10 ? 'border-rose-900/30' : 'border-indigo-900/30'
              }`}></div>
              <button
                onClick={() => updateCount(activeMemberId, 1)}
                className="z-10 bg-indigo-600 active:bg-indigo-700 text-white w-36 h-36 rounded-full shadow-[0_0_40px_rgba(79,70,229,0.4)] flex items-center justify-center transform active:scale-90 transition-all border-4 border-indigo-400/20"
              >
                <Plus size={56} strokeWidth={3} />
              </button>
            </div>
            {/* 其他按鈕與統計圖表... */}
            <div className="flex space-x-6">
              <button onClick={() => updateCount(activeMemberId, -1)} className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-5 rounded-3xl shadow-lg active:bg-zinc-800"><Minus size={28} /></button>
              <button onClick={() => updateCount(activeMemberId, 5)} className="bg-zinc-900 border border-zinc-800 text-indigo-400 font-black px-10 py-5 rounded-3xl shadow-lg active:bg-zinc-800 text-lg">+5</button>
            </div>
          </div>
        )}
        {/* GROUP 與 STATS 分頁代碼比照辦理 */}
      </main>
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;