"use client"

import { useStats } from "@/hooks/use-stats"
import { motion, useSpring, useTransform } from "framer-motion"
import { Upload, Download } from "lucide-react"
import { useEffect } from "react"

// Animated number component
function AnimatedNumber({ value }: { value: number }) {
    const spring = useSpring(0, { stiffness: 50, damping: 20 })
    const display = useTransform(spring, (current) => Math.floor(current).toLocaleString())

    useEffect(() => {
        spring.set(value)
    }, [spring, value])

    return <motion.span>{display}</motion.span>
}

interface StatItemProps {
    icon: React.ElementType
    label: string
    value: number
    delay: number
}

function StatItem({ icon: Icon, label, value, delay }: StatItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="flex flex-col items-center gap-2 px-6 py-4"
        >
            <div className="flex items-center gap-2 text-primary">
                <Icon className="h-5 w-5" />
                <span className="text-2xl font-bold tabular-nums">
                    <AnimatedNumber value={value} />
                </span>
            </div>
            <span className="text-sm text-muted-foreground">{label}</span>
        </motion.div>
    )
}

export function StatsCounter() {
    const { data, isLoading } = useStats()

    if (isLoading || !data) {
        return (
            <div className="flex items-center justify-center gap-8 py-4">
                <div className="h-16 w-24 animate-pulse rounded-lg bg-muted/50" />
                <div className="h-16 w-24 animate-pulse rounded-lg bg-muted/50" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 py-2"
        >
            <StatItem 
                icon={Upload} 
                label="Total Uploads" 
                value={data.totalUploads} 
                delay={0.1}
            />
            <div className="hidden sm:block h-12 w-px bg-border/50" />
            <StatItem 
                icon={Download} 
                label="Total Downloads" 
                value={data.totalDownloads} 
                delay={0.2}
            />
        </motion.div>
    )
}
