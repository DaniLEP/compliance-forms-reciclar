import { useState } from "react";
import { ref, set } from "firebase/database";
import { db } from "../../firebase";
import { generateToken } from "../utils/generateToken";
import { useNavigate } from "react-router-dom";

export default function GenerateToken() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!name || !email) {
      alert("Preencha nome e email");
      return;
    }

    const token = generateToken();
    await set(ref(db, `tokens/${token}`), {
      name,
      email,
      used: false,
      sent: false
    });

    alert(`Token gerado com sucesso para ${name}`);
    navigate("/dashboard");
  };

return (
  <div className="p-10 bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto mt-20">
    <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
      Gerar Token
    </h2>

    <div className="space-y-4">
      <input
        className="border border-gray-300 w-full p-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        placeholder="Nome do participante"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border border-gray-300 w-full p-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        placeholder="Email do participante"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white px-6 py-3 rounded-lg hover:opacity-90 transition w-full font-medium shadow-md"
      >
        Gerar Token
      </button>
    </div>
  </div>
);

}
