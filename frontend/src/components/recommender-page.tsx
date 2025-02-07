import React, { useEffect, useState } from 'react'

const RecommenderPage: React.FC = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("jwt")
        const response = await fetch("/api/self_data", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Access-Control-Allow-Origin": "*",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch protected data")
        }

        const data = await response.json()
        setData(data)
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div>
      <h1>Protected Data</h1>
      <p>{JSON.stringify(data, null, 2)}</p>
    </div>
  )
}

export default RecommenderPage