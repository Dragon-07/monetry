'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ThemeToggle } from './ThemeToggle'
import { LayoutDashboard, FileText, Repeat, PieChart, LogOut, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null)
    })
    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/registro', label: 'Registro', icon: FileText },
    { href: '/gastos-recurrentes', label: 'Recurrentes', icon: Repeat },
    { href: '/analisis', label: 'Análisis', icon: PieChart },
  ]

  return (
    <header className="glass-panel sticky top-0 z-50 px-6 py-4 mx-4 mt-4 mb-8 rounded-xl flex justify-between items-center">
      <div className="flex w-full items-center justify-between">
        {/* Logo/Title */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Monetry Logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            priority
          />
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            Monetry
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${isActive
                  ? 'glass-panel text-gray-900 dark:text-white'
                  : 'hover:bg-white/30 dark:hover:bg-gray-800/30 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex gap-1">
          {navItems.map(({ href, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`p-2 rounded-lg ${isActive
                  ? 'glass-panel text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            )
          })}
        </nav>

        {/* Right side: user info + theme + logout */}
        <div className="flex items-center gap-2 ml-2">
          {/* Usuario activo */}
          {userEmail && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 max-w-[120px] truncate">
                {userEmail}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <div className="bg-transparent text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-full transition-colors flex items-center">
            <ThemeToggle />
          </div>

          {/* Logout */}
          {userEmail && (
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
