import { useEffect, useState } from 'react'
import styles from './Signup.module.css'
import { useAuth } from '../contexts/FakeAuthContext'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'

export default function Signup() {
  const { signup, isAuthenticated, error, isLoading } = useAuth()
  const [email, setEmail] = useState('jack@example.com')
  const [password, setPassword] = useState('qwerty')
  const [name, setName] = useState('Jack Doe')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (email && password && name) signup(name, email, password)
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
    <main className={styles.signup}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.row}>
          <label htmlFor="name">Full name</label>
          <input
            type="text"
            id="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>

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
            {isLoading ? 'Creating...' : 'Sign Up'}
          </Button>
          <Link to="/login" className={styles.link}>
            Already have an account? Login
          </Link>
        </div>
      </form>
    </main>
  )
}
