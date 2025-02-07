import './App.css'
import { useState, useEffect } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { LoginForm } from "@/components/login-form"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem("jwt")
        if (!token) throw new Error("No token found")

        const response = await fetch("/api/check_jwt", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Access-Control-Allow-Origin": "*",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch protected data")
        }

        setIsAuthenticated(true)
      } catch (err) {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      {loading ? (
        <div>Loading...</div>
      ) : isAuthenticated ? (
        <h1>You are authenticated</h1>
      ) : (
        <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </ThemeProvider>
  )
}

export default App