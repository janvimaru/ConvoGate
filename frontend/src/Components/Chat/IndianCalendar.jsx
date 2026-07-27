import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, X, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { fetchIndianFestivals, generateFestivalGreetings } from '../../Utils/geminiApi';

const IndianCalendar = ({ onClose, onSelectGreeting, onGenerate, isOpen }) => {
    // Default to current local date
    const [viewDate, setViewDate] = useState(new Date());
    const [festivals, setFestivals] = useState({});
    const [selectedFestival, setSelectedFestival] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFestivals, setIsLoadingFestivals] = useState(false);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth(); // 0-indexed

    // Always reset to current date when opened
    useEffect(() => {
        if (isOpen) {
            setViewDate(new Date());
            setSelectedFestival(null);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        setSelectedFestival(null); // Clear selected date when month changes

        const loadFestivals = async () => {
            setIsLoadingFestivals(true);
            const monthName = viewDate.toLocaleString('default', { month: 'long' });
            
            // Fetch from Gemini / Groq API
            const apiFestivals = await fetchIndianFestivals(year, monthName);
            
            if (apiFestivals && Object.keys(apiFestivals).length > 0) {
                setFestivals(levelFestivals(apiFestivals));
            } else {
                setFestivals({});
            }
            setIsLoadingFestivals(false);
        };

        loadFestivals();
    }, [isOpen, viewDate]);

    // Simple normalization helper
    const levelFestivals = (data) => {
        const normalized = {};
        Object.entries(data).forEach(([key, val]) => {
            normalized[key] = { ...val, id: key };
        });
        return normalized;
    };

    const formatDateKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Dynamic Calendar Grid Calculation
    const calendarGrid = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Pad start
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        // Fill days
        for (let d = 1; d <= daysInMonth; d++) days.push(d);

        return days;
    }, [year, month]);

    const handleDateClick = (day) => {
        if (!day) return;
        const dateKey = formatDateKey(year, month, day);

        if (festivals[dateKey]) {
            setSelectedFestival({
                ...festivals[dateKey],
                date: dateKey,
                day: day
            });
        } else {
            setSelectedFestival({
                name: "No Festival",
                day: day,
                date: dateKey,
                isEmpty: true
            });
        }
    };

    const handleGenerateGreetings = async () => {
        if (!selectedFestival || selectedFestival.isEmpty) return;
        setIsLoading(true);
        try {
            // Call API to generate dynamic AI greetings (leveraging your Groq API)
            const generatedGreetings = await generateFestivalGreetings(
                selectedFestival.name, 
                selectedFestival.date, 
                "Happy"
            );

            if (generatedGreetings && generatedGreetings.length > 0) {
                if (onGenerate) {
                    onGenerate(generatedGreetings);
                    onClose();
                }
            } else {
                // Fallback local greeting if API is empty
                const defaultMessage = selectedFestival.message || `Wishing you a very Happy ${selectedFestival.name}!\nMay this occasion bring you joy and prosperity.`;
                const emoji = selectedFestival.emoji || "✨";
                if (onGenerate) {
                    onGenerate([`${emoji} ${defaultMessage}`]);
                    onClose();
                }
            }
        } catch (error) {
            console.error('Failed to generate greetings via API, falling back:', error);
            // Fallback default greeting
            const defaultMessage = selectedFestival.message || `Wishing you a very Happy ${selectedFestival.name}!\nMay this occasion bring you joy and prosperity.`;
            const emoji = selectedFestival.emoji || "✨";
            if (onGenerate) {
                onGenerate([`${emoji} ${defaultMessage}`]);
                onClose();
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Dynamic Style Helper (Light Theme version)
    const getDateStyles = (d, isSelected, hasFestival) => {
        if (!d) return { className: "invisible w-10 h-10", style: {} };

        const dateKey = formatDateKey(year, month, d);
        const festival = festivals[dateKey];
        
        const today = new Date();
        const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;

        let baseClass = "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative ";
        let dynamicStyle = {};

        if (hasFestival) {
            // Use festival color with translucent shadow
            if (festival?.color) {
                dynamicStyle = {
                    backgroundColor: festival.color,
                    boxShadow: `0 10px 15px -3px ${festival.color}33`,
                    color: 'white'
                };
            } else {
                // Universal Fallback Gradient
                baseClass += "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 ";
            }
        } else if (isToday && !isSelected) {
            baseClass += "border-2 border-orange-500 text-orange-600 bg-orange-50/50 ";
        } else {
            baseClass += isSelected ? "bg-slate-800 text-white " : "text-slate-600 hover:bg-slate-100 ";
        }

        if (isSelected) {
            baseClass += "ring-2 ring-orange-500 ring-offset-2 ring-offset-white shadow-orange-500/20 ";
        }

        return { className: baseClass.trim(), style: dynamicStyle };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 left-8 w-[400px] bg-white backdrop-blur-2xl border border-slate-200/80 rounded-[28px] shadow-3xl z-[100] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 p-4 flex items-center justify-between text-white shadow-lg">
                <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5" />
                    <h3 className="font-bold text-sm tracking-wide">Indian Festival Calendar</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Calendar Grid Section */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-6 px-1">
                    <button
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}
                        className="text-slate-400 hover:text-slate-800 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-slate-800 font-bold text-sm flex items-center gap-2">
                        {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        {isLoadingFestivals && <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />}
                    </span>
                    <button
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}
                        className="text-slate-400 hover:text-slate-800 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx} className="text-slate-400 font-bold text-[10px] text-center uppercase tracking-tighter">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-3 gap-x-2">
                    {calendarGrid.map((d, i) => {
                        const hasFestival = d && festivals[formatDateKey(year, month, d)];
                        const isSelected = selectedFestival?.day === d && selectedFestival?.date.startsWith(formatDateKey(year, month, d).substring(0, 7));
                        const { className, style } = getDateStyles(d, isSelected, hasFestival);

                        return (
                            <div key={i} className="flex flex-col items-center">
                                <button
                                    onClick={() => handleDateClick(d)}
                                    className={className}
                                    style={style}
                                >
                                    {d}
                                    {hasFestival && (
                                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full shadow-sm z-10" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selection Area (Light Theme) */}
            <div className="flex-1 min-h-[140px] border-t border-slate-100 p-5 bg-slate-50/50 flex flex-col gap-4">
                {!selectedFestival ? (
                    <div className="flex items-center justify-center h-full opacity-60">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center">Select a date to view details</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-100 rounded-[20px] p-4 flex items-center justify-between shadow-lg animate-in zoom-in-95 duration-200 relative overflow-hidden group hover:border-orange-500/40 transition-all">
                        {/* Left Strip Gradient */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-rose-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                        <div className="flex items-center gap-4 pl-2">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                                {selectedFestival.isEmpty ? (
                                    <CalendarIcon className="w-6 h-6 text-slate-400" />
                                ) : (
                                    <span className="text-2xl">{selectedFestival.emoji || "🎉"}</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <h4 className="text-slate-800 font-bold text-sm tracking-tight leading-tight">{selectedFestival.name}</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{selectedFestival.day} {viewDate.toLocaleString('default', { month: 'long' })}</p>
                            </div>
                        </div>

                        {!selectedFestival.isEmpty && (
                            <button
                                onClick={handleGenerateGreetings}
                                disabled={isLoading}
                                className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl shadow-pink-500/20 hover:scale-[1.05] active:scale-95 transition-all"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Generate
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Global Loader Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[110] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-slate-100">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    </div>
                    <p className="text-slate-800 text-[11px] font-black uppercase tracking-[0.25em] drop-shadow-lg">Generating...</p>
                </div>
            )}
        </div>
    );
};

export default IndianCalendar;