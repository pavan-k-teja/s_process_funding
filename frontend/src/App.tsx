import './App.css'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from "@/components/theme-provider"
import { LoginForm } from "@/components/login-form"
import UserRouter from "@/components/UserRouter"


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      console.log("Checking authentication")
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
        console.log(response)
        console.log(isAuthenticated)

        setIsAuthenticated(true)
      } catch (err) {
        setIsAuthenticated(false)
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  return (
    <div className="w-screen h-screen flex justify-center p-0 m-0">
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-gray-500" size={48} />
            </div>
          </div>
        ) : isAuthenticated ? (
          <>
            {console.log("Authenticated")}
            <UserRouter />
          </>
        ) : (
          <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
        )}
      </ThemeProvider>
    </div>
  )
}

export default App