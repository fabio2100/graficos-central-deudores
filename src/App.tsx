import { useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import axios from 'axios'
import GraficoDeudas from './components/GraficoDeudas'
import type { ResponseBCRA, DatosGrafico } from './types'
import './App.css'

function App() {
  const [cuit, setCuit] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [datosGrafico, setDatosGrafico] = useState<DatosGrafico | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [mostrarResultados, setMostrarResultados] = useState(false)

  // Función para limpiar el CUIT y dejar solo números
  const limpiarCuit = (valor: string): string => {
    return valor.replace(/\D/g, '')
  }

  // Función para formatear el CUIT con guiones
  const formatearCuit = (valor: string): string => {
    const numerosSolos = limpiarCuit(valor)
    
    if (numerosSolos.length <= 2) {
      return numerosSolos
    } else if (numerosSolos.length <= 10) {
      return `${numerosSolos.slice(0, 2)}-${numerosSolos.slice(2)}`
    } else {
      return `${numerosSolos.slice(0, 2)}-${numerosSolos.slice(2, 10)}-${numerosSolos.slice(10, 11)}`
    }
  }

  // Manejar cambios en el input
  const manejarCambioCuit = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    const numerosSolos = limpiarCuit(valor)
    
    // Limitar a 11 dígitos máximo
    if (numerosSolos.length <= 11) {
      setCuit(formatearCuit(valor))
    }
  }

  // Manejar paste en el input
  const manejarPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const textoCopiado = e.clipboardData.getData('text')
    const numerosSolos = limpiarCuit(textoCopiado)
    
    if (numerosSolos.length <= 11) {
      setCuit(formatearCuit(textoCopiado))
    }
  }

  // Función para generar colores únicos para cada entidad
  const generarColores = (cantidad: number): string[] => {
    const colores = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c',
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
      '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
      '#ff9a9e', '#fecfef', '#ffeaa7', '#fab1a0'
    ]
    
    // Si necesitamos más colores, generamos algunos adicionales
    while (colores.length < cantidad) {
      const hue = Math.floor(Math.random() * 360)
      colores.push(`hsl(${hue}, 70%, 60%)`)
    }
    
    return colores.slice(0, cantidad)
  }

  // Función para obtener color basado en la situación (1=verde, 5=rojo)
  const obtenerColorPorSituacion = (situacion: number): string => {
    // Normalizar situación de 1-5 a 0-1
    const normalizado = (situacion - 1) / 4
    
    // Interpolar entre verde y rojo
    const rojo = Math.round(normalizado * 255)
    const verde = Math.round((1 - normalizado) * 255)
    
    return `rgb(${rojo}, ${verde}, 0)`
  }

  // Función para procesar los datos de la API y crear el gráfico
  const procesarDatosParaGrafico = (resultados: ResponseBCRA['results']): DatosGrafico => {
    // Obtener todos los períodos únicos y ordenarlos
    const periodosUnicos = resultados.periodos
      .map(p => p.periodo)
      .sort()
    
    // Obtener todas las entidades únicas que tengan al menos un período con situacion 1
    const entidadesUnicas = [...new Set(
      resultados.periodos
        .flatMap(periodo => 
          periodo.entidades
            .filter(entidad => entidad.situacion > 0)
            .map(entidad => entidad.entidad)
        )
    )]
    
    // Generar colores para cada entidad + 1 para el total
    const colores = generarColores(entidadesUnicas.length + 1)
    
    // Crear datasets para cada entidad
    const datasets = entidadesUnicas.map((nombreEntidad, index) => {
      // Crear array de datos, colores y situaciones para cada período
      const datosEntidad: (number | null)[] = []
      const coloresPuntos: (string | undefined)[] = []
      const situacionesEntidad: (number | null)[] = []
      
      periodosUnicos.forEach(periodo => {
        // Buscar el período correspondiente
        const periodoData = resultados.periodos.find(p => p.periodo === periodo)
        if (!periodoData) {
          datosEntidad.push(null)
          coloresPuntos.push(undefined)
          situacionesEntidad.push(null)
          return
        }
        
        // Buscar la entidad en ese período
        const entidadData = periodoData.entidades.find(e => e.entidad === nombreEntidad)
        
        // Si no existe la entidad o tiene situacion 0, devolver null (no se mostrará el punto)
        if (!entidadData || entidadData.situacion === 0) {
          datosEntidad.push(null)
          coloresPuntos.push(undefined)
          situacionesEntidad.push(null)
        } else {
          datosEntidad.push(entidadData.monto)
          coloresPuntos.push(obtenerColorPorSituacion(entidadData.situacion))
          situacionesEntidad.push(entidadData.situacion)
        }
      })
      
      return {
        label: nombreEntidad,
        data: datosEntidad,
        borderColor: colores[index],
        backgroundColor: colores[index] + '20', // Transparencia del 20%
        tension: 0.4,
        spanGaps: false, // No conectar líneas cuando hay valores null
        pointBackgroundColor: coloresPuntos,
        pointBorderColor: coloresPuntos,
        situaciones: situacionesEntidad
      }
    })
    
    // Agregar línea de total (solo si hay más de una entidad con deuda en al menos un período)
    const datosTotal = periodosUnicos.map(periodo => {
      // Buscar el período correspondiente
      const periodoData = resultados.periodos.find(p => p.periodo === periodo)
      if (!periodoData) return null
      
      // Contar entidades con situacion mayor a 0 en este período
      const entidadesActivas = periodoData.entidades.filter(entidad => entidad.situacion > 0)
      
      // Si hay solo una entidad activa o ninguna, no mostrar el total
      if (entidadesActivas.length <= 1) {
        return null
      }
      
      // Sumar solo los montos de las entidades con situacion mayor a 0
      const total = entidadesActivas.reduce((suma, entidad) => suma + entidad.monto, 0)
      
      return total > 0 ? total : null
    })
    
    // Solo agregar la línea total si tiene al menos un valor válido (no null)
    const tieneValoresTotal = datosTotal.some(valor => valor !== null)
    
    if (tieneValoresTotal) {
      // Crear array de colores y situaciones para la línea total (color uniforme)
      const coloresTotal = datosTotal.map(valor => 
        valor !== null ? '#FF6B6B' : undefined
      )
      const situacionesTotal = datosTotal.map(() => null) // La línea total no tiene situación específica
      
      datasets.push({
        label: 'Total',
        data: datosTotal,
        borderColor: '#FF6B6B', // Color rojo distintivo para el total
        backgroundColor: '#FF6B6B20', // Transparencia del 20%
        tension: 0.4,
        spanGaps: false, // No conectar líneas cuando hay valores null
        pointBackgroundColor: coloresTotal,
        pointBorderColor: coloresTotal,
        situaciones: situacionesTotal
      })
    }
    
    return {
      labels: periodosUnicos,
      datasets
    }
  }

  // Función para buscar deudas
  const buscarDeudas = async () => {
    const cuitLimpio = limpiarCuit(cuit)
    
    if (cuitLimpio.length !== 11) {
      setMensaje('El CUIT debe tener 11 dígitos')
      setMostrarResultados(true)
      return
    }

    setIsLoading(true)
    setMensaje('')
    setMostrarResultados(false)
    setDatosGrafico(null)
    
    try {
      const url = `https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/Historicas/${cuitLimpio}`
      console.log('Realizando petición a:', url)
      
      const response = await axios.get<ResponseBCRA>(url)
      console.log('Respuesta de la API:', response.data)
      
      if (response.status === 200) {
        if (response.data.results && response.data.results.periodos && response.data.results.periodos.length > 0) {
          // Procesar los datos para el gráfico
          const datosParaGrafico = procesarDatosParaGrafico(response.data.results)
          setDatosGrafico(datosParaGrafico)
          setMensaje(response.data.results.denominacion)
        } else {
          setMensaje('No se encontraron deudas para este CUIT')
        }
        setMostrarResultados(true)
      }
      
    } catch (error) {
      console.error('Error en la petición:', error)
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          setMensaje('CUIT no encontrado')
        } else {
          setMensaje(`Error ${error.response?.status}: ${error.response?.statusText || 'Error en la consulta'}`)
        }
        console.error('Detalles del error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        })
      } else {
        setMensaje('Error de conexión. Verifique su internet.')
      }
      setMostrarResultados(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar presión de Enter
  const manejarEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      buscarDeudas()
    }
  }

  return (
    <>
      <div className="app-header">
        <h1>Central Deudores</h1>
      </div>
      <div className="search-container">
        <div className="search-form">
          <input
            type="text"
            value={cuit}
            onChange={manejarCambioCuit}
            onKeyDown={manejarEnter}
            onPaste={manejarPaste}
            placeholder="Ingrese CUIT"
            className="cuit-input"
            maxLength={13} // 11 números + 2 guiones
          />
          <button 
            onClick={buscarDeudas}
            disabled={isLoading}
            className="search-button"
          >
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>
      
      {mostrarResultados && (
        <div className="results-container">
          {mensaje && (
            <div className={`mensaje ${datosGrafico ? 'mensaje-exito' : 'mensaje-error'}`}>
              {mensaje}
            </div>
          )}
          
          {datosGrafico && (
            <div className="grafico-wrapper">
              <GraficoDeudas datosGrafico={datosGrafico} />
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default App
