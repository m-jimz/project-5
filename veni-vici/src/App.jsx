import { useState } from 'react'
import './App.css'

function App() {
  const [cat, setCat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [banList, setBanList] = useState(new Set())

  const API_KEY = 'live_KP5NEfBkUe0K4S2ihUPPtzVOFsgVqeHPi150CSrayfU9W6tr7v5E7NCZ7PpxnUWx'

  const toggleBan = (value) => {
    const newBanList = new Set(banList)
    if (newBanList.has(value)) {
      newBanList.delete(value)
    } else {
      newBanList.add(value)
    }
    setBanList(newBanList)
  }

  const isCatBanned = (catData) => {
    if (!catData.breeds || catData.breeds.length === 0) return false
    const breed = catData.breeds[0]
    
    return (
      banList.has(breed.temperament) ||
      banList.has(breed.origin) ||
      banList.has(breed.intelligence)
    )
  }

  const fetchCat = async () => {
    setLoading(true)
    setError(null)
    let foundCat = null
    let attempts = 0
    const maxAttempts = 20

    try {
      while (attempts < maxAttempts && !foundCat) {
        const response = await fetch(
          'https://api.thecatapi.com/v1/images/search?has_breeds=1',
          {
            headers: {
              'x-api-key': API_KEY,
            },
          }
        )
        if (!response.ok) {
          throw new Error('Failed to fetch cat data')
        }
        const data = await response.json()
        if (data.length > 0) {
          if (!isCatBanned(data[0])) {
            foundCat = data[0]
          }
        }
        attempts++
      }

      if (foundCat) {
        setCat(foundCat)
      } else {
        setError('No cats available! Try removing some bans.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <h1>🐱 Cat Discover</h1>
      
      <button 
        onClick={fetchCat} 
        disabled={loading}
        className="fetch-btn"
      >
        {loading ? 'Loading...' : 'Discover a Cat'}
      </button>

      {error && <p className="error">{error}</p>}

      {cat && cat.breeds && cat.breeds.length > 0 && (
        <div className="cat-card">
          <img src={cat.url} alt="Random cat" className="cat-image" />
          <h2>{cat.breeds[0].name}</h2>
          <div className="attributes">
            <p>
              <strong>Temperament:</strong> 
              <span 
                className={`attr-value ${banList.has(cat.breeds[0].temperament) ? 'banned' : ''}`}
                onClick={() => toggleBan(cat.breeds[0].temperament)}
                title="Click to ban"
              >
                {cat.breeds[0].temperament}
              </span>
            </p>
            <p>
              <strong>Origin:</strong> 
              <span 
                className={`attr-value ${banList.has(cat.breeds[0].origin) ? 'banned' : ''}`}
                onClick={() => toggleBan(cat.breeds[0].origin)}
                title="Click to ban"
              >
                {cat.breeds[0].origin}
              </span>
            </p>
            <p>
              <strong>Intelligence:</strong> 
              <span 
                className={`attr-value ${banList.has(cat.breeds[0].intelligence) ? 'banned' : ''}`}
                onClick={() => toggleBan(cat.breeds[0].intelligence)}
                title="Click to ban"
              >
                {cat.breeds[0].intelligence || 'N/A'}
              </span>
            </p>
          </div>
        </div>
      )}

      {banList.size > 0 && (
        <div className="ban-list-display">
          <h3>Banned Attributes ({banList.size})</h3>
          <div className="ban-tags">
            {Array.from(banList).map((value) => (
              <span 
                key={value} 
                className="ban-tag"
                onClick={() => toggleBan(value)}
                title="Click to remove ban"
              >
                {value} ✕
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
