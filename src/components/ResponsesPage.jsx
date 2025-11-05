"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { ChevronLeft, ChevronRight, FileText, X } from "lucide-react";

export default function ResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const pageSize = 5;

  // 🔥 Busca respostas em tempo real
  useEffect(() => {
    const responsesRef = ref(db, "responses");
    onValue(responsesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([token, value]) => ({
          token,
          ...value,
        }));
        setResponses(list.reverse());
      } else {
        setResponses([]);
      }
    });
  }, []);

  const startIndex = (page - 1) * pageSize;
  const paginated = responses.slice(startIndex, startIndex + pageSize);

  // 🧠 Fechar visualização
  const closeModal = () => setSelectedResponse(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8">
      {/* Header Section */}
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold mb-1 text-indigo-800">📋 Respostas Coletadas</h2>
        <p className="text-gray-600">
          Visualize e gerencie as respostas do formulário de avaliação
        </p>

        {responses.length > 0 && (
          <div className="mt-4 inline-block bg-gray-100 border border-gray-200 rounded-lg px-4 py-2">
            <p className="text-sm text-gray-700">
              Total de respostas:{" "}
              <span className="font-semibold text-indigo-700 text-lg">
                {responses.length}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Lista de respostas */}
      {responses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-2xl bg-gray-50">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-xl text-gray-600">Nenhuma resposta registrada ainda</p>
          <p className="text-sm text-gray-400 mt-2">
            As respostas aparecerão aqui assim que forem enviadas
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            {paginated.map((r, i) => (
              <div
                key={r.token}
                onClick={() => setSelectedResponse(r)}
                className="cursor-pointer border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all p-4 shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-lg flex items-center gap-2 text-indigo-700">
                      <FileText className="w-5 h-5" />
                      Resposta #{i + startIndex + 1}
                    </p>
                   
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(r.dataEnvio).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 px-4 py-2 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <div className="text-sm text-gray-600">
              Página <span className="font-bold text-indigo-700">{page}</span> de{" "}
              <span className="font-bold text-indigo-700">
                {Math.ceil(responses.length / pageSize)}
              </span>
            </div>

            <button
              onClick={() => setPage(page + 1)}
              disabled={startIndex + pageSize >= responses.length}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 px-4 py-2 rounded-lg transition-all"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white text-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-lg"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-indigo-700">Detalhes da Resposta</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Enviada em {new Date(selectedResponse.dataEnvio).toLocaleString("pt-BR")}
                </p>
              </div>

              {/* Respostas */}
              <div className="space-y-4 mb-8">
                {Object.entries(selectedResponse.respostas || {}).map(([pergunta, resposta], i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-xl p-5 bg-gray-50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="font-semibold mb-2 text-indigo-800 text-sm uppercase tracking-wide">
                      {pergunta.replace("pergunta", "Pergunta ")}
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {resposta}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="space-y-2 text-sm">
                  
                  <p>
                    <strong className="text-gray-700">Data de envio:</strong>{" "}
                    {new Date(selectedResponse.dataEnvio).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
