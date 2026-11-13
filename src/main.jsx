import React from 'react'
import ReactDOM from 'react-dom/client'
const App = (import.meta.env.VITE_MODULE_ONE_REVIEW === '1'
  ? await import('@/components/workbook/moduleOneRevised/RevisionExperience.jsx')
  : await import('@/App.jsx')).default
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
