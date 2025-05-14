"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Calendar, Clock, MapPin, User, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default function CriarMissaPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    data: "",
    horario: "",
    local: "",
    celebrante: "",
    descricao: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (!formData.data || !formData.horario || !formData.local || !formData.celebrante) {
      setError("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    try {
      // Get existing missas or initialize empty array
      const existingMissas = JSON.parse(localStorage.getItem("churchAppMissas") || "[]")

      // Add new missa
      existingMissas.push(formData)

      // Sort by date and time
      existingMissas.sort((a: any, b: any) => {
        const dateA = new Date(`${a.data}T${a.horario}`)
        const dateB = new Date(`${b.data}T${b.horario}`)
        return dateA.getTime() - dateB.getTime()
      })

      // Save back to localStorage
      localStorage.setItem("churchAppMissas", JSON.stringify(existingMissas))

      // Show success message
      setError("")
      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      console.error("Erro ao salvar missa:", err)
      setError("Ocorreu um erro ao criar a missa. Por favor, tente novamente.")
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
            <h1 className="text-xl font-semibold text-white font-cinzel">Criar Nova Missa</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="church-card overflow-hidden">
          <CardHeader className="church-card-header bg-gradient-to-r from-amber-50 to-amber-100">
            <div className="flex justify-center mb-2">
              <div className="text-amber-800 text-2xl">✝</div>
            </div>
            <CardTitle className="text-center text-amber-900 font-cinzel">Detalhes da Missa</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <Check className="h-4 w-4 mr-2" />
                <AlertDescription>Missa criada com sucesso! Redirecionando para o dashboard...</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-amber-700" />
                  <label className="text-sm font-medium text-amber-800">Data *</label>
                </div>
                <Input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-amber-700" />
                  <label className="text-sm font-medium text-amber-800">Horário *</label>
                </div>
                <Input
                  type="time"
                  name="horario"
                  value={formData.horario}
                  onChange={handleChange}
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-amber-700" />
                  <label className="text-sm font-medium text-amber-800">Local *</label>
                </div>
                <Select value={formData.local} onValueChange={(value) => handleSelectChange("local", value)}>
                  <SelectTrigger className="border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Igreja Matriz">Igreja Matriz</SelectItem>
                    <SelectItem value="Capela Santa Rita">Capela Santa Rita</SelectItem>
                    <SelectItem value="Capela São José">Capela São José</SelectItem>
                    <SelectItem value="Salão Paroquial">Salão Paroquial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-amber-700" />
                  <label className="text-sm font-medium text-amber-800">Celebrante *</label>
                </div>
                <Select value={formData.celebrante} onValueChange={(value) => handleSelectChange("celebrante", value)}>
                  <SelectTrigger className="border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                    <SelectValue placeholder="Selecione o celebrante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pe. João">Pe. João</SelectItem>
                    <SelectItem value="Pe. Antônio">Pe. Antônio</SelectItem>
                    <SelectItem value="Pe. Pedro">Pe. Pedro</SelectItem>
                    <SelectItem value="Pe. Lucas">Pe. Lucas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-800">Descrição (opcional)</label>
                <Textarea
                  name="descricao"
                  placeholder="Informações adicionais sobre a missa..."
                  value={formData.descricao}
                  onChange={handleChange}
                  rows={4}
                  className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="border-amber-300 text-amber-800 hover:bg-amber-50"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="church-button bg-amber-700 hover:bg-amber-800">
                  Criar Missa
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
