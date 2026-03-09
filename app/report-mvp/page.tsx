'use client'

import Link from 'next/link'
import { CheckCircle2, Sparkles, Zap, TrendingUp, FileText, Upload, Camera, Brain } from 'lucide-react'

export default function ReportMVPPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
              <Sparkles className="w-6 h-6" />
              <span className="font-semibold">MVP Completado</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-tight">
            Monetry
          </h1>

          <p className="text-xl sm:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Dashboard completo para registrar, visualizar y analizar todos los gastos e ingresos de tu negocio
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Resumen Ejecutivo */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12 border-t-4 border-emerald-500">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              ✅ Sistema 100% Funcional
            </h2>
          </div>

          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            Tu sistema financiero está <strong>completamente operativo</strong>. Puedes comenzar a usarlo hoy mismo
            para registrar transacciones, visualizar reportes y tomar decisiones informadas sobre tu negocio.
          </p>

          <div className="flex justify-center gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-8 rounded-xl text-center border-2 border-emerald-200 dark:border-emerald-800 max-w-sm">
              <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-3">8</div>
              <div className="text-gray-700 dark:text-gray-300 font-semibold text-lg">Features Core<br />Acordadas</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-8 rounded-xl text-center border-2 border-yellow-200 dark:border-yellow-800 max-w-sm">
              <div className="text-6xl font-bold text-yellow-600 dark:text-yellow-400 mb-3">+11</div>
              <div className="text-gray-700 dark:text-gray-300 font-semibold text-lg">Bonus Features<br />Sin Costo</div>
            </div>
          </div>
        </section>

        {/* Roadmap de Funcionalidades */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🚀 Roadmap de Implementación
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Todo lo que se construyó para tu sistema financiero
            </p>
          </div>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-emerald-500 hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Principal</h3>
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                      IMPLEMENTADO
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Panel de control con KPIs en tiempo real que muestra ingresos, gastos, balance neto y transacciones totales.
                    Incluye gráficas de tendencia de los últimos 30 días y vistas por día, semana y mes.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      📊 Gráficas interactivas
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      📈 Tendencias visuales
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      🌙 Modo oscuro
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-blue-500 hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Registro Manual de Transacciones</h3>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
                      IMPLEMENTADO
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Formulario completo para registrar gastos e ingresos manualmente. Soporta categorías predefinidas,
                    métodos de pago, número de pasajeros para tours y registro de quién hizo la transacción.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      ✏️ Formulario completo
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      🏷️ 14 categorías
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      👥 Tracking de usuarios
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-purple-500 hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Corte Diario de Ingresos</h3>
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold px-3 py-1 rounded-full">
                      IMPLEMENTADO
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Sistema de registro rápido para ingresos del día. Permite registrar múltiples tours o ventas
                    en batch con información de clientes, métodos de pago y cálculos automáticos de totales.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      ⚡ Registro rápido
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      💵 Batch processing
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      🧮 Cálculos automáticos
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4 - NEW */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-cyan-500 hover:shadow-2xl transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                NUEVO
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-lg">
                  <Upload className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Upload de CSV/Excel</h3>
                    <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold px-3 py-1 rounded-full">
                      IMPLEMENTADO
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Importa múltiples transacciones desde archivos CSV. Incluye plantilla descargable, validación
                    automática de datos, drag & drop, y reporte detallado de éxitos y errores.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      📄 Plantilla incluida
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      ✅ Validación automática
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      📊 Import batch
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5 - NEW */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-pink-500 hover:shadow-2xl transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                MEJORADO
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-lg">
                  <Camera className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">OCR con GPT-4 Vision</h3>
                    <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-xs font-bold px-3 py-1 rounded-full">
                      IMPLEMENTADO
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Sube fotos de tickets o facturas y el sistema automáticamente extrae: monto, comercio,
                    categoría sugerida, ítems comprados y fecha. Devuelve datos estructurados en JSON para uso programático.
                    Incluye soporte para pegar imágenes desde el portapapeles (Ctrl+V).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      🤖 AI-powered OCR
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      📸 Auto-extracción
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      🏷️ Categorización IA
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      📋 Ctrl+V para pegar
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 6 - NEW */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-amber-500 hover:shadow-2xl transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                NUEVO
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
                  <Brain className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Verificación Inteligente de Montos</h3>
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
                      IMPLEMENTADO
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Cuando registras un gasto con foto, el sistema compara el monto que declaraste con el del ticket.
                    Si hay diferencia mayor a $50 COP, te pregunta cuál es el correcto antes de registrar.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      🔍 Comparación automática
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      ⚠️ Alertas de discrepancia
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      ✅ Validación manual
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-indigo-500 hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
                  <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Agente IA Conversacional</h3>
                    <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">
                      IMPLEMENTADO
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Chat inteligente que entiende lenguaje natural. Registra gastos e ingresos hablando
                    de forma conversacional, con streaming en tiempo real y almacenamiento automático en base de datos.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      💬 Lenguaje natural
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      🌊 Streaming SSE
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      🧠 GPT-5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 8 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-teal-500 hover:shadow-2xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Vistas de Datos Personalizadas</h3>
                    <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs font-bold px-3 py-1 rounded-full">
                      IMPLEMENTADO
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    Filtra transacciones por día, semana, mes o rango personalizado. Tablas agrupadas con colores
                    diferenciados (verde para ingresos, rojo para gastos) y totales por período.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      📅 Filtros temporales
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      🎨 Colores diferenciados
                    </span>
                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded">
                      📊 Agrupación inteligente
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Valor Entregado */}
        <section className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl shadow-2xl p-8 sm:p-12 text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
            💰 Valor Real Entregado
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Precio Acordado */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border-2 border-white/30">
              <p className="text-emerald-100 text-lg mb-2">Precio Acordado</p>
              <p className="text-5xl font-bold">$1,500</p>
              <p className="text-emerald-100 text-sm mt-2">USD</p>
            </div>

            {/* Valor Real */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center border-2 border-white/30">
              <p className="text-emerald-100 text-lg mb-2">Valor Real del Sistema</p>
              <p className="text-5xl font-bold">$3,800</p>
              <p className="text-emerald-100 text-sm mt-2">USD</p>
            </div>
          </div>

          {/* Desglose de Valor */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-xl mb-4 text-center">Desglose por Funcionalidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <span>Dashboard interactivo con gráficas</span>
                <span className="font-bold">$800</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <span>Sistema de registro (4 métodos)</span>
                <span className="font-bold">$600</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <span>OCR con GPT-4 Vision</span>
                <span className="font-bold">$500</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <span>Upload CSV con validación</span>
                <span className="font-bold">$400</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <span>Agente IA con streaming</span>
                <span className="font-bold">$600</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <span>Verificación inteligente de montos</span>
                <span className="font-bold">$300</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <span>Vistas personalizadas y filtros</span>
                <span className="font-bold">$400</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                <span>Responsive + modo oscuro</span>
                <span className="font-bold">$200</span>
              </div>
            </div>
          </div>

          {/* Descuento */}
          <div className="mt-8 text-center">
            <p className="text-2xl font-bold">
              Descuento efectivo: <span className="text-yellow-300">-$2,300 USD (60% OFF)</span>
            </p>
            <p className="text-emerald-100 mt-2">
              Este precio especial es una inversión en construir portafolio y casos de éxito
            </p>
          </div>
        </section>

        {/* Bonus Features */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            🎁 Bonus Incluidos (No Pedidos)
          </h2>

          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            11 funcionalidades adicionales que agregamos sin costo extra
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">✨ Modo Oscuro Completo</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Todo el sistema funciona perfectamente en modo claro y oscuro, detectando automáticamente tus preferencias
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">📊 Paginación Avanzada</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Visualiza 50, 100 o 500 transacciones por página con controles intuitivos de navegación
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">🔄 Sorting por Columnas</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Ordena transacciones por fecha, monto, o categoría con un simple clic
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">🌊 Streaming en Tiempo Real</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Experiencia de chat tipo ChatGPT con respuestas que aparecen palabra por palabra
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-xl border-2 border-pink-200 dark:border-pink-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">🔍 Verificación de Montos</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Feature de seguridad que detecta discrepancias entre lo declarado y el ticket real
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">📄 Plantilla CSV Descargable</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Incluye plantilla lista para usar con todos los campos y formato correcto
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl border-2 border-teal-200 dark:border-teal-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">📅 Agrupación Inteligente</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Visualiza transacciones agrupadas por día, semana o mes automáticamente
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">🚀 Stack Moderno 2025</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Next.js 15, React 19, Tailwind v4 - tecnologías de última generación
              </p>
            </div>

            <div className="bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20 p-6 rounded-xl border-2 border-lime-200 dark:border-lime-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">📋 Pegar desde Portapapeles</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Toma screenshot (Ctrl+C) y pégalo directamente en el chat (Ctrl+V) - flujo ultra-rápido
              </p>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 p-6 rounded-xl border-2 border-sky-200 dark:border-sky-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">⏳ Estados de Loading Visuales</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Indicadores dentro del chat mostrando "Subiendo...", "Analizando...", "Pensando...", "Escribiendo..." en tiempo real
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-6 rounded-xl border-2 border-red-200 dark:border-red-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">🎨 Colores Mejorados de Filas</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Verde brillante para ingresos, rojo brillante para gastos - distinción visual instantánea en la tabla
              </p>
            </div>
          </div>
        </section>

        {/* Stack Tecnológico */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 sm:p-12 text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
            🔧 Stack Tecnológico
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-emerald-400 font-bold mb-2">Frontend</div>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Next.js 15.5.4 (App Router)</li>
                <li>• React 19 + TypeScript</li>
                <li>• Tailwind CSS v4</li>
                <li>• Recharts (gráficas)</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-blue-400 font-bold mb-2">Backend & Database</div>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• Next.js API Routes</li>
                <li>• Supabase (PostgreSQL)</li>
                <li>• Supabase Storage</li>
                <li>• Server-Sent Events (SSE)</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-purple-400 font-bold mb-2">IA & Servicios</div>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li>• OpenRouter API</li>
                <li>• GPT-4o (Vision OCR)</li>
                <li>• GPT-5 (Chat)</li>
                <li>• Function Calling</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cómo Empezar */}
        <section className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white rounded-2xl shadow-2xl p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
            🎯 Cómo Empezar a Usar el Sistema
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-white text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center text-lg">1</span>
                Accede al Dashboard
              </h3>
              <p className="text-emerald-100 mb-4">
                Abre tu navegador y visita el dashboard web:
              </p>
              <Link
                href="/"
                className="block bg-white text-emerald-600 px-6 py-3 rounded-lg font-bold text-center hover:bg-emerald-50 transition-colors"
              >
                Ir al Dashboard →
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-lg">2</span>
                Explora las Funcionalidades
              </h3>
              <p className="text-blue-100 mb-4">
                Desde el menú superior, accede a:
              </p>
              <ul className="space-y-2 text-cyan-100">
                <li>• 📊 Dashboard - Visualiza KPIs</li>
                <li>• ✏️ Registro - Agrega transacciones</li>
                <li>• 📅 Corte Diario - Ingresos rápidos</li>
                <li>• 📄 Upload CSV - Importa en batch</li>
                <li>• 🤖 Agente IA - Conversa y registra</li>
              </ul>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <p className="text-lg mb-4">
              ¿Necesitas ayuda? Revisa la documentación técnica completa
            </p>
            <Link
              href="/report"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors"
            >
              Ver Reporte Técnico Completo →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <section className="text-center text-gray-600 dark:text-gray-400 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-lg mb-2">
            Desarrollado por Monetry
          </p>
          <p className="text-sm">
            MVP completado y funcional · Octubre 2025
          </p>
        </section>
      </div>
    </div>
  )
}
