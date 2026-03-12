import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Layout/Sidebar"
import Dashboard from "./pages/Dashboard"
import CommandCenter from "./pages/Commandcenter"
import PumpsPage from "./pages/Pumpspage"
import EngineersPage from "./pages/Engineerpage"
import WardsPage from "./pages/Wardspage"
import "./App.css"

export default function App() {
  return (
    // We wrap the whole app in a font-sans class to enforce the Plus Jakarta Sans font
    <div className="font-sans antialiased text-slate-900 selection:bg-blue-500 selection:text-white">
      <BrowserRouter>
        <Routes>
          <Route element={<Sidebar />}>
            <Route index          element={<Dashboard />}     />
            <Route path="command" element={<CommandCenter />} />
            <Route path="pumps"   element={<PumpsPage />}     />
            <Route path="engineers" element={<EngineersPage />} />
            <Route path="wards"   element={<WardsPage />}     />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}