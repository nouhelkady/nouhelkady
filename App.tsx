

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
    generateAngleImage, fileToBase64, generateProductScene, 
    upscaleImage, generateScenePrompt, generateBrandingAsset 
} from './services/geminiService';
import { 
    GeneratedImage, Angle, multiAngleProcessingSteps, upscaleProcessingSteps,
    SceneType, LightingStyle, CameraAngle, AspectRatio, DesignStyle,
    BrandingAsset, brandingAssetsList
} from './types';

// ===================================================================================
// ICONS & SHARED COMPONENTS
// All components are defined in this file to maintain the project's flat structure.
// ===================================================================================

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const RegenerateIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5v1.5a1.125 1.125 0 0 1-1.125 1.125h-1.5a3.375 3.375 0 0 0-3.375 3.375v1.5a1.125 1.125 0 0 1-1.125 1.125h-1.5a3.375 3.375 0 0 0 3.375 3.375h7.5a1.125 1.125 0 0 1 1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 9.75 14.25v-1.5" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const WandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-2.122.568l-4.24 4.242 1.414 1.414 4.242-4.242a3 3 0 0 0-.568-2.122ZM11.94 12l1.146-1.146a3 3 0 0 1 4.242 0l2.121 2.121a3 3 0 0 1 0 4.242L18.3 18.394M11.94 12 9.53 16.122M18 13.818l-2.121-2.121M12 3v5.657M12 18.343V21m-4.243-4.243-2.121 2.121m12.728-12.728 2.121 2.121M3 9h5.657M18 9h3" /></svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.908 6.161l-1.217 4.432 4.515-1.185zM9.356 8.014c-.13-.346-.264-.352-.393-.358-.128-.006-.273-.008-.416-.008-.142 0-.363.05-.548.247-.185.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.066.099.15.142.248.142.248s.357.575 1.153 1.026c.796.45 1.449.719 1.936.91.488.192 1.071.163 1.482.093.41-.07 1.282-.524 1.465-.989.183-.465.183-.865.128-.954s-.09-.142-.198-.247c-.108-.105-.247-.148-.416-.213-.168-.065-.363-.105-.514-.148-.151-.043-.333-.065-.476.043-.143.108-.575.691-.71 1.026-.135.335-.264.378-.416.234-.151-.143-.633-.524-1.207-.989-.575-.465-1.026-1.071-1.153-1.282z" />
    </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.44c-3.111 0-3.48.011-4.69.068-2.61.12-3.83 1.34-3.95 3.95-.057 1.21-.067 1.58-.067 4.69s.01 3.48.067 4.69c.12 2.61 1.34 3.83 3.95 3.95 1.21.057 1.58.067 4.69.067s3.48-.01 4.69-.067c2.61-.12 3.83-1.34 3.95-3.95.057-1.21.067-1.58.067-4.69s-.01-3.48-.067-4.69c-.12-2.61-1.34-3.83-3.95-3.95C15.48 3.614 15.11 3.603 12 3.603z" /><path d="M12 6.883c-2.825 0-5.117 2.292-5.117 5.117s2.292 5.117 5.117 5.117 5.117-2.292 5.117-5.117-2.292-5.117-5.117-5.117zm0 8.792c-2.03 0-3.675-1.645-3.675-3.675s1.645-3.675 3.675-3.675 3.675 1.645 3.675 3.675-1.645 3.675-3.675-3.675z" /><path d="M16.949 6.012c-.527 0-.954.427-.954.954s.427.954.954.954.954-.427.954.954-.427-.954-.954-.954z" />
    </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.84-.94-6.37-2.96-2.24-2.95-2.24-6.55-.01-9.5 2.34-3.11 6.02-4.51 9.5-4.04.59.07 1.18.16 1.77.26V0z" />
    </svg>
);

const PatreonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h3v18H3z" />
        <path d="M15 3a8 8 0 1 0 0 16a8 8 0 0 0 0-16z" />
    </svg>
);

const AspectSquareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
);

const AspectPortraitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    </svg>
);

const AspectLandscapeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
    </svg>
);

interface ImageModalProps {
    image: { src: string, label: string } | null;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
    if (!image) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
            <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
                <img src={image.src} alt={image.label} className="w-full h-full object-contain rounded-lg" />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition-colors"
                    aria-label="Close"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

interface ProcessingIndicatorProps {
  status: string;
  title?: string;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ status, title }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex flex-col items-center justify-center z-50 text-white">
        <svg className="animate-spin h-12 w-12 text-indigo-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-300">{status}</p>
    </div>
);

// ===================================================================================
// MODULE 1: ElKady Products (Advanced Product Realism Generator)
// ===================================================================================
const ElKadyProducts: React.FC = () => {
    const [productImage, setProductImage] = useState<{file: File, preview: string} | null>(null);
    const [referenceImage, setReferenceImage] = useState<{file: File, preview: string} | null>(null);
    const [prompt, setPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [aiPromptStatus, setAiPromptStatus] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
    const [selectedStyle, setSelectedStyle] = useState<DesignStyle>(DesignStyle.Realistic);

    const productFileInputRef = useRef<HTMLInputElement>(null);
    const referenceFileInputRef = useRef<HTMLInputElement>(null);

    const handleProductFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImage({ file, preview: reader.result as string });
            };
            reader.readAsDataURL(file);
        } else {
            setError('Please select a valid product image file.');
            setProductImage(null);
        }
    };

    const handleReferenceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImage({ file, preview: reader.result as string });
            };
            reader.readAsDataURL(file);
        } else {
            setReferenceImage(null);
        }
    };

    const handleStyleSelect = (style: DesignStyle) => {
        setSelectedStyle(style);
    };

    const handleGenerateAIPrompt = async () => {
        if (!productImage) {
            setError("Please upload a product image first to generate a prompt.");
            return;
        }

        setIsGeneratingPrompt(true);
        setError(null);
        setPrompt('');

        const steps = [
            "Analyzing your product…",
            "Creating perfect scene prompt…",
            "Optimizing lighting and reflections…",
        ];
        let stepIndex = 0;
        const interval = setInterval(() => {
            setAiPromptStatus(steps[stepIndex % steps.length]);
            stepIndex++;
        }, 1500);

        try {
            const { base64: productBase64, mimeType: productMimeType } = await fileToBase64(productImage.file);
            
            let referencePayload: { base64: string; mimeType: string; } | undefined = undefined;
            if (referenceImage) {
                const { base64: refBase64, mimeType: refMimeType } = await fileToBase64(referenceImage.file);
                referencePayload = { base64: refBase64, mimeType: refMimeType };
            }

            const newPrompt = await generateScenePrompt(productBase64, productMimeType, referencePayload);
            setPrompt(newPrompt);

        } catch (e) {
            // FIX: Gracefully handle errors from the API or file processing by checking if 'e' is an Error instance before accessing 'e.message'.
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            clearInterval(interval);
            setAiPromptStatus('');
            setIsGeneratingPrompt(false);
        }
    };

    const handleGenerate = async () => {
        if (!productImage || !prompt) {
            setError("Please upload a product image and write a prompt.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);

        let statusInterval: ReturnType<typeof setInterval> | undefined;
        try {
            const dynamicSteps = [
                `Generating Variation 1 of 4...`,
                `Generating Variation 2 of 4...`,
                `Generating Variation 3 of 4...`,
                `Generating Variation 4 of 4...`,
                `Compositing final images...`
            ];

            let stepIndex = 0;
            statusInterval = setInterval(() => {
                setProcessingStatus(dynamicSteps[stepIndex % dynamicSteps.length]);
                stepIndex++;
            }, 2500);
            

            const { base64: productBase64, mimeType: productMimeType } = await fileToBase64(productImage.file);
            
            let referencePayload: { base64: string; mimeType: string; } | undefined = undefined;
            if (referenceImage) {
                const { base64: refBase64, mimeType: refMimeType } = await fileToBase64(referenceImage.file);
                referencePayload = { base64: refBase64, mimeType: refMimeType };
            }
            
            const results = await generateProductScene(productBase64, productMimeType, prompt, aspectRatio, selectedStyle, referencePayload);
            
            if (statusInterval) clearInterval(statusInterval);
            setProcessingStatus("Finalizing results...");
            setGeneratedImages(results);

        } catch (e) {
            if (statusInterval) clearInterval(statusInterval);
            // FIX: Gracefully handle errors from the API or file processing by checking if 'e' is an Error instance before accessing 'e.message'.
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
            setProcessingStatus('');
        }
    };

    const handleDownloadAll = () => {
        generatedImages.forEach(image => {
            const link = document.createElement('a');
            link.href = image.src;
            link.download = image.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };
    
    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
            {isLoading && <ProcessingIndicator status={processingStatus} title={`Generating ${selectedStyle} Variations...`} />}
            <ImageModal image={modalImage} onClose={() => setModalImage(null)} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Controls */}
                <div className="flex flex-col space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">1. Upload Product</h2>
                     <div 
                        className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-700 transition-all duration-300"
                        onClick={() => productFileInputRef.current?.click()}
                    >
                        <input type="file" ref={productFileInputRef} onChange={handleProductFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        {productImage?.preview ? (
                            <img src={productImage.preview} alt="Product" className="max-h-40 mx-auto rounded-md" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <UploadIcon className="w-12 h-12 mb-2" />
                                <p className="font-semibold">Click to upload product image</p>
                                <p className="text-sm">PNG, JPG, or WEBP</p>
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3 pt-2">2. Upload Reference (Optional)</h2>
                    <div 
                        className="relative border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-700 transition-all duration-300"
                        onClick={() => referenceFileInputRef.current?.click()}
                    >
                        <input type="file" ref={referenceFileInputRef} onChange={handleReferenceFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        {referenceImage?.preview ? (
                            <>
                                <img src={referenceImage.preview} alt="Reference" className="max-h-32 mx-auto rounded-md" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setReferenceImage(null); if(referenceFileInputRef.current) referenceFileInputRef.current.value = ''; }}
                                    className="absolute top-2 right-2 bg-gray-900/50 rounded-full p-1 text-white hover:bg-red-500/80 transition-colors"
                                    aria-label="Remove reference image"
                                >
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400 py-4">
                                <UploadIcon className="w-10 h-10 mb-2" />
                                <p className="font-semibold">Click to add reference style</p>
                                <p className="text-sm">e.g., for lighting, color, mood</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-2">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                           <h2 className="text-xl font-semibold text-white">3. Describe The Scene</h2>
                           <button 
                                onClick={handleGenerateAIPrompt} 
                                disabled={!productImage || isLoading || isGeneratingPrompt}
                                className="flex items-center gap-2 text-sm bg-gray-700 text-indigo-300 font-semibold py-1 px-3 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-600/50 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                <WandIcon className="w-4 h-4" />
                                {isGeneratingPrompt ? 'Generating...' : 'Generate with AI'}
                           </button>
                        </div>
                        {isGeneratingPrompt && <p className="text-indigo-300 text-sm mt-2 text-center animate-pulse">{aiPromptStatus}</p>}
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Write your own prompt or generate one with AI."
                            className="w-full bg-gray-900 rounded-lg p-3 text-white placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors mt-4"
                            rows={3}
                            disabled={isGeneratingPrompt}
                        />
                    </div>

                    <div className="pt-2">
                        <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">4. Select Design Style</h2>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {(Object.values(DesignStyle) as DesignStyle[]).map((style) => {
                                const isSelected = selectedStyle === style;
                                const labels: Record<DesignStyle, string> = {
                                    [DesignStyle.Realistic]: "Realistic (واقعي)",
                                    [DesignStyle.Professional]: "Professional (احترافي)",
                                    [DesignStyle.Cinematic]: "Cinematic (سينمائي)",
                                    [DesignStyle.Creative]: "Creative (خيالي)",
                                    [DesignStyle.Commercial]: "Commercial (تجاري)",
                                };
                                return (
                                    <button
                                        key={style}
                                        onClick={() => handleStyleSelect(style)}
                                        className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg border-2 transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-indigo-500 hover:bg-gray-700/80'
                                        }`}
                                    >
                                        <span className="font-semibold text-sm text-center">{labels[style]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                     <div className="pt-2">
                        <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">5. Select Aspect Ratio</h2>
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {(Object.keys(AspectRatio) as Array<keyof typeof AspectRatio>).map((key) => {
                                const value = AspectRatio[key];
                                const labels: Record<AspectRatio, string> = {
                                    [AspectRatio.Square]: "Square (مربع)",
                                    [AspectRatio.Portrait]: "Portrait (طولي)",
                                    [AspectRatio.Landscape]: "Landscape (عرض)",
                                };
                                const icons: Record<AspectRatio, React.ReactNode> = {
                                    [AspectRatio.Square]: <AspectSquareIcon className="w-8 h-8 mb-1" />,
                                    [AspectRatio.Portrait]: <AspectPortraitIcon className="w-8 h-8 mb-1" />,
                                    [AspectRatio.Landscape]: <AspectLandscapeIcon className="w-8 h-8 mb-1" />,
                                };
                                return (
                                    <button
                                        key={value}
                                        onClick={() => setAspectRatio(value)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 aspect-square ${
                                            aspectRatio === value
                                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-indigo-500 hover:bg-gray-700/80'
                                        }`}
                                    >
                                        {icons[value]}
                                        <span className="font-semibold text-sm text-center">{labels[value]}</span>
                                        <span className="text-xs text-gray-400">{value}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3 pt-2">6. Generate Scene</h2>
                    <button onClick={handleGenerate} disabled={!productImage || !prompt || isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-lg gap-2">
                        <SparklesIcon className="w-6 h-6" /> {isLoading ? 'Generating...' : 'Generate 4 Variations'}
                    </button>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                </div>

                {/* Right Column: Preview */}
                <div className="flex flex-col space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">ElKady Product Viewer</h2>
                    {generatedImages.length > 0 ? (
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {generatedImages.map((image, index) => (
                                    <div key={index} className="group relative rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all" onClick={() => setModalImage(image)}>
                                        <img 
                                            src={image.src} 
                                            alt={image.label} 
                                            className="w-full aspect-square object-cover cursor-pointer"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                             <p className="text-white text-lg font-bold drop-shadow-lg">View</p>
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                            <a href={image.src} download={image.filename} className="bg-gray-900/70 text-white rounded-full p-2 hover:bg-indigo-600" aria-label={`Download ${image.label} image`}>
                                                <DownloadIcon className="w-5 h-5" />
                                            </a>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6">
                                            <p className="text-white font-semibold text-center truncate">{image.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button onClick={handleDownloadAll} className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-center">
                                    <DownloadIcon className="w-5 h-5" /> Download All ({generatedImages.length})
                                </button>
                                <button onClick={handleGenerate} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center gap-2">
                                    <RegenerateIcon className="w-5 h-5" /> Regenerate All
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-700 rounded-lg text-gray-500">
                            <p>Generated scenes will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ===================================================================================
// MODULE 2: Same-Image Multi-Angle Generation (Original App)
// ===================================================================================
const MultiAngleGenerator: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [processingStatus, setProcessingStatus] = useState<string>('');
    const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setOriginalImage(file);
            setGeneratedImages([]);
            setError(null);
            const reader = new FileReader();
            reader.onloadend = () => setOriginalImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setError('Please select a valid image file.');
            setOriginalImage(null);
            setOriginalImagePreview(null);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!originalImage) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        try {
            const { base64, mimeType } = await fileToBase64(originalImage);
            const newImages: GeneratedImage[] = [];
            const angles: Angle[] = [Angle.Top, Angle.Bottom, Angle.Low];
            for (let i = 0; i < angles.length; i++) {
                setProcessingStatus(multiAngleProcessingSteps[i+2]);
                const angle = angles[i];
                const generatedBase64 = await generateAngleImage(base64, mimeType, angle);
                const filenameMap: Record<Angle, string> = {
                    [Angle.Top]: 'top_view.png',
                    [Angle.Bottom]: 'bottom_view.png',
                    [Angle.Low]: 'low_angle.png',
                };
                newImages.push({
                    src: `data:image/png;base64,${generatedBase64}`,
                    label: angle,
                    filename: filenameMap[angle],
                });
            }
             setProcessingStatus(multiAngleProcessingSteps[5]);
             setGeneratedImages(newImages);
        } catch (e) {
            // FIX: Gracefully handle errors from the API or file processing by checking if 'e' is an Error instance before accessing 'e.message'.
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
            setProcessingStatus('');
        }
    }, [originalImage]);
    
    const handleDownloadAll = () => {
        generatedImages.forEach(image => {
            const link = document.createElement('a');
            link.href = image.src;
            link.download = image.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };
    
    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
            {isLoading && <ProcessingIndicator status={processingStatus} title="Generating new camera angles…"/>}
            <ImageModal image={modalImage} onClose={() => setModalImage(null)} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="flex flex-col space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">1. Upload Product Photo</h2>
                    <div 
                        className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-700 transition-all duration-300"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        {originalImagePreview ? (
                            <img src={originalImagePreview} alt="Original product" className="max-h-64 mx-auto rounded-md" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <UploadIcon className="w-12 h-12 mb-2" />
                                <p className="font-semibold">Click to upload</p><p className="text-sm">PNG, JPG, or WEBP</p>
                            </div>
                        )}
                    </div>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3 pt-4">2. Generate Angles</h2>
                    <button onClick={handleGenerate} disabled={!originalImage || isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-lg">
                        {isLoading ? 'Generating...' : 'Generate New Angles'}
                    </button>
                </div>
                <div className="flex flex-col space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">Nouh ElKady Preview Panel</h2>
                    {generatedImages.length > 0 ? (
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {generatedImages.map((image, index) => (
                                    <div key={index} className="group relative" onClick={() => setModalImage(image)}>
                                        <img src={image.src} alt={image.label} className="w-full aspect-square object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white font-bold">{image.label}</p>
                                        </div>
                                        <p className="text-center text-sm mt-2 text-gray-300">{image.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button onClick={handleDownloadAll} className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                                    <DownloadIcon className="w-5 h-5" /> Download All
                                </button>
                                <button onClick={handleGenerate} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center gap-2">
                                    <RegenerateIcon className="w-5 h-5" /> Regenerate Angles
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-700 rounded-lg text-gray-500">
                            <p>Generated images will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ===================================================================================
// MODULE 3: ElKady Upscale
// ===================================================================================
const ElKadyUpscale: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<{file: File, preview: string} | null>(null);
    const [upscaledImage, setUpscaledImage] = useState<GeneratedImage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setError(null);
            setUpscaledImage(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage({ file, preview: reader.result as string });
            };
            reader.readAsDataURL(file);
        } else {
            setError('Please select a valid image file.');
            setOriginalImage(null);
        }
    };
    
    const handleUpscale = async () => {
        if (!originalImage) return;
        setIsLoading(true);
        setError(null);
        setUpscaledImage(null);

        try {
            setProcessingStatus(upscaleProcessingSteps[0]);
            const { base64, mimeType } = await fileToBase64(originalImage.file);
            setProcessingStatus(upscaleProcessingSteps[1]);
            const upscaledBase64 = await upscaleImage(base64, mimeType);
            
            setProcessingStatus(upscaleProcessingSteps[2]);
            setUpscaledImage({
                src: `data:image/png;base64,${upscaledBase64}`,
                label: "Upscaled Image",
                filename: "upscaled_2k_image.png"
            });
        } catch(e) {
            // FIX: Gracefully handle errors from the API or file processing by checking if 'e' is an Error instance before accessing 'e.message'.
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
            setProcessingStatus('');
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
            {isLoading && <ProcessingIndicator status={processingStatus} title="Upscaling to 2K resolution..." />}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 {/* Before/After Columns */}
                 <div className="flex flex-col space-y-4">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">Before</h2>
                    <div 
                        className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-700 transition-all duration-300 min-h-[300px] flex flex-col justify-center items-center"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        {originalImage?.preview ? (
                            <img src={originalImage.preview} alt="Original to upscale" className="max-h-96 mx-auto rounded-md" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <UploadIcon className="w-12 h-12 mb-2" />
                                <p className="font-semibold">Click to upload image</p>
                                <p className="text-sm">PNG, JPG, or WEBP</p>
                            </div>
                        )}
                    </div>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <button onClick={handleUpscale} disabled={!originalImage || isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-lg">
                        {isLoading ? 'Upscaling...' : 'Upscale to 2K'}
                    </button>
                 </div>
                 <div className="flex flex-col space-y-4">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">ElKady Upscale Viewer (After)</h2>
                    {upscaledImage ? (
                         <div className="bg-gray-900/50 p-4 rounded-lg">
                            <img src={upscaledImage.src} alt="Upscaled result" className="w-full object-cover rounded-lg" />
                             <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <a href={upscaledImage.src} download={upscaledImage.filename} className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-center">
                                    <DownloadIcon className="w-5 h-5" /> Download Upscaled
                                </a>
                                <button onClick={handleUpscale} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center gap-2">
                                    <RegenerateIcon className="w-5 h-5" /> Regenerate
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="flex items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-700 rounded-lg text-gray-500">
                            <p>Upscaled image will appear here</p>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

// ===================================================================================
// MODULE 4: ElKady Brand Designer
// ===================================================================================
const ElKadyBrandDesigner: React.FC = () => {
    const [logoImage, setLogoImage] = useState<{file: File, preview: string} | null>(null);
    const [generatedItems, setGeneratedItems] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [modalImage, setModalImage] = useState<GeneratedImage | null>(null);
    const [selectedAssets, setSelectedAssets] = useState<Set<BrandingAsset>>(() => new Set(brandingAssetsList));
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setError(null);
            setGeneratedItems([]);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoImage({ file, preview: reader.result as string });
            };
            reader.readAsDataURL(file);
        } else {
            setError('Please select a valid logo image file (PNG, JPG, WEBP).');
            setLogoImage(null);
        }
    };

    const toggleAssetSelection = (asset: BrandingAsset) => {
        setSelectedAssets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(asset)) {
                newSet.delete(asset);
            } else {
                newSet.add(asset);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => setSelectedAssets(new Set(brandingAssetsList));
    const handleDeselectAll = () => setSelectedAssets(new Set());

    const handleGenerate = async () => {
        if (!logoImage) {
            setError("Please upload your logo first.");
            return;
        }
        if (selectedAssets.size === 0) {
            setError("Please select at least one branding asset to generate.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedItems([]);

        try {
            const { base64, mimeType } = await fileToBase64(logoImage.file);
            const newItems: GeneratedImage[] = [];
            const assetsToGenerate = Array.from(selectedAssets);
            const totalAssets = assetsToGenerate.length;

            for (let i = 0; i < totalAssets; i++) {
                const assetName = assetsToGenerate[i];
                setProcessingStatus(`Generating ${assetName} (${i + 1}/${totalAssets})...`);
                
                const generatedBase64 = await generateBrandingAsset(base64, mimeType, assetName);
                
                newItems.push({
                    src: `data:image/png;base64,${generatedBase64}`,
                    label: assetName,
                    filename: `${assetName.toLowerCase().replace(/[\s/()&]/g, '_')}.png`
                });
                setGeneratedItems([...newItems]); // Update state iteratively to show results as they come
            }

        } catch (e) {
            // FIX: Gracefully handle errors from the API or file processing by checking if 'e' is an Error instance before accessing 'e.message'. This addresses the reported TypeScript errors.
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred during generation.');
            }
        } finally {
            setIsLoading(false);
            setProcessingStatus('');
        }
    };
    
    const handleDownloadAll = () => {
        generatedItems.forEach(image => {
            const link = document.createElement('a');
            link.href = image.src;
            link.download = image.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
            {isLoading && <ProcessingIndicator status={processingStatus} title="Building Your Brand Identity..." />}
            <ImageModal image={modalImage} onClose={() => setModalImage(null)} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Controls */}
                <div className="flex flex-col space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">1. Upload Your Logo</h2>
                    <div 
                        className="relative border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-gray-700 transition-all duration-300"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                        {logoImage?.preview ? (
                            <img src={logoImage.preview} alt="Uploaded Logo" className="max-h-48 mx-auto" style={{ objectFit: 'contain' }} />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <UploadIcon className="w-12 h-12 mb-2" />
                                <p className="font-semibold">Click to upload logo</p>
                                <p className="text-sm">PNG, JPG, or WEBP (transparent background recommended)</p>
                            </div>
                        )}
                    </div>
                    
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3 pt-2">2. Select Assets to Generate</h2>
                    <div className="flex justify-end gap-4 -mb-2">
                        <button onClick={handleSelectAll} className="text-sm font-semibold text-indigo-300 hover:text-indigo-200 transition-colors">Select All</button>
                        <button onClick={handleDeselectAll} className="text-sm font-semibold text-gray-400 hover:text-gray-300 transition-colors">Deselect All</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {brandingAssetsList.map(asset => {
                            const isSelected = selectedAssets.has(asset);
                            return (
                                <button
                                    key={asset}
                                    onClick={() => toggleAssetSelection(asset)}
                                    className={`text-center py-3 px-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                                        isSelected
                                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-indigo-500'
                                    }`}
                                >
                                    {asset}
                                </button>
                            );
                        })}
                    </div>


                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3 pt-2">3. Generate Identity</h2>
                    <button onClick={handleGenerate} disabled={!logoImage || isLoading || selectedAssets.size === 0} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-lg gap-2">
                        <SparklesIcon className="w-6 h-6" />
                        {isLoading ? 'Generating...' : `Generate ${selectedAssets.size} Selected Item${selectedAssets.size === 1 ? '' : 's'}`}
                    </button>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                </div>

                {/* Right Column: Preview */}
                <div className="flex flex-col space-y-6">
                    <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-3">ElKady Brand Identity Viewer</h2>
                    {generatedItems.length > 0 ? (
                        <div className="bg-gray-900/50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {generatedItems.map((item, index) => (
                                    <div key={index} className="group relative rounded-lg overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all cursor-pointer" onClick={() => setModalImage(item)}>
                                        <img 
                                            src={item.src} 
                                            alt={item.label} 
                                            className="w-full aspect-square object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                             <p className="text-white text-center font-bold drop-shadow-lg">{item.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button onClick={handleDownloadAll} className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-center">
                                    <DownloadIcon className="w-5 h-5" /> Download All ({generatedItems.length})
                                </button>
                                <button onClick={handleGenerate} className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center gap-2">
                                    <RegenerateIcon className="w-5 h-5" /> Regenerate
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-700 rounded-lg text-gray-500">
                            <p>Generated brand assets will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const Footer: React.FC = () => {
    const whatsappLink = "https://wa.me/201140278609";
    const instagramLink = "https://www.instagram.com/nouh_elkady/";
    const facebookLink = "https://www.facebook.com/nouhabdelmanamelkady";
    const tiktokLink = "https://www.tiktok.com/@nouhelkady";
    const patreonLink = "https://patreon.com/NouhElKady?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink";


    return (
        <footer className="mt-12 text-center text-gray-400 border-t border-gray-700 pt-8 pb-4">
            <div className="flex justify-center items-center space-x-6 sm:space-x-8">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-[#25D366] transform hover:scale-110 transition-transform duration-300">
                    <WhatsAppIcon className="w-8 h-8" />
                </a>
                <a href={instagramLink} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#E4405F] transform hover:scale-110 transition-transform duration-300">
                    <InstagramIcon className="w-8 h-8" />
                </a>
                <a href={facebookLink} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#1877F2] transform hover:scale-110 transition-transform duration-300">
                    <FacebookIcon className="w-8 h-8" />
                </a>
                <a href={tiktokLink} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white transform hover:scale-110 transition-transform duration-300">
                    <TikTokIcon className="w-8 h-8" />
                </a>
                 <a href={patreonLink} target="_blank" rel="noopener noreferrer" aria-label="Patreon" className="text-[#FF424D] transform hover:scale-110 transition-transform duration-300">
                    <PatreonIcon className="w-7 h-7" />
                </a>
            </div>
            <p className="mt-6 leading-relaxed">
                استخدم هذه الأداة لإنشاء مشاهد واقعية لمنتجاتك. يمكنك كتابة وصف المشهد بنفسك، أو دع الذكاء الاصطناعي يقترح عليك أفضل الأفكار.
                <br />
                متابعتك تسعدني وتدعمني! للدعم أو الاستفسار، تواصل معي عبر واتساب.
            </p>
        </footer>
    );
};

// ===================================================================================
// MAIN APP SHELL
// This component manages navigation between the three modules.
// ===================================================================================

enum Module {
    Products = 'ElKady Products',
    BrandDesigner = 'ElKady Brand Designer',
    MultiAngle = 'Same-Image Multi-Angle',
    Upscale = 'ElKady Upscale'
}

const moduleDescriptions: Record<Module, string> = {
    [Module.Products]: "Generate photo-realistic lifestyle or studio scenes for your product.",
    [Module.BrandDesigner]: "Generate a complete, professional brand identity from just your logo.",
    [Module.MultiAngle]: "Generate top, bottom, and low-angle views while preserving the background.",
    [Module.Upscale]: "Enhance and upscale any image to 2K resolution while preserving details."
}

export default function App() {
    const [activeModule, setActiveModule] = useState<Module>(Module.Products);

    const renderModule = () => {
        switch (activeModule) {
            case Module.Products: return <ElKadyProducts />;
            case Module.BrandDesigner: return <ElKadyBrandDesigner />;
            case Module.MultiAngle: return <MultiAngleGenerator />;
            case Module.Upscale: return <ElKadyUpscale />;
            default: return <ElKadyProducts />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
                        🧠 Nouh ElKady — AI Imaging Suite
                    </h1>
                    <p className="text-lg text-gray-400 mt-1">{moduleDescriptions[activeModule]}</p>
                </header>

                <nav className="flex justify-center mb-8 bg-gray-800 p-2 rounded-xl shadow-lg">
                    <div className="flex flex-wrap justify-center space-x-2 bg-gray-900 p-1 rounded-lg">
                        {Object.values(Module).map(module => (
                            <button
                                key={module}
                                onClick={() => setActiveModule(module)}
                                className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-md transition-colors duration-300 my-1 ${
                                    activeModule === module 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                {module}
                            </button>
                        ))}
                    </div>
                </nav>

                <main>
                    {renderModule()}
                </main>

                <Footer />
            </div>
        </div>
    );
}