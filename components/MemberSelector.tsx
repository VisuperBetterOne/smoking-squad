
import React, { useState } from 'react';
import { Member } from '../types';
import { Edit2, Check } from 'lucide-react';

interface MemberSelectorProps {
  members: Member[];
  activeMemberId: string;
  onSelect: (id: string) => void;
  onUpdateName: (id: string, newName: string) => void;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({ members, activeMemberId, onSelect, onUpdateName }) => {
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
    <div className="flex space-x-2 overflow-x-auto px-4 py-4 no-scrollbar bg-[#000000] border-b border-zinc-900 sticky top-0 z-40">
      {members.map((member) => {
        const isActive = activeMemberId === member.id;
        const isEditing = editingId === member.id;

        return (
          <div
            key={member.id}
            className={`flex items-center space-x-2 flex-shrink-0 transition-all px-4 py-2 rounded-xl border ${
              isActive 
                ? 'bg-zinc-900 border-indigo-500 text-white' 
                : 'bg-black border-zinc-800 text-zinc-500'
            }`}
            onClick={() => !isEditing && onSelect(member.id)}
          >
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  autoFocus
                  className="bg-zinc-800 text-white text-xs border-none focus:ring-0 p-1 rounded w-20"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                />
                <Check size={14} className="text-emerald-500" onClick={(e) => { e.stopPropagation(); saveEdit(); }} />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-black whitespace-nowrap">{member.name}</span>
                {isActive && (
                  <Edit2 
                    size={12} 
                    className="text-zinc-500 hover:text-white" 
                    onClick={(e) => { e.stopPropagation(); startEditing(member); }} 
                  />
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
