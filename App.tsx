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
        {activeTab === TabType.GROUP && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Trophy className="text-amber-500" /> 戒菸英雄榜
            </h3>
            <div className="space-y-3">
              {groupRanking.map((member, index) => (
                <div 
                  key={member.id} 
                  className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                    member.id === activeMemberId 
                      ? 'bg-indigo-900/20 border-indigo-500/50 ring-1 ring-indigo-500/30' 
                      : 'bg-zinc-900/40 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-inner ${
                      index === 0 ? 'bg-amber-500 text-amber-950' : 
                      index === 1 ? 'bg-zinc-400 text-zinc-900' : 
                      index === 2 ? 'bg-orange-600 text-orange-950' : 
                      'bg-zinc-800 text-zinc-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-black text-white">{member.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${
                        member.todayCount <= 5 ? 'text-emerald-500' : 'text-zinc-600'
                      }`}>
                        {member.todayCount === 0 ? '王者姿態' : member.todayCount <= 5 ? '表現卓越' : '繼續努力'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${
                      member.todayCount === 0 ? 'text-emerald-400' : 
                      member.todayCount > 10 ? 'text-rose-500' : 'text-zinc-100'
                    }`}>
                      {member.todayCount}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">根</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === TabType.STATS && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                <TrendingUp className="text-indigo-500" /> 近七日趨勢
              </h3>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-[2rem] h-72 border border-zinc-800 shadow-2xl">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#4b5563', fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#4b5563', fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: '#111827'}}
                    contentStyle={{backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'}}
                    itemStyle={{color: '#fff', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.count > 10 ? '#ef4444' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-500/5 p-6 rounded-[2rem] border border-emerald-500/20 text-center">
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">本週最低</p>
                <p className="text-3xl font-black text-emerald-400">
                  {Math.min(...chartData.map(d => d.count))}
                </p>
              </div>
              <div className="bg-indigo-500/5 p-6 rounded-[2rem] border border-indigo-500/20 text-center">
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-1">本週平均</p>
                <p className="text-3xl font-black text-indigo-400">
                  {(chartData.reduce((acc, curr) => acc + curr.count, 0) / 7).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;