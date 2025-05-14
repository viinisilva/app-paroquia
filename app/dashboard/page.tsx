"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Book, PlusCircle, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState("Usuário")

  useEffect(() => {
    try {
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem("churchAppCurrentUser") || "{}")
      if (currentUser && currentUser.nome) {
        setUserName(currentUser.nome.split(" ")[0]) // Use first name only
      }
    } catch (err) {
      console.error("Erro ao carregar dados do usuário:", err)
    }
  }, [])

  const handleLogout = () => {
    // Clear current user
    localStorage.removeItem("churchAppCurrentUser")
    router.push("/")
  }

  return (
    <div className="min-h-screen">
      <header className="church-header py-4 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative w-10 h-10 mr-3">
              <div className="absolute inset-0 rounded-full bg-amber-100 shadow-sm"></div>
              <Image
                src="/images/paroquia.jpg"
                alt="Paróquia"
                width={40}
                height={40}
                className="relative z-10 rounded-full object-cover border-2 border-amber-200"
              />
            </div>
            <h1 className="text-xl font-semibold text-white font-cinzel">App da Paróquia</h1>
          </div>
          <div className="flex items-center">
            <span className="mr-4 text-white">Olá, {userName}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-amber-800">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6 text-amber-900 font-cinzel">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="church-card overflow-hidden">
            <CardHeader className="church-card-header bg-gradient-to-r from-amber-50 to-amber-100 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg text-amber-900 font-cinzel">Missas</CardTitle>
              <Calendar className="h-5 w-5 text-amber-700" />
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold text-amber-900">12</p>
              <p className="text-sm text-amber-700">Missas agendadas</p>
              <Button
                className="w-full mt-4 church-button bg-amber-700 hover:bg-amber-800"
                onClick={() => router.push("/criar-missa")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Missa
              </Button>
            </CardContent>
          </Card>

          <Card className="church-card overflow-hidden">
            <CardHeader className="church-card-header bg-gradient-to-r from-amber-50 to-amber-100 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg text-amber-900 font-cinzel">Membros</CardTitle>
              <Users className="h-5 w-5 text-amber-700" />
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold text-amber-900">48</p>
              <p className="text-sm text-amber-700">Membros registrados</p>
              <Button className="w-full mt-4 church-button bg-amber-700 hover:bg-amber-800">Ver Membros</Button>
            </CardContent>
          </Card>

          <Card className="church-card overflow-hidden">
            <CardHeader className="church-card-header bg-gradient-to-r from-amber-50 to-amber-100 flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg text-amber-900 font-cinzel">Leituras</CardTitle>
              <Book className="h-5 w-5 text-amber-700" />
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold text-amber-900">24</p>
              <p className="text-sm text-amber-700">Leituras disponíveis</p>
              <Button className="w-full mt-4 church-button bg-amber-700 hover:bg-amber-800">Ver Leituras</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-amber-900 font-cinzel">Próximas Missas</h3>
          <div className="church-card overflow-hidden">
            <table className="min-w-full divide-y divide-amber-200 church-table">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">
                    Celebrante
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">15/05/2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">19:00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">Igreja Matriz</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">Pe. João</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">16/05/2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">08:00</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">Capela Santa Rita</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">Pe. Antônio</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">16/05/2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">19:30</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">Igreja Matriz</td>
                  <td className="px-6 py-4 whitespace-nowrap text-amber-800">Pe. João</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
