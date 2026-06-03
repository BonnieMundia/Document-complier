import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Layout } from './components/Layout'
import { HomePage } from './pages/Home'
import { HistoryPage } from './pages/HistoryPage'
import { BatchPage } from './pages/BatchPage'
import { ComparePage } from './pages/ComparePage'
import { CitePage } from './pages/CitePage'
import { HandbookPage } from './pages/HandbookPage'
import { useAppStore } from './store/useAppStore'

function App() {
  const { activeTab } = useAppStore()
  const PAGE: Record<string, React.ReactNode> = {
    compiler: <HomePage/>,
    history: <HistoryPage/>,
    batch: <BatchPage/>,
    compare: <ComparePage/>,
    cite: <CitePage/>,
    handbook: <HandbookPage/>,
  }
  return <Layout>{PAGE[activeTab] ?? <HomePage/>}</Layout>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App/></React.StrictMode>
)
