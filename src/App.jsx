import { ToastProvider } from './components/Toast'
import AppRouter from './routes/router'

function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  )
}

export default App
