import React, { useState } from 'react';
import InputForm from './components/InputForm';
import LogoDisplay from './components/LogoDisplay';
import { UserInput, AnalysisResult, GeneratedLogo } from './types';
import { analyzeBrand, constructLogoPrompt, generateLogoFromPrompt } from './services/geminiService';

// Fix TS2580: Cannot find name 'process' fallback
declare const process: any;

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'analyzing' | 'generating' | 'complete'>('input');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  
  // Changed to array to support history
  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
  const [selectedLogoIndex, setSelectedLogoIndex] = useState<number>(0);
  const [editablePrompt, setEditablePrompt] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);

  // API Key Check Handler
  const ensureApiKey = async (): Promise<boolean> => {
    try {
      // 1. Check AI Studio Environment
      // Use type casting to avoid conflicts with global window.aistudio declaration
      const win = window as any;
      if (typeof window !== 'undefined' && win.aistudio && win.aistudio.hasSelectedApiKey) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await win.aistudio.openSelectKey();
            // Race condition mitigation: assume success if dialog interaction completes
            return true; 
        }
        return true;
      }
      
      // 2. Check Standard Environment Variables (Vercel/Vite/Node)
      if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_KEY) {
        return true;
      }
      if (typeof process !== 'undefined' && process.env?.API_KEY) {
        return true;
      }
      
      return false;
    } catch (e) {
      console.warn("API Key selection error", e);
      return false;
    }
  };

  const handleGenerate = async (input: UserInput) => {
    setError(null);
    setUserInput(input);
    
    // Check API Key first
    const hasKey = await ensureApiKey();
    if (!hasKey) {
      setError("未检测到 API Key。如果您在 Vercel 部署，请在项目设置中添加环境变量 VITE_API_KEY。");
      return;
    }

    try {
      // Step 1: Analyze
      setStep('analyzing');
      const analysisResult = await analyzeBrand(input);
      setAnalysis(analysisResult);

      // Step 2: Construct Prompt
      const initialPrompt = constructLogoPrompt(input, analysisResult);
      setEditablePrompt(initialPrompt);

      // Step 3: Generate
      setStep('generating');
      const imageUrl = await generateLogoFromPrompt(initialPrompt, input.referenceImageBase64, input.referenceImageMimeType);
      
      const newLogo: GeneratedLogo = {
        imageUrl,
        promptUsed: initialPrompt
      };

      setGeneratedLogos([newLogo]);
      setSelectedLogoIndex(0);
      setStep('complete');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "发生意外错误，请重试。");
      setStep('input');
    }
  };

  const handleRegenerate = async () => {
    if (!userInput || !analysis) return;
    
    setError(null);
    setStep('generating'); // Re-use generating step UI

    try {
      // Use the potentially edited prompt
      // Uses the ORIGINAL user reference image (if any)
      const imageUrl = await generateLogoFromPrompt(editablePrompt, userInput.referenceImageBase64, userInput.referenceImageMimeType);
      
      const newLogo: GeneratedLogo = {
        imageUrl,
        promptUsed: editablePrompt
      };

      setGeneratedLogos(prev => [...prev, newLogo]);
      setSelectedLogoIndex(prev => prev + 1); // Select the new logo
      setStep('complete');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "生成失败，请重试。");
      setStep('complete'); // Go back to complete screen even if failed so user sees old logos
    }
  };

  // New function: Refine based on the CURRENT generated image
  const handleRefine = async () => {
    if (generatedLogos.length === 0) return;
    
    const currentLogo = generatedLogos[selectedLogoIndex];
    setError(null);
    setStep('generating');

    try {
      // Parse the current logo Data URL to get base64 and mime type
      const [meta, data] = currentLogo.imageUrl.split(',');
      const mimeType = meta.split(':')[1].split(';')[0];
      
      if (!data || !mimeType) throw new Error("无法解析当前图片数据");

      // Generate using the current image as the reference
      const imageUrl = await generateLogoFromPrompt(editablePrompt, data, mimeType);
      
      const newLogo: GeneratedLogo = {
        imageUrl,
        promptUsed: editablePrompt
      };

      setGeneratedLogos(prev => [...prev, newLogo]);
      setSelectedLogoIndex(prev => prev + 1);
      setStep('complete');

    } catch (err: any) {
      console.error(err);
      setError(err.message || "重绘失败，请重试。");
      setStep('complete');
    }
  };

  const handleReset = () => {
    setStep('input');
    setGeneratedLogos([]);
    setSelectedLogoIndex(0);
    setAnalysis(null);
    setError(null);
    setEditablePrompt('');
  };

  return (
    <div className="min-h-screen bg-zen-50 flex flex-col font-sans text-zen-900">
      {/* Header */}
      <header className="bg-white border-b border-zen-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-zen-800 rounded-lg flex items-center justify-center text-gold-400 font-serif font-bold text-xl shadow-md">
               禅
             </div>
             <div>
               <h1 className="text-xl font-serif font-bold text-zen-900 tracking-tight">ZenLogo AI</h1>
               <p className="text-xs text-zen-500 tracking-widest">足浴 · SPA · 养生 专属设计</p>
             </div>
          </div>
          {/* Removed Model Badge */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">错误: {error}</p>
              </div>
            </div>
          </div>
        )}

        {step === 'input' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-zen-900 mb-4">
                足浴/SPA 行业专属 Logo 生成器
              </h2>
              <p className="text-lg text-zen-600 leading-relaxed">
                输入店名与服务项目，AI 自动提取行业视觉符号（如莲花、水波、竹韵），
                为您生成 <span className="text-gold-600 font-bold">2K 级高清矢量风格</span> 品牌标识。
              </p>
            </div>
            <InputForm onSubmit={handleGenerate} isProcessing={false} />
          </div>
        )}

        {(step === 'analyzing' || step === 'generating') && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-pulse">
            <div className="w-24 h-24 border-4 border-zen-200 border-t-gold-500 rounded-full animate-spin mb-8"></div>
            <h3 className="text-2xl font-serif font-bold text-zen-800 mb-2">
              {step === 'analyzing' ? '正在分析品牌基因...' : '正在渲染 2K 矢量图形...'}
            </h3>
            <p className="text-zen-500">
              {step === 'analyzing' 
                ? 'AI 正在提取行业特征与色彩心理学分析...' 
                : 'AI 正在进行光影渲染与边缘锐化处理...'}
            </p>
          </div>
        )}

        {step === 'complete' && generatedLogos.length > 0 && analysis && (
          <LogoDisplay 
            logos={generatedLogos}
            selectedIndex={selectedLogoIndex}
            onSelectLogo={setSelectedLogoIndex}
            analysis={analysis} 
            editablePrompt={editablePrompt}
            onPromptChange={setEditablePrompt}
            onReset={handleReset} 
            onRegenerate={handleRegenerate}
            onRefine={handleRefine}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-zen-900 text-zen-400 py-12 border-t border-zen-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-4 text-zen-300 font-serif">&copy; {new Date().getFullYear()} ZenLogo AI. 专为足浴与SPA行业定制。</p>
          <div className="text-xs text-zen-600 space-y-2">
            <p>生成图像仅供灵感参考，商业使用建议进行商标注册查询。</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;