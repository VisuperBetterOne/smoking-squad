
import React from 'react';
import { AIInsight } from '../types';

interface AIPanelProps {
  insight: AIInsight | null;
  loading: boolean;
  onRefresh: () => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ insight, loading, onRefresh }) => {
  return (
    <div className="glass-card rounded-2xl p-6 border-l-4 border-l-cyan-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <i className="fa-solid fa-robot text-cyan-400"></i>
          AI 健康管家
        </h2>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
        >
          {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-rotate-right"></i>}
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 italic">
          正在分析數據，請稍候...
        </div>
      ) : insight ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1">小組表現</h4>
            <p className="text-slate-300 leading-relaxed">{insight.summary}</p>
          </div>
          <div>
            <h4 className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1">健康建議</h4>
            <p className="text-slate-300 leading-relaxed">{insight.suggestion}</p>
          </div>
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xl font-medium text-center italic text-white">
              「{insight.motivationalQuote}」
            </p>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400">
          點擊上方按鈕獲取 AI 分析建議。
        </div>
      )}
    </div>
  );
};

export default AIPanel;
