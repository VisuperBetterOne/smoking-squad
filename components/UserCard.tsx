
import React from 'react';
import { User } from '../types';

interface UserCardProps {
  user: User;
  count: number;
  onIncrement: (userId: string) => void;
  onDecrement: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, count, onIncrement, onDecrement, onViewProfile }) => {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col items-center transition-all hover:scale-[1.02] hover:shadow-2xl relative overflow-hidden group">
      {/* Profile link overlay for top section */}
      <div 
        className="absolute inset-x-0 top-0 h-48 cursor-pointer z-0" 
        onClick={() => onViewProfile(user.id)}
        title="查看個人資料"
      />

      <div 
        className="w-20 h-20 rounded-full border-4 mb-4 overflow-hidden z-10 pointer-events-none group-hover:border-white transition-colors" 
        style={{ borderColor: user.color }}
      >
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      </div>
      
      <h3 className="text-xl font-bold mb-1 z-10 pointer-events-none">{user.name}</h3>
      <p className="text-slate-400 text-sm mb-4 z-10 pointer-events-none">今日抽菸量</p>
      
      <div className="text-5xl font-black mb-6 flex items-baseline z-10 pointer-events-none">
        <span style={{ color: user.color }}>{count}</span>
        <span className="text-sm text-slate-500 font-normal ml-2">支</span>
      </div>

      <div className="flex gap-4 w-full z-10 relative">
        <button
          onClick={(e) => { e.stopPropagation(); onDecrement(user.id); }}
          className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 disabled:opacity-50"
          disabled={count <= 0}
        >
          <i className="fa-solid fa-minus"></i>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onIncrement(user.id); }}
          className="flex-[2] py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-white"
          style={{ backgroundColor: user.color }}
        >
          點擊紀錄
        </button>
      </div>
    </div>
  );
};

export default UserCard;
