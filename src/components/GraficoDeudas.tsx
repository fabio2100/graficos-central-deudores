import { useState, useMemo } from 'react';
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

// Función para obtener el color según la situación
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

const GraficoDeudas = () => {
  const [numeroIdentificacion, setNumeroIdentificacion] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [datosConsulta, setDatosConsulta] = useState<ResultadoBCRA | null>(null);
  const [error, setError] = useState<string>('');

  // Función para simular la búsqueda (usando datos de ejemplo)
  const buscarDeudor = async () => {
    if (!numeroIdentificacion.trim()) {
      setError('Por favor ingrese un número de identificación');
      return;
    }

    setCargando(true);
    setError('');
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Usar datos de ejemplo por ahora
      setDatosConsulta(datosEjemplo.results);
      
    } catch {
      setError('Error al consultar la información. Intente nuevamente.');
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

    const xAxisData = datosConsulta.periodos.map((periodo: Periodo) => {
      const año = periodo.periodo.substring(0, 4);
      const mes = periodo.periodo.substring(4, 6);
      return `${mes}/${año}`;
    });

    const series = entidadesUnicas.map((nombreEntidad, index) => {
      const datos = datosConsulta.periodos.map((periodo: Periodo) => {
        const entidad = periodo.entidades.find((e: Entidad) => e.entidad === nombreEntidad);
        return entidad ? entidad.monto : 0;
      });

      const colores = ['#1976d2', '#dc004e', '#ed6c02', '#2e7d32', '#9c27b0', '#d32f2f'];
      
      return {
        data: datos,
        label: nombreEntidad,
        color: colores[index % colores.length],
      };
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
        
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Número de CUIT/CUIL"
              variant="outlined"
              value={numeroIdentificacion}
              onChange={(e) => setNumeroIdentificacion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && buscarDeudor()}
              placeholder="Ej: 20123456789"
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
            Detalle por Entidades (Último Período)
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {datosConsulta.periodos[datosConsulta.periodos.length - 1]?.entidades.map((entidad: Entidad, index: number) => (
              <Box key={index} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom noWrap>
                      {entidad.entidad}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" color="primary">
                        ${entidad.monto.toLocaleString('es-AR')}
                      </Typography>
                      <Chip
                        icon={obtenerIconoSituacion(entidad.situacion)}
                        label={`Sit. ${entidad.situacion}`}
                        size="small"
                        sx={{
                          backgroundColor: obtenerColorSituacion(entidad.situacion),
                          color: 'white',
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {obtenerTextoSituacion(entidad.situacion)}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
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
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default GraficoDeudas;
