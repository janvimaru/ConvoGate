import React from 'react';

// Shared component for rendering Festival Cards
// Used in MessageBubble (Chat)

const FestivalCard = ({ card, onClick, className = "" }) => {
    if (!card) return null;

    // Handle both "start_style" (from API) and "style" (normalized)
    const style = card.start_style || card.style;

    // Simple hash function for deterministic seeds based on content
    const getHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    };

    // Construct dynamic image URL based on card tags/prompt
    // Uses real-time image generation
    const getBackgroundImage = () => {
        // Handle BACKWARD COMPATIBILITY for stale server data
        // Check card.image_tags (new) OR card.image.value (old)
        const tags = card.image_tags || (card.image && card.image.value);

        // Use provided image tags or fallback to title
        const promptBase = tags && tags.length > 0
            ? tags.join(" ")
            : `${card.title} festival background`;

        // Refine prompt based on style for better results
        let styleModifier = "";
        if (style === "Traditional") styleModifier = "traditional art, mandala patterns, warm colors, detailed, intricate";
        else if (style === "Modern") styleModifier = "minimalist, vector art, flat design, vibrant gradients, clean";
        else if (style === "Premium") styleModifier = "luxury, gold textures, dark background, elegant, cinematic lighting";

        const fullPrompt = encodeURIComponent(`${promptBase}, ${styleModifier}, high quality, wallpaper, no text`);

        // Deterministic seed ensures same image in Generator and Chat
        // Uses title + greeting length to create a unique but stable seed
        const seedContent = card.title + (card.greeting || "").length + style;
        const seed = getHash(seedContent);

        // Return URL (cached by browser automatically)
        return `https://image.pollinations.ai/prompt/${fullPrompt}?width=400&height=500&nologo=true&seed=${seed}`;
    };

    const bgImage = getBackgroundImage();

    return (
        <div
            className={`relative rounded-xl overflow-hidden shadow-lg group border border-white/20 dark:border-white/10 bg-slate-900 aspect-[3/4] w-full ${className}`}
            onClick={(e) => {
                // Pass image URL to click handler (for full screen view)
                if (onClick) onClick(bgImage);
            }}
        >
            {/* Generated Background Image using IMG tag for reliability */}
            <img
                src={bgImage}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                    // Fallback if image fails
                    e.currentTarget.onerror = null; // prevent loop
                    e.currentTarget.src = "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=1000";
                }}
            />

            {/* Gradient Overlay for Text Readability */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: style === 'Modern'
                        ? `linear-gradient(to top, ${card.colors?.primary || '#000'}99, transparent 60%)`
                        : `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)`
                }}
            />

            {/* Text Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end items-center text-center z-10">
                <h3
                    className="text-xl font-bold mb-1 drop-shadow-lg text-white"
                    style={{ fontFamily: style === 'Traditional' ? 'serif' : 'sans-serif' }}
                >
                    {card.title}
                </h3>

                <div className="w-8 h-0.5 bg-white/60 rounded-full mb-2"></div>

                <p className="text-white/95 text-[11px] font-medium leading-relaxed drop-shadow-md whitespace-pre-wrap">
                    "{card.greeting}"
                </p>

                {card.festival_thought && (
                    <p className="mt-2 text-[9px] text-white/70 font-medium tracking-wider uppercase opacity-80">
                        {card.festival_thought}
                    </p>
                )}
            </div>

            {/* Badge */}
            <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-md text-white text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-white/10 z-20">
                {style}
            </div>
        </div>
    );
};

export default FestivalCard;
