'use client'

import { useState } from 'react'
import { supabase, Bookmark } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ExternalLink, Calendar, Loader2 } from 'lucide-react'

interface BookmarkListProps {
    bookmarks: Bookmark[]
}

export default function BookmarkList({ bookmarks }: BookmarkListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        setDeletingId(id)

        try {
            const { error } = await supabase.from('bookmarks').delete().eq('id', id)

            if (error) throw error
        } catch (err) {
            console.error('Error deleting bookmark:', err)
            alert('Failed to delete bookmark. Please try again.')
        } finally {
            setDeletingId(null)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date)
    }

    if (bookmarks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl bg-white/70 p-12 text-center shadow-xl backdrop-blur-xl border border-white/20"
            >
                <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-gray-100 p-4">
                        <ExternalLink className="h-8 w-8 text-gray-400" />
                    </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    No bookmarks yet
                </h3>
                <p className="text-gray-600">
                    Start adding your favorite websites to keep them organized!
                </p>
            </motion.div>
        )
    }

    return (
        <div className="space-y-3">
            <AnimatePresence mode="popLayout">
                {bookmarks.map((bookmark, index) => (
                    <motion.div
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        layout
                        className="group relative overflow-hidden rounded-xl bg-white/70 shadow-lg backdrop-blur-xl border border-white/20 transition-all hover:shadow-xl"
                    >
                        {/* Gradient accent on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 transition-all group-hover:from-indigo-500/5 group-hover:to-purple-500/5" />

                        <div className="relative flex items-start justify-between gap-4 p-5">
                            <div className="min-w-0 flex-1">
                                <h3 className="mb-2 truncate text-lg font-semibold text-gray-900">
                                    {bookmark.title}
                                </h3>

                                <a
                                    href={bookmark.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/link mb-3 flex items-center gap-2 text-sm text-indigo-600 transition-colors hover:text-indigo-700"
                                >
                                    <span className="truncate">{bookmark.url}</span>
                                    <ExternalLink className="h-4 w-4 flex-shrink-0 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                </a>

                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{formatDate(bookmark.created_at)}</span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(bookmark.id)}
                                disabled={deletingId === bookmark.id}
                                className="flex-shrink-0 rounded-lg bg-red-50 p-2.5 text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete bookmark"
                            >
                                {deletingId === bookmark.id ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Trash2 className="h-5 w-5" />
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
