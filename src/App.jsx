import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ResponsesPage from "./components/ResponsesPage";
import ErrorPage from "./components/ErrorPage";

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Navbar fixa no topo */}
      <Navbar />

      {/* Conteúdo principal */}
      <main className="pt-20 px-6">
        <Routes>
          {/* 🔹 Rota principal aponta para o Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/responses" element={<ResponsesPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>

      {/* Logo fixa no canto inferior direito */}
      <div className="fixed bottom-4 right-4 opacity-80 hover:opacity-100 transition-all">
        <img
          src="/Logo.png"
          alt="Logo da Empresa"
          className="w-24 h-auto drop-shadow-md"
        />
      </div>
    </div>
  );
}
