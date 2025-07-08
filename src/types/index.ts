// Tipos para la respuesta de la API del BCRA

export interface Entidad {
  entidad: string
  situacion: number
  monto: number
  enRevision: boolean
  procesoJud: boolean
}

export interface Periodo {
  periodo: string
  entidades: Entidad[]
}

export interface ResultadoBCRA {
  identificacion: number
  denominacion: string
  periodos: Periodo[]
}

export interface ResponseBCRA {
  status: number
  results: ResultadoBCRA
}

export interface DatosGrafico {
  labels: string[]
  datasets: DatasetGrafico[]
}

export interface DatasetGrafico {
  label: string
  data: (number | null)[]
  borderColor: string
  backgroundColor: string
  tension: number
  spanGaps?: boolean
  pointBackgroundColor?: (string | undefined)[]
  pointBorderColor?: (string | undefined)[]
  situaciones?: (number | null)[]
}
