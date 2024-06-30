import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { TmaProvider } from './Components/tma/provider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TmaProvider>
      <App />
    </TmaProvider>
  </React.StrictMode>,
)
