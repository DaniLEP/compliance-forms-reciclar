// "use client"

import { useEffect, useState } from "react"
import { ref, onValue, set } from "firebase/database"
import { db } from "../../firebase"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  Legend as PieLegend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, CheckCircle2, Clock, Send, Copy } from "lucide-react"

export default function TokenList() {
  const [tokens, setTokens] = useState([])
  const [filterUsed, setFilterUsed] = useState("all")
  const [filterSent, setFilterSent] = useState("all")
  const [loading, setLoading] = useState(true)
  const [copiedToken, setCopiedToken] = useState(null)

  useEffect(() => {
    const tokensRef = ref(db, "tokens")
    const unsubscribe = onValue(tokensRef, (snapshot) => {
      const data = snapshot.val()
      const list = Object.entries(data || {}).map(([token, info]) => ({
        token,
        ...info,
      }))
      setTokens(list)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Envio via Gmail
  const handleSendEmail = async (user) => {
    if (user.sent) {
      alert("Este token já foi enviado!")
      return
    }

    const baseFormURL = "https://formulario-complicance-instituto-re.vercel.app/"
    const message = `Olá ${user.name},%0A%0AAcesse o formulário pelo link:%0A${baseFormURL}%0A%0ACole seu token no campo indicado para liberar o formulário.%0A%0ASeu token: ${user.token}`

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}&su=Token de Acesso - Compliance Forms&body=${message}`,
      "_blank",
    )

    try {
      await set(ref(db, `tokens/${user.token}/sent`), true)
    } catch (err) {
      console.error(err)
    }
  }

  // Envio via WhatsApp (não marca como enviado)
  const handleSendWhatsApp = (user) => {
    if (!user.phone) {
      alert("Usuário sem número de WhatsApp cadastrado!")
      return
    }

    const baseFormURL = "https://formulario-complicance-instituto-re.vercel.app/"
    const message = `Olá ${user.name},%0A%0AAcesse o formulário pelo link:%0A${baseFormURL}%0A%0ACole seu token no campo indicado para liberar o formulário.%0A%0ASeu token: ${user.token}`

    const phone = user.phone.replace(/\D/g, "")
    const whatsappURL = `https://wa.me/${phone}?text=${message}`

    window.open(whatsappURL, "_blank")
  }

  // Copiar token
  const handleCopyToken = (token) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  // Filtros
  const filteredTokens = tokens.filter((t) => {
    let usedCondition = true
    let sentCondition = true

    if (filterUsed === "used") usedCondition = t.used
    else if (filterUsed === "unused") usedCondition = !t.used

    if (filterSent === "sent") sentCondition = t.sent
    else if (filterSent === "notSent") sentCondition = !t.sent

    return usedCondition && sentCondition
  })

  // Estatísticas
  const usedCount = filteredTokens.filter((t) => t.used).length
  const unusedCount = filteredTokens.length - usedCount
  const sentCount = filteredTokens.filter((t) => t.sent).length
  const notSentCount = filteredTokens.length - sentCount

  const pieData = [
    { name: "Preenchido", value: usedCount },
    { name: "Não preenchido", value: unusedCount },
  ]

  const barData = [
    { status: "Enviados", count: sentCount },
    { status: "Não enviados", count: notSentCount },
  ]

  const COLORS = ["#0b6be9ff", "#4a157aff"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando tokens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel de Controle</h1>
          <p className="text-muted-foreground">Gerencie tokens de acesso e acompanhe o status dos envios</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Tokens</p>
                <p className="text-2xl font-bold text-foreground">{tokens.length}</p>
              </div>
              <Mail className="h-8 w-8 text-primary opacity-20" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enviados</p>
                <p className="text-2xl font-bold text-foreground">{sentCount}</p>
              </div>
              <Send className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preenchidos</p>
                <p className="text-2xl font-bold text-foreground">{usedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-20" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-foreground">{notSentCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status do Formulário</label>
              <select
                value={filterUsed}
                onChange={(e) => setFilterUsed(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos</option>
                <option value="used">Preenchidos</option>
                <option value="unused">Não preenchidos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status de Envio</label>
              <select
                value={filterSent}
                onChange={(e) => setFilterSent(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos</option>
                <option value="sent">Enviados</option>
                <option value="notSent">Não enviados</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Status dos Formulários</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip />
                <PieLegend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Status dos Envios</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="status" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
                  labelStyle={{ color: "var(--foreground)" }}
                />
                <Legend />
                <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            {filteredTokens.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum token encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Nome</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Token</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Formulário</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Envio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((t) => (
                    <tr key={t.token} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">{t.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{t.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">
                            {t.token.substring(0, 8)}...
                          </code>
                          <button
                            onClick={() => handleCopyToken(t.token)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Copiar token completo"
                          >
                            <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          {copiedToken === t.token && <span className="text-xs text-green-600">Copiado!</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            t.used ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {t.used ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Preenchido
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              Pendente
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            t.sent ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {t.sent ? (
                            <>
                              <Send className="h-3 w-3" />
                              Enviado
                            </>
                          ) : (
                            <>
                              <Mail className="h-3 w-3" />
                              Não enviado
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {!t.sent && (
                            <Button onClick={() => handleSendEmail(t)} className="text-xs" size="sm">
                              <Send className="h-3 w-3 mr-1" />
                              Gmail
                            </Button>
                          )}
                          <Button onClick={() => handleSendWhatsApp(t)} className="text-xs" size="sm" variant="outline">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-4 w-4 mr-1 text-green-600"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.1-.472-.149-.672.15-.197.297-.771.966-.945 1.164-.173.198-.348.223-.645.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.1-.198.05-.373-.025-.522-.075-.149-.672-1.611-.921-2.206-.242-.58-.487-.502-.672-.512-.173-.009-.373-.011-.573-.011-.198 0-.522.074-.796.372-.273.297-1.045 1.02-1.045 2.48 0 1.46 1.07 2.876 1.219 3.074.149.198 2.105 3.21 5.1 4.505.714.308 1.27.493 1.703.63.715.228 1.366.195 1.88.118.573-.086 1.758-.718 2.006-1.412.248-.694.248-1.29.173-1.412-.074-.123-.272-.198-.57-.347z" />
                              <path d="M12.004 2.003c-5.525 0-10.002 4.477-10.002 10.002 0 1.764.46 3.49 1.332 5.013L2 22l5.1-1.327a9.965 9.965 0 0 0 4.904 1.25h.004c5.524 0 10.002-4.478 10.002-10.002 0-2.67-1.04-5.182-2.928-7.07A9.965 9.965 0 0 0 12.004 2.003zM12 20.002h-.003a8.274 8.274 0 0 1-4.205-1.155l-.302-.179-3.03.789.808-2.957-.197-.305A8.27 8.27 0 0 1 3.727 12c0-4.565 3.709-8.274 8.277-8.274a8.24 8.24 0 0 1 5.871 2.429A8.228 8.228 0 0 1 20.275 12c0 4.566-3.71 8.274-8.275 8.274z" />
                            </svg>
                            WhatsApp
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
