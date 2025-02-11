import './App.css'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from "@/components/theme-provider"
import { LoginForm } from "@/components/login-form"
// import Navbar from "@/components/Navbar"
// import Sidebar from "@/components/Sidebar"
// import UtilityTable from "@/components/UtilityTable"
import UserRouter from "@/components/UserRouter"


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
        console.log(response)
        console.log(isAuthenticated)

        setIsAuthenticated(true)
        setLoading(false)
      } catch (err) {
        setIsAuthenticated(false)
      } finally {

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
            {/* // <div className="w-full h-screen flex flex-col p-0 m-0"> */}
            {/* <Navbar profileName={"JT"} onLogout={() => { console.log("Logout is Clicked") }} /> */}
            {/* Add other components here */}
            {/* <Sidebar recommenders={example_recommenders} organizations={example_organizations} /> */}
            {/* <UtilityTable initialBudget={100} maxBudget={1000} companies={example_utility_table} /> */}
            <UserRouter />
            {/* // </div> */}
            {/* // <Navbar profileName={"JT"} onLogout={()=>{console.log("Logout is Clicked")}}/> */}
          </>
        ) : (
          <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
        )}
      </ThemeProvider>
    </div>
  )
}

export default App