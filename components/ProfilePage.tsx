
import React, { useState } from 'react';
import { User, SmokeHistory } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfilePageProps {
  user: User;
  history: SmokeHistory;
  onBack: () => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, history, onBack, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar);

  // Prepare personal history data
  const personalHistory = Object.keys(history).sort().map(date => ({
    date: date.slice(5),
    count: history[date][user.id] || 0
  }));

  // Fix: Explicitly type acc as number to resolve arithmetic operation errors on line 25
  const totalSmokes = Object.values(history).reduce((acc: number, day) => acc + (day[user.id] || 0), 0);
  const avgSmokes = personalHistory.length > 0 ? (totalSmokes / personalHistory.length).toFixed(1) : 0;

  const handleSave = () => {
    onUpdateUser(user.id, { name: editName, avatar: editAvatar });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <i className="fa-solid fa-arrow-left"></i> 返回儀表板
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Edit */}
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center">
          <div 
            className="w-32 h-32 rounded-full border-4 mb-6 overflow-hidden relative group" 
            style={{ borderColor: user.color }}
          >
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            {isEditing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs text-center p-2">
                修改連結在下方
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="w-full space-y-4">
              <div>
                <label className="block text-xs text-slate-500 uppercase font-bold mb-1">暱稱</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 uppercase font-bold mb-1">頭像連結 (URL)</label>
                <input 
                  type="text" 
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 py-2 rounded-lg font-bold transition-colors"
                >
                  儲存
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black mb-1">{user.name}</h2>
              <p className="text-slate-400 mb-6">戒菸計畫成員</p>
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-2 border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 text-sm font-medium"
              >
                編輯個人檔案
              </button>
            </>
          )}

          <div className="grid grid-cols-2 gap-4 w-full mt-8">
            <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700/50">
              <span className="block text-xs text-slate-500 uppercase mb-1">累計抽菸</span>
              <span className="text-2xl font-bold text-white">{totalSmokes} <span className="text-xs">支</span></span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl text-center border border-slate-700/50">
              <span className="block text-xs text-slate-500 uppercase mb-1">日平均</span>
              <span className="text-2xl font-bold text-white">{avgSmokes} <span className="text-xs">支</span></span>
            </div>
          </div>
        </div>

        {/* Individual Stats Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-cyan-400"></i>
            個人歷史趨勢
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={personalHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={user.color} 
                  strokeWidth={4} 
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">最近紀錄</h4>
            <div className="space-y-2">
              {personalHistory.slice(-5).reverse().map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <span className="text-slate-300 font-medium">{entry.date}</span>
                  <span className="text-white font-bold">{entry.count} 支</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
