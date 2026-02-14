'use client'

import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'

export default function Preloader() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
            <div className="relative flex flex-col items-center">
                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: [0.8, 1.1, 1],
                        opacity: 1,
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="relative mb-8"
                >
                    <div className="rounded-2xl bg-black p-5 shadow-2xl ring-8 ring-black/5">
                        <Bookmark className="h-10 w-10 text-white" />
                    </div>
                    {/* Pulsing ring */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl ring-2 ring-black"
                        animate={{
                            scale: [1, 1.5],
                            opacity: [0.5, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                </motion.div>

                {/* Text Animation */}
                <div className="overflow-hidden">
                    <motion.h2
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-xl font-black uppercase tracking-[0.3em] text-black"
                    >
                        Workspace
                    </motion.h2>
                </div>

                {/* Progress bar */}
                <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-black/5">
                    <motion.div
                        className="h-full bg-black"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
