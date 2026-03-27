import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from './header'
import { ChevronRight, CalendarClock, UserCircle, Activity, Clock, CheckCircle2 } from 'lucide-react'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-x-hidden">
                <section className="relative min-h-screen flex items-center">
                    <div className="relative w-full">
                        <div className="relative z-10 flex flex-col justify-center min-h-screen px-6 py-20 lg:px-12">
                            <div className="mx-auto w-full max-w-7xl">
                                <div className="grid lg:grid-cols-2 gap-12 items-center">
                                    {/* Left Content */}
                                    <div className="text-center lg:text-left">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
                                            <Activity className="w-4 h-4 text-primary-400" />
                                            <span className="text-sm font-medium text-primary-400">DACS Healthcare</span>
                                        </div>
                                        
                                        <h1 className="text-balance text-4xl md:text-5xl xl:text-6xl font-bold text-white">
                                            Smart Appointment<br />
                                            <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
                                                Management System
                                            </span>
                                        </h1>
                                        
                                        <p className="mt-6 text-balance text-lg text-white/80 max-w-lg mx-auto lg:mx-0">
                                            Empower your medical practice with intelligent scheduling, 
                                            patient management, and seamless communication tools.
                                        </p>

                                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                            <Button
                                                asChild
                                                size="lg"
                                                className="h-12 rounded-xl px-6 text-base font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25"
                                            >
                                                <Link href="/register">
                                                    Start Free Trial
                                                    <ChevronRight className="ml-2 w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                size="lg"
                                                variant="outline"
                                                className="h-12 rounded-xl px-6 text-base border-white/30 text-white hover:bg-white/10 hover:text-white"
                                            >
                                                <Link href="/contact">
                                                    Contact Sales
                                                </Link>
                                            </Button>
                                        </div>

                                        {/* Feature List */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                            {[
                                                { icon: CalendarClock, text: "Real-time scheduling" },
                                                { icon: UserCircle, text: "Patient portals" },
                                                { icon: Clock, text: "Automated reminders" },
                                                { icon: CheckCircle2, text: "Digital records" }
                                            ].map((feature, i) => (
                                                <div key={i} className="flex items-center gap-2 text-white/80">
                                                    <feature.icon className="w-4 h-4 text-primary-400 flex-shrink-0" />
                                                    <span className="text-sm">{feature.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Content - Stats Card */}
                                    <div className="hidden lg:block">
                                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                                            <h3 className="text-xl font-semibold text-white mb-6">Why choose DACS?</h3>
                                            <div className="space-y-6">
                                                {[
                                                    { value: "50%", label: "Reduced no-shows", change: "+25%", trend: "up" },
                                                    { value: "30min", label: "Average wait time", change: "-25%", trend: "down" },
                                                    { value: "98%", label: "Patient satisfaction", change: "+15%", trend: "up" }
                                                ].map((metric, i) => (
                                                    <div key={i} className="flex justify-between items-center border-b border-white/10 pb-4 last:border-0">
                                                        <span className="text-white/80 font-medium">{metric.label}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl font-bold text-white">{metric.value}</span>
                                                            <span className={`text-sm font-semibold ${metric.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                                                {metric.change}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="mt-8 pt-4 border-t border-white/10">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="flex -space-x-2">
                                                        {[1, 2, 3, 4].map((i) => (
                                                            <div key={i} className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/50 flex items-center justify-center">
                                                                <span className="text-xs text-primary-400">👤</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-white/70">
                                                        Trusted by <span className="text-primary-400 font-semibold">500+</span> medical practices
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Background with medical theme - Fixed for better text contrast */}
                        <div className="absolute inset-0 -z-10">
                            {/* Dark overlay for better text contrast */}
                            <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-primary-950/60 z-10" />
                            
                            {/* Radial gradient for depth */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent z-10" />
                            
                            {/* Medical pattern overlay */}
                            <div className="absolute inset-0 opacity-30 z-0">
                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <defs>
                                        <pattern id="medical-grid" patternUnits="userSpaceOnUse" width="20" height="20">
                                            <path d="M10 0 L10 20 M0 10 L20 10" stroke="rgba(99,102,241,0.3)" strokeWidth="0.5" fill="none" />
                                            <circle cx="10" cy="10" r="1" fill="rgba(99,102,241,0.4)" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#medical-grid)" />
                                </svg>
                            </div>
                            
                            {/* Animated gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 via-transparent to-primary-600/5 animate-pulse" />
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}