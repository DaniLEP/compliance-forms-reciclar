"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import jsPDF from "jspdf";
import { ChevronLeft, ChevronRight, FileText, X, Download } from "lucide-react";

// ✅ Caminhos das imagens (ficam na pasta /public)
const header1 = "/cabecalho-logo.png";
const header2 = "/cabecalho-logo2.png";
const footer = "/rodape.png";

export default function ResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const pageSize = 5;

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

  const closeModal = () => setSelectedResponse(null);

  // 🔹 Converte imagem em base64
  const getBase64FromUrl = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // 📄 Exportar PDF individual com layout profissional (baseado no seu exemplo)
  const exportSinglePDF = async (response) => {
    if (!response) return;

    const [header1Base64, header2Base64, footerBase64] = await Promise.all([
      getBase64FromUrl(header1),
      getBase64FromUrl(header2),
      getBase64FromUrl(footer),
    ]);

    const doc = new jsPDF("p", "pt", "a4");
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // 📐 Margens e proporções
    const M = 40;
    const HEADER_Y = 28;
    const HEADER_LEFT_H = 40;
    const HEADER_LEFT_MAX_W = 200;
    const HEADER_RIGHT_H = 34;
    const HEADER_RIGHT_MAX_W = 120;
    const HEADER_BOTTOM_MARGIN = 28;
    const FOOTER_IMG_H = 100;
    const FOOTER_IMG_MAX_W = 300;

    // 🔧 Função utilitária para dimensionar imagens
    const getDimByHeight = (img, targetH, maxW = 9999) => {
      const ratio = (img.width || 1) / (img.height || 1);
      let w = targetH * ratio;
      if (w > maxW) w = maxW;
      const h = w / ratio;
      return { w, h };
    };

    // 🔹 Header (posicionado igual ao seu exemplo)
    const leftDim = getDimByHeight({ width: 610, height: 100 }, HEADER_LEFT_H, HEADER_LEFT_MAX_W);
    doc.addImage(header1Base64, "PNG", M, HEADER_Y, leftDim.w, leftDim.h);

    const rightDim = getDimByHeight({ width: 610, height: 100 }, HEADER_RIGHT_H, HEADER_RIGHT_MAX_W);
    const rightX = pageW - M - rightDim.w;
    const rightY = HEADER_Y + Math.max(0, (leftDim.h - rightDim.h) / 2);
    doc.addImage(header2Base64, "PNG", rightX, rightY, rightDim.w, rightDim.h);

    let y = HEADER_Y + Math.max(leftDim.h, rightDim.h) + HEADER_BOTTOM_MARGIN;

    // 🔹 Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATÓRIO INDIVIDUAL DE RESPOSTAS", pageW / 2, y, { align: "center" });
    y += 26;

    // 🔹 Infos iniciais
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    doc.text(`Data de envio: ${new Date(response.dataEnvio).toLocaleString("pt-BR")}`, M, y);
    y += 30;

    // 🔹 Respostas formatadas
    Object.entries(response.respostas || {}).forEach(([pergunta, resposta]) => {
      if (y > pageH - 140) {
        doc.addPage();
        y = HEADER_Y + 50;
      }

      doc.setFont("helvetica", "bold");
      doc.setTextColor(25, 50, 120);
      doc.text(`${pergunta.replace("pergunta", "Pergunta ")}:`, M, y);
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(resposta, pageW - 2 * M);
      doc.text(lines, M + 10, y);
      y += lines.length * 14 + 10;
    });

    // 🔹 Rodapé (igual seu modelo)
    const footerDim = getDimByHeight({ width: 800, height: 200 }, FOOTER_IMG_H, FOOTER_IMG_MAX_W);
    const footerY = pageH - M - footerDim.h;

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.addImage(footerBase64, "PNG", M, footerY, footerDim.w, footerDim.h);
      doc.setFontSize(9);
      doc.text(`Página ${i} de ${pageCount}`, pageW - 70, pageH - 10);
    }

    doc.save(`resposta_${response.token}.pdf`);
  };

  // ======== JSX ========
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 p-8">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold mb-1 text-indigo-800 flex items-center gap-2">
          <FileText className="w-7 h-7" /> Respostas Coletadas
        </h2>
        <p className="text-gray-600">Visualize e exporte respostas individuais em PDF</p>

        {responses.length > 0 && (
          <div className="mt-4 inline-block bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
            <p className="text-sm text-gray-700">
              Total de respostas:{" "}
              <span className="font-semibold text-indigo-700 text-lg">{responses.length}</span>
            </p>
          </div>
        )}
      </div>

      {responses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-2xl bg-white shadow-inner">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-xl text-gray-600">Nenhuma resposta registrada ainda</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-8 md:grid-cols-2 lg:grid-cols-3">
            {paginated.map((r, i) => (
              <div
                key={r.token}
                onClick={() => setSelectedResponse(r)}
                className="cursor-pointer border border-gray-200 rounded-xl bg-white hover:bg-indigo-50 transition-all p-5 shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-lg flex items-center gap-2 text-indigo-700">
                      <FileText className="w-5 h-5" />
                      Resposta #{i + startIndex + 1}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Token: {r.token}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(r.dataEnvio).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
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
          <div className="bg-white text-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-200">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-200 rounded-lg"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-50">
              <img src={header1} alt="Logo 1" className="h-10 object-contain" />
              <h3 className="text-xl font-bold text-indigo-800 text-center flex-1">
                Relatório de Resposta
              </h3>
              <img src={header2} alt="Logo 2" className="h-10 object-contain" />
            </div>

            <div className="p-8">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500">
                  Enviada em {new Date(selectedResponse.dataEnvio).toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-gray-500">Token: {selectedResponse.token}</p>
              </div>

              <div className="space-y-5 mb-10">
                {Object.entries(selectedResponse.respostas || {}).map(
                  ([pergunta, resposta], i) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p className="font-semibold mb-2 text-indigo-800 text-sm uppercase tracking-wide">
                        {pergunta.replace("pergunta", "Pergunta ")}
                      </p>
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {resposta}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => exportSinglePDF(selectedResponse)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-md"
                >
                  <Download className="w-5 h-5" />
                  Exportar PDF
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md"
                >
                  Fechar
                </button>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-6 flex justify-center">
                <img src={footer} alt="Rodapé" className="h-20 object-contain ml-[-70vh]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
