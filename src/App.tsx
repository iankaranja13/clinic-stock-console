import { Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { StockListPage } from '@/pages/StockListPage'
import { ItemDetailPage } from '@/pages/ItemDetailPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<StockListPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
      </Route>
    </Routes>
  )
}

export default App
