import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/FakeAuthContext'
import Button from '../components/Button'
import PageNav from '../components/PageNav'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('jack@example.com')
  const [password, setPassword] = useState('qwerty')

  const { login, isAuthenticated, error, isLoading } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()

    if (email && password) login(email, password)
  }

  useEffect(
    function () {
      if (isAuthenticated) {
        navigate('/app', { replace: true })
      }
    },
    [isAuthenticated, navigate]
  )

  return (
    <main className={styles.login}>
      <PageNav />

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.row}>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <div className={styles.row}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>

        <div className={styles.row}>
          <Button type="primary" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>

          <Link to="/signup" className={styles.link}>
            Don't have an account? Sign Up
          </Link>
        </div>
      </form>
    </main>
  )
}
