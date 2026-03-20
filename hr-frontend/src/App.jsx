import { ToastProvider } from './components/Toast'
import Dataprovider from './Hooks/Dataprovider'
import AppRouter from './routes/router'

function App() {
  return (
    <Dataprovider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </Dataprovider>
  )
}

export default App
