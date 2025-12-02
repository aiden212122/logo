import React from 'react';
import { AnalysisResult, GeneratedLogo } from '../types';
import { ArrowDownTrayIcon, ArrowPathIcon, PlusIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

interface LogoDisplayProps {
  logos: GeneratedLogo[];
  selectedIndex: number;
  onSelectLogo: (index: number) => void;
  analysis: AnalysisResult;
  editablePrompt: string;
  onPromptChange: (prompt: string) => void;
  onReset: () => void;
  onRegenerate: () => void;
  onRefine: () => void;
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({ 
  logos, 
  selectedIndex, 
  onSelectLogo, 
  analysis, 
  editablePrompt,
  onPromptChange,
  onReset,
  onRegenerate,
  onRefine
}) => {
  const currentLogo = logos[selectedIndex];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentLogo.imageUrl;
    link.download = `zenlogo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Column: Analysis & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-zen-100">
            <h3 className="text-xl font-bold text-zen-900 mb-6 border-b border-zen-100 pb-3 flex items-center">
              <span className="bg-gold-500 w-2 h-6 mr-3 rounded-sm"></span>
              AI 设计分析报告
            </h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-zen-500 uppercase tracking-wider mb-2">提取视觉元素</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.visualSymbols.map((symbol, idx) => (
                    <span key={idx} className="bg-zen-50 text-zen-800 px-4 py-2 rounded-lg text-sm font-medium border border-zen-200">
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-zen-500 uppercase tracking-wider mb-2">推荐配色方案</p>
                <p className="text-zen-800 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm leading-relaxed">
                  {analysis.colorPalette}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold text-zen-500 uppercase tracking-wider mb-2">设计理念</p>
                <p className="text-zen-700 text-sm leading-relaxed italic border-l-4 border-gold-200 pl-4 py-1">
                  "{analysis.designReasoning}"
                </p>
              </div>

              {/* Editable Prompt Section */}
              <div className="pt-4 border-t border-zen-100">
                <label className="text-sm font-bold text-zen-500 uppercase tracking-wider mb-2 block flex justify-between items-center">
                  <span>提示词 / 调整指令 (Prompt Editor)</span>
                </label>
                <p className="text-xs text-zen-400 mb-2">
                   您可以直接修改下方的提示词（例如：将"金色"改为"红色"，或"线条更细"），然后选择【基于当前提示词生成】或【基于此图重绘】。
                </p>
                <textarea
                  value={editablePrompt}
                  onChange={(e) => onPromptChange(e.target.value)}
                  className="w-full h-32 p-3 text-sm border border-zen-200 rounded-lg focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none resize-none font-mono bg-gray-50 text-zen-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                 <button 
                  onClick={onRegenerate}
                  className="flex items-center justify-center w-full py-3 border border-gold-500 text-gold-600 rounded-lg hover:bg-gold-50 transition-colors font-bold"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2" />
                  基于当前提示词生成 (Regenerate)
                </button>
                
                 <button 
                  onClick={onRefine}
                  className="flex items-center justify-center w-full py-3 bg-zen-800 text-white rounded-lg hover:bg-zen-900 transition-colors font-bold"
                >
                  <PaintBrushIcon className="w-5 h-5 mr-2" />
                  基于此图 + 提示词重绘 (Refine)
                </button>

                <button 
                  onClick={onReset}
                  className="flex items-center justify-center w-full py-3 border border-zen-200 text-zen-500 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  设计新方案 (Start Over)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Logo Display & History */}
        <div className="space-y-6">
           {/* Main Display */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-zen-200 flex flex-col items-center">
            <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group">
              <img 
                src={currentLogo.imageUrl} 
                alt="Generated Logo" 
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none"></div>
            </div>
            
            <div className="mt-8 w-full flex gap-4">
              <button 
                onClick={handleDownload}
                className="flex-1 py-4 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-bold shadow-lg shadow-gold-200 transition-all transform hover:-translate-y-1 flex items-center justify-center"
              >
                <ArrowDownTrayIcon className="w-6 h-6 mr-2" />
                下载高清原图 (2K PNG)
              </button>
            </div>
            <p className="mt-4 text-xs text-zen-400 text-center w-full">
              提示：生成的图片为高清位图，可直接用于社交媒体头像或打印。如需矢量文件(AI/SVG)，建议使用矢量转换工具处理。
            </p>
          </div>

          {/* History / Versions Strip */}
          {logos.length > 1 && (
            <div className="bg-white p-6 rounded-xl border border-zen-100 shadow-sm">
              <h4 className="text-sm font-bold text-zen-600 mb-4 flex items-center">
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                方案历史 (Versions)
              </h4>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {logos.map((logo, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectLogo(idx)}
                    className={`
                      relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all
                      ${idx === selectedIndex ? 'border-gold-500 ring-2 ring-gold-200' : 'border-gray-100 hover:border-gray-300'}
                    `}
                  >
                    <img src={logo.imageUrl} alt={`Version ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-1">
                      V{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoDisplay;