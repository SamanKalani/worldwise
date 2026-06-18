import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import Button from './Button'

import styles from './Form.module.css'
import { useUrlPosition } from '../hooks/useUrlPosition'
import Message from './Message'
import Spinner from './Spinner'
import { useCities } from '../contexts/CitiesContext'
import { useNavigate } from 'react-router-dom'
import ButtonBack from './ButtonBack'
import { useAuth } from '../contexts/FakeAuthContext'

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

const BASE_URL = 'https://nominatim.openstreetmap.org/reverse?format=json'

function Form() {
  const [lat, lng] = useUrlPosition()
  const { createCity, isLoading } = useCities()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false)
  const [cityName, setCityName] = useState('')
  const [country, setCountry] = useState('')
  const [date, setDate] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [emoji, setEmoji] = useState('')
  const [geocodingError, setGeocodingError] = useState('')

  //reverse geocoding: get city name and country from coordinates
  useEffect(
    function () {
      if (!lat && !lng) return

      async function fetchCityData() {
        try {
          setIsLoadingGeocoding(true)
          setGeocodingError('')

          const res = await fetch(`${BASE_URL}&lat=${lat}&lon=${lng}`)
          const data = await res.json()

          const address = data.address

          setCityName(address?.city || address?.town || address?.village || address?.country || '')

          setCountry(address?.country || '')
          setEmoji(convertToEmoji(address?.country_code || ''))
        } catch (err) {
          setGeocodingError(err.message)
        } finally {
          setIsLoadingGeocoding(false)
        }
      }
      fetchCityData()
    },
    [lat, lng]
  )

  async function handleSubmit(e) {
    e.preventDefault()

    if (!cityName || !date) return

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    }

    await createCity(newCity, user.id)
    navigate('/app/cities')
  }

  if (isLoadingGeocoding) return <Spinner />

  if (!lat && !lng) return <Message message="Start by clicking somewhere on the map" />

  if (geocodingError) return <Message message={geocodingError} />

  return (
    <form className={`${styles.form} ${isLoading ? styles.loading : ''}`} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input id="cityName" onChange={(e) => setCityName(e.target.value)} value={cityName} />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>

        <DatePicker
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="dd/MM/yyyy"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea id="notes" onChange={(e) => setNotes(e.target.value)} value={notes} />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <ButtonBack />
      </div>
    </form>
  )
}

export default Form
