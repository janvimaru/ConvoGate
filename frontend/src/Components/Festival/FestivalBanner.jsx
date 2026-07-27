import React from "react";
import { Sparkles, Calendar, Coins, X } from "lucide-react";

const FestivalBanner = ({ festival, isGroup, onOpenContributions, onClose }) => {
    if (!festival) return null;

    return (
        <div
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl text-white shadow-md mb-4 gap-3 animate-in fade-in duration-200"
            style={{
                backgroundColor: festival.theme_color || "var(--primary-color)",
            }}
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-white shrink-0">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold leading-tight">{festival.name} in progress!</h3>
                    <p className="text-[10px] opacity-80 mt-0.5">Celebrating together</p>
                </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {/* Indian Calendar Date */}
                {festival.calendar_icon && (
                    <div
                        title="Indian Calendar"
                        className="px-2.5 py-1 bg-white/10 rounded-lg flex items-center gap-1.5 text-[10px] font-semibold text-white cursor-pointer hover:bg-white/15 transition-colors"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {new Date(festival.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                )}

                {/* Contribution Tracker Button */}
                {isGroup && onOpenContributions && (
                    <button
                        onClick={onOpenContributions}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-lg flex items-center gap-1.5 text-[10px] font-semibold transition-colors shrink-0"
                    >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Contributions</span>
                    </button>
                )}

                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/15 rounded-lg text-white transition-colors shrink-0"
                    aria-label="Close Banner"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default FestivalBanner;
