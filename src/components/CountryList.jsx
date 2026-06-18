import CountryItem from './CountryItem'
import Spinner from './Spinner'
import Message from './Message'
import styles from './CountryList.module.css'
import { useCities } from '../contexts/CitiesContext'
function CountryList() {
  const { cities, isLoading } = useCities()
  if (isLoading) return <Spinner />
  if (!cities.length) return <Message message="Add your first city by clicking a city on the map" />

  // Derives a unique list of visited countries from the 'cities' array.
  // Iterates through all cities and appends a country to the accumulator ('arr')
  // only if it hasn't been added yet, preventing duplicate country items in the UI.

  const countries = cities.reduce((arr, city) => {
    if (!arr.map((el) => el.country).includes(city.country))
      return [...arr, { country: city.country, emoji: city.emoji }]
    else return arr
  }, [])

  return (
    <ul className={styles.countryList}>
      {countries.map((country) => (
        <CountryItem country={country} key={country.country} />
      ))}
    </ul>
  )
}
export default CountryList
