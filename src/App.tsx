import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, AppBar, Toolbar, Typography } from '@mui/material';
import { theme } from './theme/theme';
import GraficoDeudas from './components/GraficoDeudas';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Central de Deudores - BCRA
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <GraficoDeudas />
      </Container>
    </ThemeProvider>
  );
}

export default App;
