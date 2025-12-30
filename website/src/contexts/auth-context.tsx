"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { loginUser, getCurrentUser } from "@/lib/api/auth"
import { useRouter } from "next/navigation"

interface User {
    id: number
    full_name: string
    email: string
    phone?: string
    avatar_url?: string
    points: number
    reputation_score: number
    role: string
    isVerified: boolean
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("token")
            if (token) {
                try {
                    const userData = await getCurrentUser()
                    setUser(userData)
                } catch (error) {
                    console.error("Failed to load user:", error)
                    localStorage.removeItem("token")
                }
            }
            setLoading(false)
        }
        loadUser()
    }, [])

    const login = async (email: string, password: string) => {
        const response = await loginUser({ email, password })

        localStorage.setItem("token", response.token)

        setUser(response.user)
    }

    const logout = () => {
        localStorage.removeItem("token")
        setUser(null)
        router.push("/login")
    }

    const refreshUser = async () => {
        try {
            const userData = await getCurrentUser()
            setUser(userData)
        } catch (error) {
            console.error("Failed to refresh user:", error)
            logout()
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
