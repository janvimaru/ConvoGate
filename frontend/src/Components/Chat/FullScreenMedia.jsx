import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

const FullScreenMedia = ({ media, onClose }) => {
    // Close on Escape key
    useEffect(() => {
        if (!media) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [media, onClose]);

    if (!media) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Toolbar */}
            <div
                className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-white/80 text-sm font-medium px-2">
                    {media.type === 'image' ? 'Image View' : 'Video Playback'}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={async () => {
                            try {
                                const response = await fetch(media.url);
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.style.display = 'none';
                                a.href = url;
                                // Extract filename from URL or use default
                                const filename = media.url.split('/').pop() || 'download';
                                a.download = filename;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);
                            } catch (error) {
                                console.error('Download failed:', error);
                                // Fallback to simple open
                                window.open(media.url, '_blank');
                            }
                        }}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Download"
                    >
                        <Download className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                className="w-full h-full p-4 flex items-center justify-center overflow-hidden"
                onClick={onClose}
            >
                {media.type === 'image' || (media.url && media.url.includes('image.pollinations.ai')) ? (
                    <img
                        src={media.url}
                        alt="Fullscreen view"
                        className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=1000";
                        }}
                    />
                ) : (
                    <video
                        src={media.url}
                        controls
                        autoPlay
                        className="max-w-full max-h-full shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={e => e.stopPropagation()}
                    />
                )}
            </div>
        </div>
    );
};

export default FullScreenMedia;
