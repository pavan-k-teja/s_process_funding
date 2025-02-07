import './App.css'
import { useState, useEffect } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { LoginForm } from "@/components/login-form"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"


interface Recommender {
  name: string;
  allocation: number;
  color: string;
}

interface Organization {
  name: string;
  allocation: number;
  colorStrip: string;
}

// interface SidebarProps {
//   recommenders: Recommender[];
//   organizations: Organization[];
// }


const example_recommenders: Recommender[] = [
  { name: 'Recommender 1', allocation: 10, color: '#ff0000' },
  { name: 'Recommender 2', allocation: 20, color: '#00ff00' },
  { name: 'Recommender 3', allocation: 30, color: '#0000ff' },
];

const example_organizations: Organization[] = [
  {
    name: 'Organization 1',
    allocation: 10,
    colorStrip: '#ff0000',
  },
  {
    name: 'Organization 2',
    allocation: 20,
    colorStrip: '#00ff00',
  },
  {
    name: 'Organization 3',
    allocation: 30,
    colorStrip: '#0000ff',
  },
];

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
        <div className="w-full h-screen flex flex-col">
          {/* <Navbar profileName={"JT"} onLogout={() => { console.log("Logout is Clicked") }} /> */}
          {/* Add other components here */}
          <Sidebar recommenders={example_recommenders} organizations={example_organizations} />
        </div>
        // <Navbar profileName={"JT"} onLogout={()=>{console.log("Logout is Clicked")}}/>
      ) : (
        <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </ThemeProvider>
  )
}

export default App