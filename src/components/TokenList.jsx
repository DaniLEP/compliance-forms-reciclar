// import { useEffect, useState } from "react";
// import { ref, onValue, set } from "firebase/database";
// import { db } from "../../firebase";

// export default function TokenList() {
//   const [tokens, setTokens] = useState([]);

//   useEffect(() => {
//     const tokensRef = ref(db, "tokens");
//     onValue(tokensRef, (snapshot) => {
//       const data = snapshot.val();
//       const list = Object.entries(data || {}).map(([token, info]) => ({
//         token,
//         ...info
//       }));
//       setTokens(list);
//     });
//   }, []);

//   const handleSendEmail = async (user) => {
//     const link = `https://formulario-complicance-instituto-re-two.vercel.app/form?token=${user.token}`;
//     window.open(
//       `https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}&su=Token de Acesso - Compliance Forms&body=Olá ${user.name},%0A%0AAcesse o formulário pelo link:%0A${link}%0A%0ASeu token: ${user.token}`
//     );

//     await set(ref(db, `tokens/${user.token}/sent`), true);
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Painel de Controle</h2>
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-100 text-left">
//             <th className="p-2">Nome</th>
//             <th className="p-2">Email</th>
//             <th className="p-2">Token</th>
//             <th className="p-2">Status</th>
//             <th className="p-2">Ações</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tokens.map((t) => (
//             <tr key={t.token} className="border-b">
//               <td className="p-2">{t.name}</td>
//               <td className="p-2">{t.email}</td>
//               <td className="p-2 font-mono text-sm">{t.token}</td>
//               <td className="p-2">
//                 {t.used ? "✅ Preenchido" : "⏳ Não Preenchido"}
//               </td>
//               <td className="p-2">
//                 {!t.sent ? (
//                   <button
//                     onClick={() => handleSendEmail(t)}
//                     className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
//                   >
//                     Enviar Token
//                   </button>
//                 ) : (
//                   <span className="text-gray-500">📤 Enviado</span>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "../../firebase";

export default function TokenList() {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    const tokensRef = ref(db, "tokens");
    onValue(tokensRef, (snapshot) => {
      const data = snapshot.val();
      const list = Object.entries(data || {}).map(([token, info]) => ({
        token,
        ...info
      }));
      setTokens(list);
    });
  }, []);

  const handleSendEmail = async (user) => {
    // 🔹 Corrigido link para o deploy Vercel
    const baseFormURL = "https://formulario-complicance-instituto-reciclar.vercel.app/form";
    const link = `${baseFormURL}?token=${user.token}`;

    // Abre Gmail com email pré-preenchido
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}&su=Token de Acesso - Compliance Forms&body=Olá ${user.name},%0A%0AAcesse o formulário pelo link:%0A${link}%0A%0ASeu token: ${user.token}`,
      "_blank"
    );

    // Marca o token como enviado no Firebase
    await set(ref(db, `tokens/${user.token}/sent`), true);
  };

  return (
    <div className="p-6 bg-white text-black min-h-screen">
      <h2 className="text-xl font-bold mb-4">Painel de Controle</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border-b">Nome</th>
            <th className="p-2 border-b">Email</th>
            <th className="p-2 border-b">Token</th>
            <th className="p-2 border-b">Status</th>
            <th className="p-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.token} className="border-b hover:bg-gray-100">
              <td className="p-2">{t.name}</td>
              <td className="p-2">{t.email}</td>
              <td className="p-2 font-mono text-sm">{t.token}</td>
              <td className="p-2">
                {t.used ? "✅ Preenchido" : "⏳ Não Preenchido"}
              </td>
              <td className="p-2">
                {!t.sent ? (
                  <button
                    onClick={() => handleSendEmail(t)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                  >
                    Enviar Token
                  </button>
                ) : (
                  <span className="text-gray-500">📤 Enviado</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
