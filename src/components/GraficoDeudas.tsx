import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import type { DatosGrafico } from '../types'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  datosGrafico: DatosGrafico
}

const GraficoDeudas = ({ datosGrafico }: Props) => {
  const opciones = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolución de Deudas por Entidad y Período',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || ''
            const valor = context.parsed.y
            return `${label}: $${valor.toLocaleString('es-AR')}`
          }
        }
      },
    },
    hover: {
      mode: 'nearest' as const,
      intersect: true,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Período',
          font: {
            weight: 'bold' as const,
          },
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Monto ($)',
          font: {
            weight: 'bold' as const,
          },
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString('es-AR')
          }
        }
      },
    },
  }

  return (
    <div className="grafico-container">
      <Line data={datosGrafico} options={opciones} />
    </div>
  )
}

export default GraficoDeudas
