
import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { PromptData, GeminiMode, GeneratedPrompts, SelectOption } from './types';
import { 
  TIME_OF_DAY_OPTIONS, 
  CAMERA_MOVEMENTS, 
  LIGHTING_OPTIONS, 
  VIDEO_STYLES, 
  VIDEO_MOODS 
} from './constants';
import GlassCard from './components/GlassCard';
import InputGroup from './components/InputGroup';
import SelectGroup from './components/SelectGroup';
import Button from './components/Button';
import { 
  generateDetailedIndonesianPrompt, 
  translateToEnglishWithExclusion, 
  generateImageWithGemini 
} from './services/geminiService';

// SVG Icons (no changes, but keep them for buttons)
const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const PhotoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const App: React.FC = () => {
  const initialPromptData: PromptData = {
    subject: '', action: '', expression: '', setting: '', timeOfDay: '',
    cameraMovement: '', lighting: '', videoStyle: '', videoMood: '',
    soundMusic: '', spokenLines: '', additionalDetails: ''
  };
  const [promptData, setPromptData] = useState<PromptData>(initialPromptData);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompts | null>(null);
  const [visualizationUrl, setVisualizationUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null); // To differentiate loading states
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copyButtonText, setCopyButtonText] = useState<string>('Salin Prompt Inggris');

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPromptData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleIndonesianPromptChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedPrompts(prev => prev ? ({ ...prev, indonesian: e.target.value }) : null);
  }, []);

  const handleGenerateAndTranslatePrompt = useCallback(async () => {
    if (Object.values(promptData).every(val => val === '')) {
      setErrorMessage('Harap isi setidaknya satu kolom untuk membuat prompt.');
      return;
    }
    setIsLoading(true);
    setLoadingAction('generating');
    setErrorMessage('');
    setGeneratedPrompts(null);
    setVisualizationUrl('');

    try {
      const indonesianPrompt = await generateDetailedIndonesianPrompt(promptData);
      const englishPrompt = await translateToEnglishWithExclusion(indonesianPrompt, promptData.spokenLines);
      setGeneratedPrompts({ indonesian: indonesianPrompt, english: englishPrompt });
    } catch (error: any) {
      setErrorMessage(error.message || "Terjadi kesalahan saat membuat prompt.");
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [promptData]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!generatedPrompts?.english) return;
    try {
      await navigator.clipboard.writeText(generatedPrompts.english);
      setCopyButtonText('Prompt Inggris Tersalin!');
      setTimeout(() => setCopyButtonText('Salin Prompt Inggris'), 2000);
    } catch (err) {
      console.error('Gagal menyalin teks: ', err);
      setErrorMessage('Gagal menyalin prompt.');
    }
  }, [generatedPrompts]);

  const handleVisualize = useCallback(async () => {
    if (!generatedPrompts?.english) {
        setErrorMessage("Harap buat prompt terlebih dahulu untuk divisualisasikan.");
        return;
    }
    setIsLoading(true);
    setLoadingAction('visualizing');
    setErrorMessage('');
    setVisualizationUrl('');

    try {
      const imageUrl = await generateImageWithGemini(generatedPrompts.english);
      setVisualizationUrl(imageUrl);
    } catch (error: any) {
      setErrorMessage(error.message || "Terjadi kesalahan dengan Gemini saat visualisasi.");
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [generatedPrompts]);

  const isApiKeyMissing = !process.env.API_KEY;

  // Reset error message when inputs change
  useEffect(() => {
    if (errorMessage) setErrorMessage('');
  }, [promptData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-indigo-800 to-slate-900 text-white font-sans p-4 sm:p-8 flex flex-col items-center selection:bg-sky-500 selection:text-white">
      <header className="my-6 sm:my-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Veo 3 Prompt <span className="text-sky-400">Studio</span>
        </h1>
        <p className="text-blue-200 mt-2 text-lg">Rakit prompt video menakjubkan dengan bantuan AI.</p>
      </header>

      <div className="w-full max-w-4xl space-y-8">
        <GlassCard className="shadow-blue-500/30">
          <h2 className="text-2xl font-semibold text-sky-300 mb-6 border-b border-sky-700/50 pb-3">Definisikan Adegan Anda</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InputGroup label="Subjek Utama" id="subject" name="subject" value={promptData.subject} onChange={handleInputChange} placeholder="Mis: Naga emas raksasa, Dua astronot"/>
            <InputGroup label="Aksi / Aktivitas" id="action" name="action" value={promptData.action} onChange={handleInputChange} placeholder="Mis: terbang melintasi gunung, berdebat seru"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <InputGroup label="Ekspresi Subjek" id="expression" name="expression" value={promptData.expression} onChange={handleInputChange} placeholder="Mis: marah mata menyala, penasaran & takjub"/>
             <InputGroup label="Tempat / Setting" id="setting" name="setting" value={promptData.setting} onChange={handleInputChange} placeholder="Mis: kastil di atas awan, reruntuhan kuil kuno"/>
          </div>
          
          <h3 className="text-xl font-medium text-sky-400 mt-6 mb-3 border-b border-sky-700/50 pb-2">Detail Visual & Atmosfer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <SelectGroup label="Waktu" id="timeOfDay" name="timeOfDay" value={promptData.timeOfDay} onChange={handleInputChange} options={TIME_OF_DAY_OPTIONS}/>
            <SelectGroup label="Gerakan Kamera" id="cameraMovement" name="cameraMovement" value={promptData.cameraMovement} onChange={handleInputChange} options={CAMERA_MOVEMENTS}/>
            <SelectGroup label="Pencahayaan" id="lighting" name="lighting" value={promptData.lighting} onChange={handleInputChange} options={LIGHTING_OPTIONS}/>
            <SelectGroup label="Gaya Video" id="videoStyle" name="videoStyle" value={promptData.videoStyle} onChange={handleInputChange} options={VIDEO_STYLES}/>
          </div>
           <SelectGroup label="Suasana Video" id="videoMood" name="videoMood" value={promptData.videoMood} onChange={handleInputChange} options={VIDEO_MOODS}/>

          <h3 className="text-xl font-medium text-sky-400 mt-6 mb-3 border-b border-sky-700/50 pb-2">Audio & Narasi</h3>
           <InputGroup label="Suara atau Musik Latar" id="soundMusic" name="soundMusic" value={promptData.soundMusic} onChange={handleInputChange} placeholder="Mis: musik orkestra epik, suara alam hutan"/>
           <InputGroup label="Kalimat yang Diucapkan (Dialog/Narasi)" id="spokenLines" name="spokenLines" type="textarea" rows={2} value={promptData.spokenLines} onChange={handleInputChange} placeholder="Mis: 'Kita harus pergi dari sini!', 'Di sebuah negeri yang jauh...'"/>
          
          <h3 className="text-xl font-medium text-sky-400 mt-6 mb-3 border-b border-sky-700/50 pb-2">Detail Tambahan</h3>
          <InputGroup label="Detail Tambahan Spesifik" id="additionalDetails" name="additionalDetails" type="textarea" value={promptData.additionalDetails} onChange={handleInputChange} placeholder="Mis: fokus tekstur sisik naga, efek partikel debu, dll."/>
          
          <Button 
            onClick={handleGenerateAndTranslatePrompt} 
            className="w-full mt-8 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
            isLoading={isLoading && loadingAction === 'generating'}
            disabled={isLoading || isApiKeyMissing}
          >
            Buat Prompt Veo 3 (ID & EN)
          </Button>
           {isApiKeyMissing && (
                 <p className="text-sm text-amber-400 mt-3 text-center">Fitur pembuatan prompt dinonaktifkan. API_KEY tidak dikonfigurasi.</p>
            )}
        </GlassCard>

        {errorMessage && (
          <GlassCard className="bg-red-500/20 border-red-400/30 text-red-100">
            <h3 className="font-semibold text-red-50 mb-1">Error</h3>
            <p>{errorMessage}</p>
          </GlassCard>
        )}

        {isLoading && loadingAction === 'generating' && (
          <GlassCard className="flex justify-center items-center p-10">
             <div className="flex flex-col items-center text-sky-300">
                <svg className="animate-spin h-10 w-10 text-sky-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Sedang membuat dan menerjemahkan prompt...</p>
             </div>
          </GlassCard>
        )}

        {generatedPrompts && !errorMessage && !isLoading && (
          <GlassCard>
            <h2 className="text-2xl font-semibold text-sky-300 mb-4">Prompt Veo 3 Anda:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-medium text-sky-400 mb-2">Bahasa Indonesia (Dapat Diedit)</h3>
                <textarea
                  value={generatedPrompts.indonesian}
                  onChange={handleIndonesianPromptChange}
                  rows={10}
                  className="w-full bg-blue-900/40 border border-blue-400/60 rounded-md p-3 text-blue-100 placeholder-blue-300/70 focus:ring-2 focus:ring-sky-400 focus:outline-none whitespace-pre-wrap break-words"
                  aria-label="Prompt Bahasa Indonesia yang Dapat Diedit"
                />
              </div>
              <div>
                <h3 className="text-xl font-medium text-sky-400 mb-2">Bahasa Inggris (Final)</h3>
                <div 
                  className="w-full bg-blue-950/50 border border-blue-500/50 rounded-md p-3 text-blue-200 whitespace-pre-wrap break-words min-h-[200px] text-sm"
                  aria-label="Prompt Bahasa Inggris Final"
                >
                  {generatedPrompts.english}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button onClick={handleCopyToClipboard} variant="secondary" className="flex-1">
                <ClipboardIcon className="mr-2" /> {copyButtonText}
              </Button>
              {!isApiKeyMissing && (
                <Button 
                  onClick={handleVisualize} 
                  variant="secondary" 
                  className="flex-1"
                  isLoading={isLoading && loadingAction === 'visualizing'}
                  disabled={isLoading}
                >
                  <PhotoIcon className="mr-2" /> Visualisasikan (EN)
                </Button>
              )}
            </div>
             {isApiKeyMissing && !generatedPrompts && (
                 <p className="text-sm text-amber-400 mt-4 text-center">Fitur visualisasi dinonaktifkan. API_KEY tidak dikonfigurasi.</p>
            )}
          </GlassCard>
        )}
        
        {isLoading && loadingAction === 'visualizing' && (
          <GlassCard className="flex justify-center items-center p-10">
             <div className="flex flex-col items-center text-sky-300">
                <svg className="animate-spin h-10 w-10 text-sky-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Gemini sedang membuat visualisasi...</p>
             </div>
          </GlassCard>
        )}

        {visualizationUrl && !isLoading && (
          <GlassCard>
            <h2 className="text-2xl font-semibold text-sky-300 mb-4">Visualisasi dari Gemini:</h2>
            <div className="bg-blue-900/40 p-4 rounded-md flex justify-center">
              <img src={visualizationUrl} alt="Visualisasi prompt dari Gemini" className="max-w-full max-h-[400px] sm:max-h-[500px] rounded-lg shadow-lg"/>
            </div>
          </GlassCard>
        )}
      </div>
      <footer className="text-center text-blue-300/70 py-8 mt-12 text-sm">
        Ditenagai oleh React, Tailwind CSS, dan Google Gemini.
      </footer>
    </div>
  );
};

export default App;
