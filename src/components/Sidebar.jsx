import styles from './Sidebar.module.css'
import Logo from './Logo'
import AppNav from './AppNav'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../contexts/FakeAuthContext'
import { useCities } from '../contexts/CitiesContext'
function Sidebar() {
  const { fetchCities } = useCities()
  const { user } = useAuth()
  useEffect(
    function () {
      if (user.id) {
        fetchCities(user.id)
      }
    },
    [user.id, fetchCities]
  )
  return (
    <div className={styles.sidebar}>
      <Logo />
      <AppNav />
      <Outlet />
      <footer className={styles.footer}>
        <p className={styles.copyright}>
          &copy; copyright{new Date().getFullYear()} by WorldWise Inc.
        </p>
      </footer>
    </div>
  )
}

export default Sidebar
