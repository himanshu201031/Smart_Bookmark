'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Bookmark } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { LogOut, Bookmark as BookmarkIcon, Loader2, User } from 'lucide-react'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList from '@/components/BookmarkList'

export default function Dashboard() {
    const router = useRouter()
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string>('')

    useEffect(() => {
        // Check authentication
        const checkAuth = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession()

            if (!session) {
                router.push('/')
                return
            }

            setUserEmail(session.user.email || '')
            fetchBookmarks()
        }

        checkAuth()

        // Set up realtime subscription
        const channel = supabase
            .channel('bookmarks-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                },
                (payload) => {
                    console.log('Realtime update:', payload)

                    if (payload.eventType === 'INSERT') {
                        setBookmarks((current) => [payload.new as Bookmark, ...current])
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((current) =>
                            current.filter((bookmark) => bookmark.id !== payload.old.id)
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router])

    const fetchBookmarks = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) return

            const { data, error } = await supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            setBookmarks(data || [])
        } catch (err) {
            console.error('Error fetching bookmarks:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader2 className="h-8 w-8 text-indigo-600" />
                </motion.div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute -right-4 top-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-indigo-400/20 to-purple-400/20 blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>

            {/* Main content */}
            <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
                            <BookmarkIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Smart Bookmark
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-3.5 w-3.5" />
                                <span>{userEmail}</span>
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className="flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2.5 font-medium text-gray-700 shadow-lg backdrop-blur-xl border border-white/20 transition-all hover:bg-white/90"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                    </motion.button>
                </motion.div>

                {/* Bookmark form */}
                <div className="mb-8">
                    <BookmarkForm />
                </div>

                {/* Bookmarks list */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h2 className="mb-4 text-xl font-semibold text-gray-800">
                        Your Bookmarks ({bookmarks.length})
                    </h2>
                    <BookmarkList bookmarks={bookmarks} />
                </motion.div>
            </div>
        </div>
    )
}
