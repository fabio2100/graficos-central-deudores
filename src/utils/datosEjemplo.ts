// Datos de ejemplo para testing local con estructura real de la API BCRA
export const datosEjemplo = {
  status: 200,
  results: {
    identificacion: 20123456789,
    denominacion: "EMPRESA DE EJEMPLO S.A.",
    periodos: [
      {
        periodo: "202506",
        entidades: [
          {
            entidad: "BANCO SANTANDER ARGENTINA S.A.",
            situacion: 2, // Situación 2 - Verde-amarillo
            monto: 2000.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BANCO GALICIA",
            situacion: 0, // Sin deuda
            monto: 0.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BBVA",
            situacion: 0, // Sin deuda
            monto: 0.0,
            enRevision: false,
            procesoJud: false
          }
        ]
      },
      {
        periodo: "202505",
        entidades: [
          {
            entidad: "BANCO SANTANDER ARGENTINA S.A.",
            situacion: 1, // Situación 1 - Verde
            monto: 866.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BANCO GALICIA",
            situacion: 3, // Situación 3 - Amarillo
            monto: 1500.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BBVA",
            situacion: 0, // Sin deuda - no se mostrará
            monto: 0.0,
            enRevision: false,
            procesoJud: false
          }
        ]
      },
      {
        periodo: "202504",
        entidades: [
          {
            entidad: "BANCO SANTANDER ARGENTINA S.A.",
            situacion: 4, // Situación 4 - Naranja-rojo
            monto: 1202.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BANCO GALICIA",
            situacion: 2, // Situación 2 - Verde-amarillo
            monto: 1300.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BBVA",
            situacion: 5, // Situación 5 - Rojo (máximo)
            monto: 400.0,
            enRevision: false,
            procesoJud: false
          }
        ]
      },
      {
        periodo: "202503",
        entidades: [
          {
            entidad: "BANCO SANTANDER ARGENTINA S.A.",
            situacion: 3, // Situación 3 - Amarillo
            monto: 1567.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BANCO GALICIA",
            situacion: 0, // Sin deuda - no se mostrará
            monto: 0.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BBVA",
            situacion: 1, // Situación 1 - Verde
            monto: 300.0,
            enRevision: false,
            procesoJud: false
          }
        ]
      }
    ]
  }
}
