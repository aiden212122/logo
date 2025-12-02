import React from 'react';
import { AnalysisResult, GeneratedLogo } from '../types';
import { ArrowDownTrayIcon, ArrowPathIcon, PlusIcon, SparklesIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

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
                  placeholder="在这里修改 AI 生成的提示词..."
                  className="w-full h-40 p-3 text-xs md:text-sm border border-zen-200 rounded-lg focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none resize-none bg-zen-50 text-zen-700 font-mono leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="bg-zen-50 p-6 rounded-2xl border border-zen-100 flex justify-between items-center">
             <div>
                <h3 className="text-sm font-bold text-zen-800 mb-1">英文映射 (Internal Translation)</h3>
                <p className="text-zen-600 font-mono text-xs">{analysis.englishTranslation}</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Generate from Scratch (Text only) */}
             <button
               onClick={onRegenerate}
               className="flex items-center justify-center gap-2 px-4 py-4 border border-gold-200 shadow-sm text-sm font-bold rounded-xl text-gold-700 bg-gold-50 hover:bg-gold-100 transition-colors"
             >
               <PlusIcon className="w-5 h-5" />
               基于当前提示词生成
               <span className="text-[10px] opacity-60 font-normal ml-1 hidden lg:inline">(不参考当前图)</span>
             </button>

             {/* Refine (Image + Text) */}
             <button
               onClick={onRefine}
               className="flex items-center justify-center gap-2 px-4 py-4 border border-zen-600 shadow-md text-sm font-bold rounded-xl text-white bg-zen-700 hover:bg-zen-800 transition-colors"
             >
               <PaintBrushIcon className="w-5 h-5" />
               基于此图 + 提示词重绘
               <span className="text-[10px] opacity-60 font-normal ml-1 hidden lg:inline">(微调当前图)</span>
             </button>
          </div>
          
           <button
             onClick={onReset}
             className="w-full flex items-center justify-center gap-2 px-6 py-4 border border-zen-200 shadow-sm text-sm font-bold rounded-xl text-zen-600 bg-white hover:bg-gray-50 transition-colors"
           >
             <ArrowPathIcon className="w-5 h-5" />
             重新开始 (Start Over)
           </button>
        </div>

        {/* Right Column: The Logo Display & History */}
        <div className="sticky top-8 space-y-6">
           {/* Main Viewer */}
           <div className="bg-white p-4 rounded-3xl shadow-2xl border border-zen-100 relative group">
             {/* Checkerboard pattern for transparency indication */}
             <div 
               className="aspect-square rounded-2xl overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/grid-noise.png')] bg-gray-50 flex items-center justify-center"
             >
                <img 
                  src={currentLogo.imageUrl} 
                  alt="Generated Spa Logo" 
                  className="w-full h-full object-contain"
                />
             </div>
             
             <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md font-medium">
                 2K 高清矢量级
               </span>
             </div>

             <div className="mt-6 flex justify-center pb-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-gold-200/50 transform hover:-translate-y-1 transition-all"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  下载当前方案 (PNG)
                </button>
             </div>
           </div>
           
           {/* History Thumbnails */}
           {logos.length > 0 && (
             <div className="bg-white p-4 rounded-2xl border border-zen-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-zen-500 uppercase tracking-wider">方案历史 (History)</h4>
                  <span className="text-xs text-zen-400">{logos.length} 个方案</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {logos.map((logo, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectLogo(idx)}
                      className={`
                        flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative
                        ${selectedIndex === idx 
                          ? 'border-gold-500 ring-2 ring-gold-100 ring-offset-1' 
                          : 'border-transparent hover:border-zen-300 opacity-70 hover:opacity-100'}
                      `}
                    >
                      <img 
                        src={logo.imageUrl} 
                        alt={`Version ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      {selectedIndex === idx && (
                         <div className="absolute inset-0 bg-gold-500/10" />
                      )}
                    </button>
                  ))}
                </div>
             </div>
           )}

           <p className="text-center text-xs text-gray-400">
             AI 生成结果仅供灵感参考，建议配合设计师进行矢量化调整。
           </p>
        </div>
      </div>
    </div>
  );
};

export default LogoDisplay;