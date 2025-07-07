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
            situacion: 1,
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
            situacion: 1,
            monto: 866.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BANCO GALICIA",
            situacion: 1,
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
            situacion: 1,
            monto: 1202.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BANCO GALICIA",
            situacion: 1,
            monto: 1300.0,
            enRevision: false,
            procesoJud: false
          },
          {
            entidad: "BBVA",
            situacion: 1,
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
            situacion: 1,
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
            situacion: 1,
            monto: 300.0,
            enRevision: false,
            procesoJud: false
          }
        ]
      }
    ]
  }
}
