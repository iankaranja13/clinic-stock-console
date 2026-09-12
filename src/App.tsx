import { Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

function StockListPlaceholder() {
  return <div className="p-6">Stock list goes here (next step)</div>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<StockListPlaceholder />} />
      </Route>
    </Routes>
  )
}

export default App
