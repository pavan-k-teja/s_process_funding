import './App.css'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from "@/components/theme-provider"
import { LoginForm } from "@/components/login-form"
import UserRouter from "@/components/UserRouter"

const API_URL = import.meta.env.VITE_API_URL;


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      console.log("Checking authentication")
      try {
        const token = localStorage.getItem("jwt")
        if (!token) throw new Error("No token found")

        const response = await fetch(`${API_URL}/api/check_jwt`, {
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
        console.error(err)
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
            <UserRouter />
          </>
        ) : (
          // <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-row items-center gap-10">
              {/* Login Form (Always Centered) */}
              <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />

              {/* Tooltip for Demo Credentials (Properly Positioned to the Right) */}
              <div className="w-64 h-max overflow-y-auto px-6 py-4 bg-gray-100 text-gray-800 rounded-lg shadow-md text-center text-sm">
                <p className="text-lg font-semibold text-gray-900">Demo Credentials</p>
                <p className="font-bold mt-1">Username <span className="text-xl font-extrabold px-1 align-middle">|</span> Password</p>

                <div className="mt-3 space-y-4 text-center">
                  <div>
                    <p className="font-semibold text-gray-700">Role: Recommender</p>
                    <div className="space-y-1">
                      <p>XO <span className="text-xl font-extrabold px-5 align-middle">|</span> XO</p>
                      <p>VA <span className="text-xl font-extrabold px-5 align-middle">|</span> VA</p>
                      <p>IF <span className="text-xl font-extrabold px-5 align-middle">|</span> IF</p>
                      <p>GZ <span className="text-xl font-extrabold px-5 align-middle">|</span> GZ</p>
                      <p>CF <span className="text-xl font-extrabold px-5 align-middle">|</span> CF</p>
                      <p>BO <span className="text-xl font-extrabold px-5 align-middle">|</span> BO</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700">Role: Recommender</p>
                    <div className="space-y-1">
                      <p>JT <span className="text-xl font-extrabold px-5 align-middle">|</span> JT</p>
                      <p>JM <span className="text-xl font-extrabold px-5 align-middle">|</span> JM</p>
                      <p>DM <span className="text-xl font-extrabold px-5 align-middle">|</span> DM</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700">Role: Recommender</p>
                    <p>SIGMA <span className="text-xl font-extrabold px-1 align-middle">|</span> SIGMA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


        )}
      </ThemeProvider>
    </div>
  )
}

export default App