
import React, { useState } from 'react';
import { Member } from '../types';
import { Edit2, Check, Crown } from 'lucide-react';

interface MemberSelectorProps {
  members: Member[];
  activeMemberId: string;
  smokingDirectorId?: string;
  onSelect: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({ 
  members, 
  activeMemberId, 
  smokingDirectorId,
  onSelect, 
  onUpdateName 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  const startEditing = (member: Member) => {
    setEditingId(member.id);
    setTempName(member.name);
  };

  const saveEdit = () => {
    if (editingId && tempName.trim()) {
      onUpdateName(editingId, tempName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex space-x-3 overflow-x-auto px-4 py-5 no-scrollbar bg-[#000000] border-b border-zinc-900 sticky top-0 z-40">
      {members.map((member) => {
        const isActive = activeMemberId === member.id;
        const isEditing = editingId === member.id;
        const isDirector = smokingDirectorId === member.id;

        return (
          <div
            key={member.id}
            className={`flex flex-col items-center justify-center flex-shrink-0 transition-all px-5 py-2.5 rounded-2xl border ${
              isActive 
                ? 'bg-zinc-900 border-indigo-500/50 text-white shadow-[0_4px_12px_rgba(99,102,241,0.1)]' 
                : 'bg-black border-zinc-800 text-zinc-500'
            }`}
            onClick={() => !isEditing && onSelect(member.id)}
          >
            {isEditing ? (
              <div className="flex items-center space-x-2 py-1">
                <input
                  autoFocus
                  className="bg-zinc-800 text-white text-xs border-none focus:ring-1 focus:ring-indigo-500 p-1 rounded w-20"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                />
                <Check size={14} className="text-emerald-500" onClick={(e) => { e.stopPropagation(); saveEdit(); }} />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1.5">
                  <span className={`text-sm font-black whitespace-nowrap ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                    {member.name}
                  </span>
                  {isActive && (
                    <Edit2 
                      size={11} 
                      className="text-zinc-600 hover:text-white transition-colors" 
                      onClick={(e) => { e.stopPropagation(); startEditing(member); }} 
                    />
                  )}
                </div>
                {isDirector && (
                  <div className="flex items-center gap-0.5 text-rose-500 mt-0.5">
                    <Crown size={9} strokeWidth={3} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">主任</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemberSelector;
