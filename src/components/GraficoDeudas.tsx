import { useState, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import type { ResultadoBCRA, Entidad, Periodo } from '../types';
import { datosEjemplo } from '../utils/datosEjemplo';

// Función para obtener el color según la situación (para tarjetas y chips)
const obtenerColorSituacion = (situacion: number): string => {
  switch (situacion) {
    case 0: return '#4caf50'; // Verde - Sin deuda
    case 1: return '#81c784'; // Verde claro - Normal
    case 2: return '#ffb74d'; // Amarillo - Con seguimiento
    case 3: return '#ff8a65'; // Naranja - En problemas
    case 4: return '#e57373'; // Rojo claro - Irrecuperable prejudicial
    case 5: return '#f44336'; // Rojo - Irrecuperable por disposición técnica
    case 6: return '#9c27b0'; // Morado - Irrecuperable por disposición técnica
    default: return '#757575'; // Gris por defecto
  }
};

// Función para obtener el texto de la situación
const obtenerTextoSituacion = (situacion: number): string => {
  switch (situacion) {
    case 0: return 'Sin deuda';
    case 1: return 'Normal';
    case 2: return 'Con seguimiento';
    case 3: return 'En problemas';
    case 4: return 'Irrecuperable prejudicial';
    case 5: return 'Irrecuperable técnica';
    case 6: return 'Irrecuperable técnica';
    default: return 'Desconocida';
  }
};

// Función para obtener el icono según la situación
const obtenerIconoSituacion = (situacion: number) => {
  if (situacion === 0 || situacion === 1) return <CheckCircleIcon />;
  if (situacion === 2 || situacion === 3) return <WarningIcon />;
  return <ErrorIcon />;
};

// Función para formatear el número mientras se escribe
const formatearNumero = (valor: string): string => {
  // Remover todo lo que no sea dígito
  const numeros = valor.replace(/\D/g, '');
  
  // Limitar a 11 dígitos
  const numeroLimitado = numeros.slice(0, 11);
  
  // Formatear como XX-XXXXXXXX-X si tiene suficientes dígitos
  if (numeroLimitado.length >= 3 && numeroLimitado.length <= 11) {
    if (numeroLimitado.length <= 2) {
      return numeroLimitado;
    } else if (numeroLimitado.length <= 10) {
      return `${numeroLimitado.slice(0, 2)}-${numeroLimitado.slice(2)}`;
    } else {
      return `${numeroLimitado.slice(0, 2)}-${numeroLimitado.slice(2, 10)}-${numeroLimitado.slice(10)}`;
    }
  }
  
  return numeroLimitado;
};

// Función para validar dígito verificador de CUIT/CUIL
const validarCuitCuil = (numero: string): boolean => {
  const numeroLimpio = numero.replace(/\D/g, '');
  
  if (numeroLimpio.length !== 11) return false;
  
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  
  for (let i = 0; i < 10; i++) {
    suma += parseInt(numeroLimpio[i]) * multiplicadores[i];
  }
  
  const resto = suma % 11;
  let digitoVerificador = 11 - resto;
  
  if (digitoVerificador === 11) digitoVerificador = 0;
  if (digitoVerificador === 10) digitoVerificador = 9;
  
  return digitoVerificador === parseInt(numeroLimpio[10]);
};

const GraficoDeudas = () => {
  const [numeroIdentificacion, setNumeroIdentificacion] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [datosConsulta, setDatosConsulta] = useState<ResultadoBCRA | null>(null);
  const [error, setError] = useState<string>('');

  // Manejar cambio en el input con formateo automático
  const manejarCambioNumero = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormateado = formatearNumero(event.target.value);
    setNumeroIdentificacion(valorFormateado);
    
    // Limpiar error si existe
    if (error) setError('');
  };

  // Función para buscar deudor en la API del BCRA
  const buscarDeudor = async () => {
    if (!numeroIdentificacion.trim()) {
      setError('Por favor ingrese un número de identificación');
      return;
    }

    // Validar formato básico del CUIT/CUIL (11 dígitos)
    const numeroLimpio = numeroIdentificacion.replace(/\D/g, '');
    if (numeroLimpio.length !== 11) {
      setError('El número de CUIT/CUIL debe tener 11 dígitos');
      return;
    }

    // Validar dígito verificador
    if (!validarCuitCuil(numeroIdentificacion)) {
      setError('El número de CUIT/CUIL no es válido (dígito verificador incorrecto)');
      return;
    }

    setCargando(true);
    setError('');
    
    try {
      // URL correcta de la API del BCRA para Central de Deudores (Deudas Históricas)
      const url = `https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/Historicas/${numeroLimpio}`;
      
      console.log('Consultando API del BCRA:', url);
      
      const response = await axios.get(url, {
        timeout: 30000, // 30 segundos de timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Central-Deudores-App/1.0'
        }
      });

      if (response.data && response.data.results) {
        setDatosConsulta(response.data.results);
        console.log('Datos recibidos:', response.data.results);
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
      
    } catch (error: unknown) {
      console.error('Error al consultar la API:', error);
      
      let mensajeError = 'Error al consultar la información. ';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          mensajeError += 'No se encontraron datos para este número de identificación.';
        } else if (error.response?.status === 400) {
          mensajeError += 'El número de identificación no es válido.';
        } else if (error.response?.status === 429) {
          mensajeError += 'Demasiadas consultas. Intente nuevamente en unos minutos.';
        } else if (error.response?.status && error.response.status >= 500) {
          mensajeError += 'El servicio no está disponible temporalmente.';
        } else if (error.code === 'ECONNABORTED') {
          mensajeError += 'La consulta tardó demasiado tiempo. Intente nuevamente.';
        } else if (error.code === 'ERR_NETWORK') {
          mensajeError += 'No hay conexión a internet o el servicio no está disponible.';
        } else {
          mensajeError += 'Intente nuevamente más tarde.';
        }
      } else {
        mensajeError += 'Intente nuevamente más tarde.';
      }
      
      setError(mensajeError);
      
      // En caso de error, mostrar datos de ejemplo para testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Usando datos de ejemplo en modo desarrollo');
        setTimeout(() => {
          setDatosConsulta(datosEjemplo.results);
          setError('⚠️ Mostrando datos de ejemplo (API no disponible)');
        }, 1000);
      }
    } finally {
      setCargando(false);
    }
  };

  // Preparar datos para el gráfico
  const datosGrafico = useMemo(() => {
    if (!datosConsulta?.periodos) return null;

    const entidadesUnicas = Array.from(
      new Set(
        datosConsulta.periodos.flatMap((periodo: Periodo) => 
          periodo.entidades.map((entidad: Entidad) => entidad.entidad)
        )
      )
    );

    // Ordenar períodos cronológicamente (más antiguo primero, más reciente último)
    const periodosOrdenados = [...datosConsulta.periodos].sort((a, b) => 
      parseInt(a.periodo) - parseInt(b.periodo)
    );

    const xAxisData = periodosOrdenados.map((periodo: Periodo) => {
      const año = periodo.periodo.substring(0, 4);
      const mes = periodo.periodo.substring(4, 6);
      return `${mes}/${año}`;
    });

    // Crear series para cada entidad
    const series = entidadesUnicas.map((nombreEntidad, index) => {
      const datos: (number | null)[] = [];

      periodosOrdenados.forEach((periodo: Periodo) => {
        const entidad = periodo.entidades.find((e: Entidad) => e.entidad === nombreEntidad);
        if (entidad && entidad.situacion !== 0) {
          // Solo agregar el punto si la situación no es 0
          datos.push(entidad.monto);
        } else {
          // Si no hay entidad o situación es 0, usar null para no dibujar el punto
          datos.push(null);
        }
      });

      const coloresLinea = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0', '#d32f2f'];
      
      return {
        data: datos,
        label: nombreEntidad,
        color: coloresLinea[index % coloresLinea.length],
      };
    });

    // Calcular la suma total por período y verificar si mostrar puntos
    const datosTotal: (number | null)[] = [];
    
    periodosOrdenados.forEach((periodo: Periodo) => {
      const entidadesConDeuda = periodo.entidades.filter((entidad: Entidad) => entidad.monto > 0);
      const totalPeriodo = periodo.entidades.reduce((suma: number, entidad: Entidad) => suma + entidad.monto, 0);
      
      // Solo mostrar punto de total si hay más de 1 entidad con deuda
      if (entidadesConDeuda.length > 1) {
        datosTotal.push(totalPeriodo);
      } else {
        datosTotal.push(null);
      }
    });

    // Agregar la serie de total
    series.push({
      data: datosTotal,
      label: 'Total General',
      color: '#ff9800', // Color naranja para destacar
    });

    return { xAxisData, series };
  }, [datosConsulta]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    if (!datosConsulta?.periodos) return null;

    const ultimoPeriodo = datosConsulta.periodos[datosConsulta.periodos.length - 1];
    const totalDeuda = ultimoPeriodo.entidades.reduce((sum: number, entidad: Entidad) => sum + entidad.monto, 0);
    const entidadesConDeuda = ultimoPeriodo.entidades.filter((entidad: Entidad) => entidad.monto > 0).length;
    const totalEntidades = ultimoPeriodo.entidades.length;
    const situacionMasAlta = Math.max(...ultimoPeriodo.entidades.map((entidad: Entidad) => entidad.situacion));

    return {
      totalDeuda,
      entidadesConDeuda,
      totalEntidades,
      situacionMasAlta,
    };
  }, [datosConsulta]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Sección de búsqueda */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon />
          Consulta de Central de Deudores
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ingrese un número de CUIT/CUIL válido para consultar el historial de deudas en el BCRA.
          <br />
          <strong>Nota:</strong> Esta consulta accede a las deudas históricas registradas en la Central de Deudores del BCRA.
          <br />
          <strong>Ejemplo para testing:</strong> 20-12345678-9 (número ficticio)
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Número de CUIT/CUIL"
              variant="outlined"
              value={numeroIdentificacion}
              onChange={manejarCambioNumero}
              onKeyPress={(e) => e.key === 'Enter' && buscarDeudor()}
              placeholder="Ej: 20-12345678-9"
              helperText="Formato: XX-XXXXXXXX-X (11 dígitos)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
              disabled={cargando}
            />
          </Box>
          <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={buscarDeudor}
              disabled={cargando}
              startIcon={cargando ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ height: 56, minWidth: 150 }}
            >
              {cargando ? 'Consultando...' : 'Buscar'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Información del deudor */}
      {datosConsulta && (
        <Box sx={{ mb: 3 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BusinessIcon />
                Información del Consultado
              </Typography>
              <Typography variant="body1">
                <strong>Identificación:</strong> {datosConsulta.identificacion}
              </Typography>
              <Typography variant="body1">
                <strong>Denominación:</strong> {datosConsulta.denominacion}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Estadísticas */}
      {estadisticas && (
        <Box sx={{ mb: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" color="primary">
                  ${estadisticas.totalDeuda.toLocaleString('es-AR')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deuda Total
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <BusinessIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" color="info.main">
                  {estadisticas.entidadesConDeuda}/{estadisticas.totalEntidades}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Entidades con Deuda
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                {obtenerIconoSituacion(estadisticas.situacionMasAlta)}
                <Typography variant="h6" sx={{ color: obtenerColorSituacion(estadisticas.situacionMasAlta) }}>
                  Situación {estadisticas.situacionMasAlta}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {obtenerTextoSituacion(estadisticas.situacionMasAlta)}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Tooltip title="Recargar datos">
                  <IconButton onClick={buscarDeudor} disabled={cargando}>
                    <RefreshIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </IconButton>
                </Tooltip>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Actualizar
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Gráfico */}
      {datosGrafico && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon />
            Evolución de Deudas por Entidad y Período
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Visualización cronológica de la evolución de deudas por entidad financiera. 
            <br />
            • <strong>Sin puntos</strong>: Cuando la situación es 0 (sin deuda)
            <br />
            • <strong>Línea naranja "Total General"</strong>: Solo visible cuando hay múltiples entidades con deuda
            <br />
            • <strong>Cada entidad</strong>: Representada con un color diferente para facilitar la identificación
            <br />
            • <strong>Tooltip</strong>: Muestra información detallada al pasar el cursor sobre el gráfico
          </Typography>
          
          <Box sx={{ height: 400, mt: 2 }}>
            <LineChart
              xAxis={[{ 
                scaleType: 'point', 
                data: datosGrafico.xAxisData,
                label: 'Período'
              }]}
              series={datosGrafico.series}
              height={400}
              margin={{ left: 100, right: 50, top: 50, bottom: 100 }}
              grid={{ horizontal: true, vertical: true }}
            />
          </Box>
        </Paper>
      )}

      {/* Detalle por entidades */}
      {datosConsulta && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Situación Actual por Entidades
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Se muestra únicamente el último período con las entidades que tienen situación distinta de 0 (con deuda).
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {(() => {
              // Obtener el último período (más reciente)
              const ultimoPeriodo = datosConsulta.periodos
                .sort((a, b) => parseInt(b.periodo) - parseInt(a.periodo))[0];

              if (!ultimoPeriodo) return null;

              // Filtrar entidades con situación !== 0
              const entidadesConDeuda = ultimoPeriodo.entidades
                .filter((entidad: Entidad) => entidad.situacion !== 0)
                .sort((a, b) => b.monto - a.monto); // Ordenar por monto descendente

              if (entidadesConDeuda.length === 0) {
                return (
                  <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="success.main">
                      Sin deudas registradas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En el último período no se registran deudas pendientes
                    </Typography>
                  </Box>
                );
              }

              const año = ultimoPeriodo.periodo.substring(0, 4);
              const mes = ultimoPeriodo.periodo.substring(4, 6);
              const periodoFormateado = `${mes}/${año}`;

              return entidadesConDeuda.map((entidad: Entidad, index) => (
                <Box key={index} sx={{ flex: '0 1 300px', minWidth: 300 }}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                        {entidad.entidad}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Período: {periodoFormateado}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5" color="primary">
                          ${entidad.monto.toLocaleString('es-AR')}
                        </Typography>
                        <Chip
                          icon={obtenerIconoSituacion(entidad.situacion)}
                          label={`Situación ${entidad.situacion}`}
                          size="medium"
                          sx={{
                            backgroundColor: obtenerColorSituacion(entidad.situacion),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ fontWeight: 'medium' }}>
                        {obtenerTextoSituacion(entidad.situacion)}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                        {entidad.enRevision && (
                          <Chip label="En Revisión" size="small" variant="outlined" color="warning" />
                        )}
                        {entidad.procesoJud && (
                          <Chip label="Proceso Judicial" size="small" variant="outlined" color="error" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ));
            })()}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default GraficoDeudas;
