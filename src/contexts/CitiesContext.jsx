import { createContext, useCallback, useContext, useReducer } from 'react'

const BASE_URL = 'https://6a30922aa7f8866418d624a2.mockapi.io/api/v1'
const CitiesContext = createContext()
const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
}
function reducer(state, action) {
  switch (action.type) {
    case 'isLoading':
      return { ...state, isLoading: true }
    case 'cities/loaded':
      return { ...state, isLoading: false, cities: action.payload }
    case 'city/loaded':
      return { ...state, isLoading: false, currentCity: action.payload }
    case 'city/deleted':
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
      }
    case 'city/created':
      return { ...state, isLoading: false, cities: [...state.cities, action.payload] }
    default:
      throw new Error('Unknown action type')
  }
}
function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(reducer, initialState)

  const fetchCities = useCallback(async function fetchCities(userId) {
    if (!userId) return

    try {
      dispatch({ type: 'isLoading' })

      // 👈 قدم اول: کل شهرهای موجود در دیتابیس را درخواست می‌دهیم
      const res = await fetch(`${BASE_URL}/cities`)

      if (!res.ok) throw new Error('There was an error loading data...')

      const allCities = await res.json()

      // 👈 قدم دوم: در فرانت‌اند، شهرهایی که آیدی کاربرشان با کاربر فعلی یکی است را فیلتر می‌کنیم
      // با این کار اگر کاربر جدید باشد، خروجی یک آرایه خالی [] خواهد بود و سرور هیچ ۴۰۴ای نمی‌دهد!
      const userCities = allCities.filter((city) => Number(city.userId) === Number(userId))

      dispatch({ type: 'cities/loaded', payload: userCities })
    } catch (err) {
      dispatch({ type: 'rejected', payload: err.message })
    }
  }, [])

  const getCity = useCallback(
    async function getCity(id) {
      if (Number(id) === currentCity.id) return
      dispatch({ type: 'isLoading' })
      try {
        const res = await fetch(`${BASE_URL}/cities/${id}`)
        const data = await res.json()
        dispatch({ type: 'city/loaded', payload: data })
      } catch {
        alert('there was an error loading data...')
      }
    },
    [currentCity.id]
  )

  async function createCity(newCity, userId) {
    const cityWithUser = { ...newCity, userId }
    try {
      dispatch({ type: 'isLoading' })
      const res = await fetch(`${BASE_URL}/cities`, {
        method: 'POST',
        body: JSON.stringify(cityWithUser),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      dispatch({ type: 'city/created', payload: data })
    } catch {
      alert('there was an error loading data...')
    }
  }

  async function deleteCity(id) {
    try {
      dispatch({ type: 'isLoading' })
      const res = await fetch(`${BASE_URL}/cities/${id}`, {
        method: 'DELETE',
      })
      dispatch({ type: 'city/deleted', payload: id })
    } catch {
      alert('there was an error loading data...')
    }
  }
  return (
    <CitiesContext.Provider
      value={{ cities, isLoading, fetchCities, getCity, currentCity, createCity, deleteCity }}
    >
      {children}
    </CitiesContext.Provider>
  )
}

function useCities() {
  const context = useContext(CitiesContext)
  if (context === undefined) throw new Error('using CitiesContext out of CitiesProvider')
  return context
}

export { CitiesProvider, useCities }
