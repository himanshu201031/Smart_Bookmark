'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Loader2, Link as LinkIcon, Type, FileText, Folder, Star, Globe } from 'lucide-react'

const CATEGORIES = ['Reading', 'Work', 'Personal', 'Shopping', 'Tech', 'Finance', 'Entertainment', 'Others']

export default function BookmarkForm() {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [category, setCategory] = useState('Reading')
    const [description, setDescription] = useState('')
    const [isFavorite, setIsFavorite] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showAdvanced, setShowAdvanced] = useState(false)

    const validateUrl = (urlString: string) => {
        try {
            new URL(urlString)
            return true
        } catch {
            return false
        }
    }

    const getFaviconUrl = (urlString: string) => {
        try {
            const domain = new URL(urlString).hostname
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
        } catch {
            return ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!title.trim()) {
            setError('Title is required')
            return
        }

        if (!url.trim()) {
            setError('URL is required')
            return
        }

        if (!validateUrl(url)) {
            setError('Please enter a valid URL (e.g., https://example.com)')
            return
        }

        setLoading(true)

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                setError('You must be logged in to add bookmarks')
                setLoading(false)
                return
            }

            const favicon_url = getFaviconUrl(url)

            const { error: insertError } = await supabase.from('bookmarks').insert([
                {
                    user_id: user.id,
                    title: title.trim(),
                    url: url.trim(),
                    category,
                    description: description.trim(),
                    is_favorite: isFavorite,
                    favicon_url
                },
            ])

            if (insertError) throw insertError

            // Clear form
            setTitle('')
            setUrl('')
            setDescription('')
            setIsFavorite(false)
            setShowAdvanced(false)
        } catch (err) {
            console.error('Error adding bookmark:', err)
            setError('Failed to add bookmark. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/80 p-6 shadow-2xl backdrop-blur-2xl border border-black/5 ring-1 ring-black/5"
        >
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-black" />
                    Quick Add
                </h2>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-semibold text-black hover:opacity-70 transition-colors uppercase tracking-wider"
                >
                    {showAdvanced ? 'Hide Advanced' : 'Add Details'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    <div className="relative group">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Page Title"
                            className="w-full rounded-2xl border-none bg-gray-50/50 py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-black outline-none"
                            disabled={loading}
                        />
                    </div>

                    <div className="relative group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full rounded-2xl border-none bg-gray-50/50 py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-black outline-none"
                            disabled={loading}
                        />
                    </div>

                    <AnimatePresence>
                        {showAdvanced && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden pt-2"
                            >
                                <div className="relative group">
                                    <Folder className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-2xl border-none bg-gray-50/50 py-3.5 pl-11 pr-4 text-gray-900 ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-black outline-none appearance-none cursor-pointer"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative group">
                                    <FileText className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a short description..."
                                        rows={2}
                                        className="w-full rounded-2xl border-none bg-gray-50/50 py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 ring-1 ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-black outline-none resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-3 px-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsFavorite(!isFavorite)}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition-all ${isFavorite
                                            ? 'bg-black text-white'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Star className={`h-4 w-4 ${isFavorite ? 'fill-white' : ''}`} />
                                        Mark as Favorite
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-xl bg-gray-50 p-3 text-sm text-black border border-gray-100"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-bold text-white shadow-xl shadow-black/10 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Plus className="h-5 w-5" />
                            <span>Save Bookmark</span>
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    )
}
