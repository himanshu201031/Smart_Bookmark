'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'

export default function BookmarkForm() {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const validateUrl = (urlString: string) => {
        try {
            new URL(urlString)
            return true
        } catch {
            return false
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

            const { error: insertError } = await supabase.from('bookmarks').insert([
                {
                    user_id: user.id,
                    title: title.trim(),
                    url: url.trim(),
                },
            ])

            if (insertError) throw insertError

            // Clear form
            setTitle('')
            setUrl('')
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
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-white/70 p-6 shadow-xl backdrop-blur-xl border border-white/20"
        >
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
                Add New Bookmark
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="title"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="My Awesome Website"
                        className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label
                        htmlFor="url"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        URL
                    </label>
                    <input
                        type="text"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Adding...</span>
                        </>
                    ) : (
                        <>
                            <Plus className="h-5 w-5" />
                            <span>Add Bookmark</span>
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    )
}
