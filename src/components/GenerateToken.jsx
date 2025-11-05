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
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Gerar Token</h2>
      <input
        className="border w-full p-2 mb-3 rounded-md"
        placeholder="Nome do participante"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border w-full p-2 mb-3 rounded-md"
        placeholder="Email do participante"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full"
      >
        Gerar Token
      </button>
    </div>
  );
}
