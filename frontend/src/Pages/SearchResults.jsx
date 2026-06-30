import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { globalSearchAPI } from '../Utils/api';
import { API_BASE } from '../Utils/constants';
import { Search, User, MessageSquare, Hash, ArrowLeft, Loader2 } from 'lucide-react';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('q') || '';

    const [results, setResults] = useState({ users: [], rooms: [], messages: [] });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(query);

    useEffect(() => {
        setSearchInput(query);
        if (!query) return;

        const fetchResults = async () => {
            setLoading(true);
            setErrors({});
            try {
                const res = await globalSearchAPI(query);

                if (res.data.success) {
                    setResults({
                        users: res.data.users || [],
                        rooms: res.data.rooms || [],
                        messages: res.data.messages || []
                    });

                    const partialErrors = {};
                    if (res.data.error_users) partialErrors.users = res.data.error_users;
                    if (res.data.error_rooms) partialErrors.rooms = res.data.error_rooms;
                    if (res.data.error_messages) partialErrors.messages = res.data.error_messages;
                    setErrors(partialErrors);
                } else {
                    setErrors({ fatal: res.data.error || "Unknown search error" });
                }
            } catch (err) {
                console.error("Search request failed", err);
                const errorMessage = err.response?.data?.error || "Connection error — check if backend is running";
                setErrors({ fatal: errorMessage });
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const handleSearch = () => {
        if (searchInput.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    const totalResults = results.users.length + results.rooms.length + results.messages.length;

    return (
        <div className="p-6 bg-[var(--bg-secondary)] min-h-full">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
                    </button>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Search Results</h1>
                </div>
            </div>

            {/* Status line */}
            {query && !loading && (
                <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-4xl mx-auto">
                    {totalResults > 0
                        ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`
                        : `No results for "${query}"`}
                </p>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mb-3" />
                    <p className="text-[var(--text-secondary)]">Searching for "{query}"...</p>
                </div>
            )}

            {/* Fatal Error */}
            {!loading && errors.fatal && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
                    <h3 className="text-red-500 font-semibold mb-2">Search Failed</h3>
                    <p className="text-[var(--text-secondary)]">{errors.fatal}</p>
                    {errors.fatal.includes("Authorization") && (
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                            Log In Again
                        </button>
                    )}
                </div>
            )}

            {/* Partial errors */}
            {!loading && Object.keys(errors).length > 0 && !errors.fatal && (
                <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 mb-6 max-w-4xl mx-auto text-sm text-amber-500">
                    <p className="font-semibold mb-1">Some results may be missing:</p>
                    <ul className="list-disc list-inside">
                        {Object.entries(errors).map(([key, msg]) => (
                            <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {msg}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* No results */}
            {!loading && !errors.fatal && query && totalResults === 0 && (
                <div className="text-center py-20 max-w-4xl mx-auto">
                    <Search className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">No results found</h3>
                    <p className="text-[var(--text-secondary)]">Try different keywords or check your spelling</p>
                </div>
            )}

            {/* Empty state (no query) */}
            {!loading && !query && (
                <div className="text-center py-20 max-w-4xl mx-auto">
                    <Search className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">Search ConvoGate</h3>
                    <p className="text-[var(--text-secondary)]">Find people, rooms, and messages</p>
                </div>
            )}

            {/* Results */}
            {!loading && !errors.fatal && (
                <div className="space-y-8 max-w-4xl mx-auto">

                    {/* USERS */}
                    {results.users.length > 0 && (
                        <section>
                            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-[var(--primary)]" />
                                People ({results.users.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {results.users.map(user => (
                                    <div
                                        key={user.id}
                                        className="p-4 bg-[var(--surface-light)] rounded-xl border border-[var(--border-light)] flex items-center gap-3 hover:border-[var(--primary)] hover:shadow-sm transition-all cursor-pointer"
                                        onClick={() => navigate('/profile', { state: { userId: user.id } })}
                                    >
                                        {user.profile_pic ? (
                                            <img
                                                src={`${API_BASE}${user.profile_pic}`}
                                                alt={user.username}
                                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                                            style={{ display: user.profile_pic ? 'none' : 'flex' }}
                                        >
                                            {(user.full_name || user.username)?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-[var(--text-primary)] truncate">{user.full_name || user.username}</div>
                                            <div className="text-xs text-[var(--text-secondary)]">@{user.username}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ROOMS */}
                    {results.rooms.length > 0 && (
                        <section>
                            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <Hash className="w-4 h-4 text-emerald-500" />
                                Rooms ({results.rooms.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {results.rooms.map(room => (
                                    <div
                                        key={room.id}
                                        onClick={() => navigate(`/chat/${room.id}`)}
                                        className="p-4 bg-[var(--surface-light)] rounded-xl border border-[var(--border-light)] flex items-center gap-3 hover:border-[var(--primary)] hover:shadow-sm transition-all cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {room.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-[var(--text-primary)] truncate">{room.name}</div>
                                            <div className="text-xs text-[var(--text-secondary)]">{room.is_private ? '🔒 Private' : '🌐 Public'} Room</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* MESSAGES */}
                    {results.messages.length > 0 && (
                        <section>
                            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                Messages ({results.messages.length})
                            </h2>
                            <div className="space-y-2">
                                {results.messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        onClick={() => navigate(`/chat/${msg.room_id}`)}
                                        className="p-4 bg-[var(--surface-light)] rounded-xl border border-[var(--border-light)] hover:border-[var(--primary)] hover:shadow-sm transition-all cursor-pointer"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-[var(--text-primary)]">{msg.sender}</span>
                                                <span className="text-xs text-[var(--text-tertiary)]">in {msg.room_name}</span>
                                            </div>
                                            <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0">{msg.created_at}</span>
                                        </div>
                                        <p className="text-[var(--text-secondary)] text-sm line-clamp-2">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchResults;
