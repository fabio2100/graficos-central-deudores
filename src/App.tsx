import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography } from '@mui/material';
import { theme } from './theme/theme';
import GraficoDeudas from './components/GraficoDeudas';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              textAlign: 'center'
            }}
          >
            Central de Deudores - BCRA
          </Typography>
        </Toolbar>
      </AppBar>
      <Container 
        maxWidth="lg" 
        sx={{ 
          pt: 3,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <GraficoDeudas />
      </Container>
    </ThemeProvider>
  );
}

export default App;
