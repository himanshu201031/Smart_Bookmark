'use client'

import { useState } from 'react'
import { supabase, Bookmark } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ExternalLink, Calendar, Loader2, Star, Globe, MoreVertical, Hash, Info } from 'lucide-react'

interface BookmarkListProps {
    bookmarks: Bookmark[]
    viewMode?: 'grid' | 'list'
}

export default function BookmarkList({ bookmarks, viewMode = 'grid' }: BookmarkListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [togglingFavId, setTogglingFavId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bookmark?')) return

        setDeletingId(id)
        try {
            const { error } = await supabase.from('bookmarks').delete().eq('id', id)
            if (error) throw error
        } catch (err) {
            console.error('Error deleting bookmark:', err)
        } finally {
            setDeletingId(null)
        }
    }

    const toggleFavorite = async (bookmark: Bookmark) => {
        setTogglingFavId(bookmark.id)
        try {
            const { error } = await supabase
                .from('bookmarks')
                .update({ is_favorite: !bookmark.is_favorite })
                .eq('id', bookmark.id)

            if (error) throw error
        } catch (err) {
            console.error('Error toggling favorite:', err)
        } finally {
            setTogglingFavId(null)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
        }).format(date)
    }

    return (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
            <AnimatePresence mode="popLayout">
                {bookmarks.map((bookmark, index) => (
                    <motion.div
                        key={bookmark.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`group relative overflow-hidden rounded-2xl bg-white/80 border border-black/5 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'flex flex-col p-6'
                            }`}
                    >
                        {/* Favorite Button Overlay */}
                        <button
                            onClick={() => toggleFavorite(bookmark)}
                            disabled={togglingFavId === bookmark.id}
                            className={`absolute top-4 right-4 z-10 rounded-full p-2 transition-all ${bookmark.is_favorite
                                    ? 'bg-black text-white opacity-100'
                                    : 'bg-white/50 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-black'
                                }`}
                        >
                            {togglingFavId === bookmark.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Star className={`h-4 w-4 ${bookmark.is_favorite ? 'fill-white' : ''}`} />
                            )}
                        </button>

                        {/* Icon/Favicon Area */}
                        <div className={`relative flex-shrink-0 grayscale ${viewMode === 'list' ? 'h-12 w-12' : 'mb-5 h-14 w-14'}`}>
                            <div className="absolute inset-0 rounded-2xl bg-black/5" />
                            <div className="flex h-full w-full items-center justify-center rounded-2xl ring-1 ring-black/5 overflow-hidden">
                                {bookmark.favicon_url ? (
                                    <img src={bookmark.favicon_url} alt="" className="h-8 w-8 object-contain opacity-50 group-hover:opacity-100 transition-opacity" onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                    }} />
                                ) : null}
                                <Globe className={`h-8 w-8 text-black ${bookmark.favicon_url ? 'hidden' : ''}`} />
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {bookmark.category && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black ring-1 ring-black/10">
                                        <Hash className="h-2.5 w-2.5" />
                                        {bookmark.category}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    <Calendar className="h-2.5 w-2.5" />
                                    {formatDate(bookmark.created_at)}
                                </span>
                            </div>

                            <h3 className="truncate text-lg font-bold text-gray-900 mb-1 group-hover:text-black transition-colors">
                                {bookmark.title}
                            </h3>

                            {viewMode === 'grid' && bookmark.description && (
                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                    {bookmark.description}
                                </p>
                            )}

                            <div className={`flex items-center gap-3 ${viewMode === 'list' ? 'mt-1' : 'mt-auto'}`}>
                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-lg bg-black/5 px-3 py-1.5 text-xs font-bold text-black transition-all hover:bg-black hover:text-white hover:gap-2"
                                >
                                    Visit
                                    <ExternalLink className="h-3 w-3" />
                                </a>

                                <button
                                    onClick={() => handleDelete(bookmark.id)}
                                    disabled={deletingId === bookmark.id}
                                    className="ml-auto rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-black/5 hover:text-black group-hover:opacity-100"
                                >
                                    {deletingId === bookmark.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
