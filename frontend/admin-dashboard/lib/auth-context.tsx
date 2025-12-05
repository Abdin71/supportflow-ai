"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Firebase user type - ready for Firebase integration
interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role?: "admin" | "manager" | "agent"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with Firebase Auth state listener
    // import { onAuthStateChanged } from "firebase/auth"
    // const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    //   if (firebaseUser) {
    //     setUser({
    //       uid: firebaseUser.uid,
    //       email: firebaseUser.email,
    //       displayName: firebaseUser.displayName,
    //       photoURL: firebaseUser.photoURL,
    //     })
    //   } else {
    //     setUser(null)
    //   }
    //   setLoading(false)
    // })
    // return () => unsubscribe()

    // Simulate checking for existing session
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    // TODO: Replace with Firebase Auth
    // import { signInWithEmailAndPassword } from "firebase/auth"
    // const userCredential = await signInWithEmailAndPassword(auth, email, password)
    // const firebaseUser = userCredential.user

    // Mock authentication - replace with Firebase
    const mockUser: User = {
      uid: "mock-uid-123",
      email,
      displayName: email.split("@")[0],
      photoURL: null,
      role: "agent",
    }

    setUser(mockUser)
    localStorage.setItem("user", JSON.stringify(mockUser))
  }

  const signOut = async () => {
    // TODO: Replace with Firebase Auth
    // import { signOut as firebaseSignOut } from "firebase/auth"
    // await firebaseSignOut(auth)

    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
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
