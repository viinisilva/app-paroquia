"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Membro {
  nome: string
  email: string
  telefone: string
  comunidade: string
}

export default function MembrosPage() {
  const router = useRouter()
  const [membros, setMembros] = useState<Membro[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem("churchAppUsers") || "[]")
      setMembros(users)
    } catch (err) {
      console.error("Erro ao carregar membros:", err)
    }
  }, [])

  // Filtrar membros com base no termo de pesquisa
  const filteredMembros = membros.filter(
    (membro) =>
      membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membro.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membro.telefone.includes(searchTerm),
  )

  // Mapear valores de comunidade para nomes mais amigáveis
  const getComunidadeNome = (codigo: string) => {
    switch (codigo) {
      case "matriz":
        return "Igreja Matriz"
      case "santa-rita":
        return "Capela Santa Rita"
      case "sao-jose":
        return "Capela São José"
      case "outra":
        return "Outra"
      default:
        return "Não especificada"
    }
  }

  return (
    <div className="min-h-screen">
      <header className="church-header py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="mr-2 text-white hover:bg-amber-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-3">
              <Image
                src="/images/logo.png"
                alt="Paróquia São Roque"
                width={32}
                height={32}
                className="relative z-10 rounded-full object-cover"
              />
            </div>
            <h1 className="text-xl font-semibold text-white font-cinzel">Membros da Paróquia</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="church-card overflow-hidden mb-6">
          <CardHeader className="church-card-header bg-gradient-to-r from-amber-50 to-amber-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-amber-700 mr-2" />
                <CardTitle className="text-amber-900 font-cinzel">Lista de Membros</CardTitle>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-700" />
                <Input
                  placeholder="Buscar membro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 border-amber-200 focus:border-amber-400 focus:ring-amber-400 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {filteredMembros.length > 0 ? (
              <div className="space-y-4">
                {filteredMembros.map((membro, index) => (
                  <Card key={index} className="border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-amber-900">{membro.nome}</h3>
                          <p className="text-amber-800">{membro.email}</p>
                          <p className="text-amber-700">{membro.telefone}</p>
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300">
                          {getComunidadeNome(membro.comunidade)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-amber-800">
                  {searchTerm ? "Nenhum membro encontrado com esse termo." : "Nenhum membro cadastrado."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
