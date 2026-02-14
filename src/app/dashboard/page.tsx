'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, Bookmark } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { LogOut, Bookmark as BookmarkIcon, Loader2, User, Search, Plus, Filter, Star, LayoutGrid, List as ListIcon, Trash2, ExternalLink, Hash } from 'lucide-react'
import BookmarkForm from '@/components/BookmarkForm'
import BookmarkList from '@/components/BookmarkList'

export default function Dashboard() {
    const router = useRouter()
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const [userEmail, setUserEmail] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('All')
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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
    }, [router])

    useEffect(() => {
        if (!userEmail) return

        console.log('Setting up realtime subscription for:', userEmail)

        // Set up realtime subscription
        const channel = supabase
            .channel('bookmarks-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                },
                (payload) => {
                    console.log('Realtime event received:', payload.eventType, payload)

                    if (payload.eventType === 'INSERT') {
                        const newBookmark = payload.new as Bookmark
                        setBookmarks((current) => {
                            if (current.some(b => b.id === newBookmark.id)) return current
                            return [newBookmark, ...current]
                        })
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((current) =>
                            current.filter((bookmark) => bookmark.id !== payload.old.id)
                        )
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedBookmark = payload.new as Bookmark
                        setBookmarks((current) =>
                            current.map((bookmark) =>
                                bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
                            )
                        )
                    }
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status)
            })

        return () => {
            console.log('Cleaning up realtime subscription')
            supabase.removeChannel(channel)
        }
    }, [userEmail])

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

    const filteredBookmarks = bookmarks.filter((bookmark) => {
        const matchesSearch =
            bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bookmark.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

        const matchesCategory = selectedCategory === 'All' || bookmark.category === selectedCategory
        const matchesFavorite = !showFavoritesOnly || bookmark.is_favorite

        return matchesSearch && matchesCategory && matchesFavorite
    })

    const categories = ['All', ...Array.from(new Set(bookmarks.map(b => b.category)))]

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
        <div className="relative min-h-screen overflow-hidden bg-white">
            {/* Subtle animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-black/5 blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -right-4 top-1/2 h-96 w-96 rounded-full bg-black/5 blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Main content */}
            <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
                >
                    <Link href="/" className="flex items-center gap-4 transition-all hover:opacity-80">
                        <div className="rounded-2xl bg-black p-4 shadow-xl ring-4 ring-black/5">
                            <BookmarkIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-black">
                                Workspace
                            </h1>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                <User className="h-3.5 w-3.5" />
                                <span>{userEmail}</span>
                            </div>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <motion.div
                            className="hidden items-center gap-1 rounded-xl bg-black/5 p-1 backdrop-blur-sm border border-black/5 md:flex"
                        >
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg p-2 transition-all ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`rounded-lg p-2 transition-all ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <ListIcon className="h-4 w-4" />
                            </button>
                        </motion.div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-xl bg-white/70 px-5 py-2.5 font-semibold text-gray-700 shadow-xl backdrop-blur-xl border border-black/5 transition-all hover:bg-black hover:text-white"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                        </motion.button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Sidebar / Stats & Form */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Stats Summary */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div className="rounded-2xl bg-white/70 p-4 shadow-lg backdrop-blur-xl border border-black/5">
                                <p className="text-sm font-medium text-gray-500 text-center uppercase tracking-wider">Total</p>
                                <p className="mt-1 text-3xl font-bold text-black text-center">{bookmarks.length}</p>
                            </div>
                            <div className="rounded-2xl bg-white/70 p-4 shadow-lg backdrop-blur-xl border border-black/5">
                                <p className="text-sm font-medium text-gray-500 text-center uppercase tracking-wider">Favorites</p>
                                <p className="mt-1 text-3xl font-bold text-gray-900 text-center">{bookmarks.filter(b => b.is_favorite).length}</p>
                            </div>
                        </motion.div>

                        <BookmarkForm />
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Actions & Filters */}
                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search bookmarks by title, URL or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-2xl border-none bg-white/70 py-4 pl-12 pr-4 text-gray-900 shadow-xl ring-1 ring-black/5 backdrop-blur-xl transition-all focus:bg-white focus:ring-4 focus:ring-black/10 outline-none"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${selectedCategory === cat
                                            ? 'bg-black text-white'
                                            : 'bg-white/60 text-gray-600 hover:bg-white'
                                            }`}
                                    >
                                        {cat === 'All' ? <Filter className="h-3.5 w-3.5 inline mr-1.5" /> : <Hash className="h-3.5 w-3.5 inline mr-1.5" />}
                                        {cat}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                    className={`ml-auto px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 ${showFavoritesOnly
                                        ? 'bg-black text-white'
                                        : 'bg-white/60 text-gray-600 hover:bg-white'
                                        }`}
                                >
                                    <Star className={`h-3.5 w-3.5 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                                    Favorites
                                </button>
                            </div>
                        </div>

                        {/* Bookmarks list */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {selectedCategory === 'All' ? 'Recent' : selectedCategory} Bookmarks
                                    <span className="ml-2 text-sm font-normal text-gray-400">({filteredBookmarks.length})</span>
                                </h2>
                            </div>

                            {filteredBookmarks.length > 0 ? (
                                <BookmarkList bookmarks={filteredBookmarks} viewMode={viewMode} />
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center rounded-3xl bg-white/30 p-12 text-center backdrop-blur-sm border-2 border-dashed border-gray-200"
                                >
                                    <div className="rounded-full bg-white/50 p-4 mb-4">
                                        <Search className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700">No bookmarks found</h3>
                                    <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
