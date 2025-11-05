export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
      <h1 className="font-bold text-lg">Compliance Forms - Instituto Reciclar</h1>
      <div className="space-x-4">
        <a href="/dashboard" className="hover:underline">Painel</a>
        <a href="/responses" className="hover:underline">Respostas</a>
      </div>
    </nav>
  );
}
