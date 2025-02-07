import './App.css'
import { useState, useEffect } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { LoginForm } from "@/components/login-form"
// import Navbar from "@/components/Navbar"
// import Sidebar from "@/components/Sidebar"
// import UtilityTable from "@/components/UtilityTable"
import Dashboard from "@/components/Dashboard"


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
    <div className="w-screen h-screen flex justify-center p-0 m-0">
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        {loading ? (
          <div>Loading...</div>
        ) : isAuthenticated ? (
          <div className="w-full h-screen flex flex-col p-0 m-0">
            {/* <Navbar profileName={"JT"} onLogout={() => { console.log("Logout is Clicked") }} /> */}
            {/* Add other components here */}
            {/* <Sidebar recommenders={example_recommenders} organizations={example_organizations} /> */}
            {/* <UtilityTable initialBudget={100} maxBudget={1000} companies={example_utility_table} /> */}
            <Dashboard />
          </div>
          // <Navbar profileName={"JT"} onLogout={()=>{console.log("Logout is Clicked")}}/>
        ) : (
          <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
        )}
      </ThemeProvider>
    </div>
  )
}

export default App