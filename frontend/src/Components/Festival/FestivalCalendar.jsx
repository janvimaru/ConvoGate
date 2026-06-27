import React, { useEffect, useState } from 'react';
import api from '../../Utils/api';
import { Calendar } from 'lucide-react';

const FestivalCalendar = () => {
    const [festivals, setFestivals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFestivals = async () => {
            console.log("FestivalCalendar: Fetching...");
            try {
                const res = await api.get('/api/festival/upcoming/');
                console.log("FestivalCalendar: Response", res.data);
                if (res.data.success) {
                    setFestivals(res.data.festivals);
                } else {
                    console.error("FestivalCalendar: Success false", res.data);
                }
            } catch (err) {
                console.error("FestivalCalendar: Failed to fetch festivals", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFestivals();
    }, []);

    if (loading) return (
        <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)] mb-8 animate-pulse text-white">
            Loading Calendar...
        </div>
    );

    if (festivals.length === 0) return (
        <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)] mb-8 text-[var(--text-secondary)]">
            No upcoming festivals found. (Debug: Check Console)
        </div>
    );

    return (
        <div className="bg-[var(--surface-light)] rounded-2xl p-6 border border-[var(--border-light)] mb-8">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Upcoming Festivals
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {festivals.map((fest) => (
                    <div
                        key={fest.festival_id}
                        className="p-4 rounded-xl border border-[var(--border-light)] hover:border-indigo-500/30 transition-all bg-[var(--bg-primary)] flex items-center gap-4"
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0"
                            style={{ backgroundColor: `${fest.theme_color}20` }}
                        >
                            {fest.calendar_icon ? (
                                <div className="text-center leading-tight">
                                    <div className="text-[10px] font-bold opacity-70">
                                        {new Date(fest.start_date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                                    </div>
                                    <div className="text-sm font-bold">
                                        {new Date(fest.start_date).getDate()}
                                    </div>
                                </div>
                            ) : (
                                <span>{fest.icon || '🎉'}</span>
                            )}
                        </div>

                        <div>
                            <h4 className="font-semibold text-[var(--text-primary)]">
                                {fest.name}
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)]">
                                {new Date(fest.start_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FestivalCalendar;
