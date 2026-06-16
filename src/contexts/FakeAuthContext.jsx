import { createContext, useContext, useReducer } from 'react'

const AuthContext = createContext()

const BASE_URL = 'https://6a30922aa7f8866418d624a2.mockapi.io/api/v1'

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: null }
    case 'login':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      } // 👈 ارور را پاک میکنیم
    case 'logout':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null }
    case 'rejected':
      return { ...state, error: action.payload, isLoading: false }
    default:
      throw new Error('Unknown action')
  }
}

function AuthProvider({ children }) {
  const [{ user, isAuthenticated, isLoading, error }, dispatch] = useReducer(reducer, initialState)

  // ۱. متد لاگین
  async function login(email, password) {
    dispatch({ type: 'loading' })
    try {
      const res = await fetch(`${BASE_URL}/users`)
      const allUsers = await res.json()

      const foundUser = allUsers.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        dispatch({ type: 'login', payload: foundUser })
      } else {
        dispatch({ type: 'rejected', payload: 'Invalid email or password' })
      }
    } catch (err) {
      dispatch({ type: 'rejected', payload: err.message })
    }
  }

  // ۲. متد ثبت‌نام (کاملاً اصلاح‌شده و امن)
  async function signup(name, email, password) {
    dispatch({ type: 'loading' }) // 👈 استیت لودینگ فعال و ارور قبلی پاک می‌شود
    try {
      // برای دور زدن باگ‌های ۴۰۴ فیلترِ MockAPI، کل کاربران را می‌گیریم (امن‌ترین راه)
      const res = await fetch(`${BASE_URL}/users`)
      if (!res.ok) throw new Error('Something went wrong checking the users.')

      const allUsers = await res.json()

      // چک می‌کنیم آیا کسی با این ایمیل از قبل ثبت‌نام کرده؟
      const emailExists = allUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())

      if (emailExists) {
        dispatch({ type: 'rejected', payload: 'This email is already registered!' })
        alert('This email is already registered!')
        return // 👈 خروج فوری تا بقیه کد اجرا نشود
      }

      // اگر ایمیل وجود نداشت، کاربر جدید را POST می‌کنیم
      const responseCreate = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          avatar: `https://i.pravatar.cc/100?u=${email}`,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!responseCreate.ok) throw new Error('Error creating the user account.')

      const newUser = await responseCreate.json()

      // ورود موفقیت آمیز کاربر جدید
      dispatch({ type: 'login', payload: newUser })
    } catch (err) {
      dispatch({ type: 'rejected', payload: err.message })
    }
  }

  function logout() {
    dispatch({ type: 'logout' })
  }

  return (
    <AuthContext.Provider
      value={{ logout, login, signup, user, isAuthenticated, isLoading, error }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('using context out of provider')
  return context
}

export { AuthProvider, useAuth }
