import React, { ChangeEvent, useState } from 'react';
import { BrandingStyle, UserInput } from '../types';
import { PhotoIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isProcessing: boolean;
}

const STYLE_OPTIONS = [
  { 
    value: BrandingStyle.NEW_CHINESE, 
    label: '新中式雅致', 
    desc: '融合传统符号与现代审美，清雅高贵，适合高端养生会所。' 
  },
  { 
    value: BrandingStyle.TRADITIONAL, 
    label: '传统中式', 
    desc: '书法、水墨、印章，文化底蕴深厚，适合老字号或正宗推拿。' 
  },
  { 
    value: BrandingStyle.LUXURY, 
    label: '轻奢高端', 
    desc: '金箔质感，大理石元素，对称设计，尊贵奢华。' 
  },
  { 
    value: BrandingStyle.MODERN, 
    label: '现代简约', 
    desc: '几何线条，干净利落，色彩清新，年轻化、科技感。' 
  },
  { 
    value: BrandingStyle.THAI, 
    label: '泰式风情', 
    desc: '暖色调，大象、莲花、图腾，异域放松氛围。' 
  },
  { 
    value: BrandingStyle.JAPANESE_ZEN, 
    label: '日式禅意', 
    desc: '枯山水、竹子、圆相，极简留白，自然宁静。' 
  },
];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isProcessing }) => {
  const [formData, setFormData] = useState<UserInput>({
    storeName: '',
    slogan: '',
    services: '',
    style: BrandingStyle.NEW_CHINESE,
    referenceImageBase64: undefined,
    referenceImageMimeType: undefined
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("文件过大，请上传小于 5MB 的图片。");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const [meta, data] = base64String.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        
        setFormData(prev => ({
          ...prev,
          referenceImageBase64: data,
          referenceImageMimeType: mimeType
        }));
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.storeName || !formData.services) {
      alert("请填写店名和经营服务。");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-zen-100">
      <h2 className="text-2xl font-serif text-zen-900 mb-6 flex items-center gap-2">
        <SparklesIcon className="w-6 h-6 text-gold-500" />
        设计需求 (Design Brief)
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Name & Slogan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-zen-800 mb-2">店铺名称</label>
            <input
              type="text"
              name="storeName"
              placeholder="例如：云隐足道"
              value={formData.storeName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-zen-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none transition-all placeholder-gray-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zen-800 mb-2">副标题 / Slogan</label>
            <input
              type="text"
              name="slogan"
              placeholder="例如：养生 · SPA · 茶道"
              value={formData.slogan}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-zen-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none transition-all placeholder-gray-400"
            />
          </div>
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-bold text-zen-800 mb-2">经营项目 (用于提取视觉元素)</label>
          <textarea
            name="services"
            placeholder="例如：泰式按摩，足疗，拔罐，精油开背，采耳..."
            value={formData.services}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-zen-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none transition-all resize-none placeholder-gray-400"
            required
          />
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-bold text-zen-800 mb-3">设计风格</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {STYLE_OPTIONS.map((option) => (
              <label 
                key={option.value}
                className={`
                  relative flex flex-col items-start p-4 rounded-xl border cursor-pointer transition-all hover:bg-gray-50
                  ${formData.style === option.value 
                    ? 'border-gold-500 bg-gold-50/50 ring-1 ring-gold-500' 
                    : 'border-zen-200'}
                `}
              >
                <div className="flex items-center gap-3 w-full">
                  <input
                    type="radio"
                    name="style"
                    value={option.value}
                    checked={formData.style === option.value}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-gold-600 border-gray-300 focus:ring-gold-500"
                  />
                  <span className={`font-bold ${formData.style === option.value ? 'text-gold-800' : 'text-zen-700'}`}>
                    {option.label}
                  </span>
                </div>
                <p className="mt-1 ml-7 text-xs text-zen-500">
                  {option.desc}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Reference Image */}
        <div>
          <label className="block text-sm font-bold text-zen-800 mb-2">参考图 (可选)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zen-200 border-dashed rounded-lg hover:bg-zen-50 transition-colors relative">
            <div className="space-y-1 text-center">
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-contain rounded shadow-sm" />
                  <button 
                    type="button"
                    onClick={() => { setPreviewUrl(null); setFormData(prev => ({...prev, referenceImageBase64: undefined})); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-md"
                  >
                    ×
                  </button>
                  <p className="text-xs text-green-600 mt-2">已上传参考图</p>
                </div>
              ) : (
                <>
                  <PhotoIcon className="mx-auto h-12 w-12 text-zen-300" aria-hidden="true" />
                  <div className="flex text-sm text-zen-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-gold-600 hover:text-gold-500 focus-within:outline-none">
                      <span>上传图片</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">或拖拽至此处</p>
                  </div>
                  <p className="text-xs text-zen-400">支持 PNG, JPG (最大 5MB)</p>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className={`
            w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white tracking-wide
            ${isProcessing ? 'bg-zen-400 cursor-not-allowed' : 'bg-zen-800 hover:bg-zen-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zen-500'}
            transition-all duration-200
          `}
        >
          {isProcessing ? '正在智能分析与生成...' : '立即生成 Logo 方案'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;