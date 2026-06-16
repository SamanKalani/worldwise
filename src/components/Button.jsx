import styles from './Button.module.css'
function Button({ onClick, type, children }) {
  return (
    <button onClick={onClick} className={`${styles[type]} ${styles.btn}`}>
      {children}
    </button>
  )
}

export default Button
