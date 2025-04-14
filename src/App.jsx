import { useContext } from 'react';
import { ContractProvider, ContractContext } from './context/ContractContext';
import WorkoutForm from './components/WorkoutForm';
import WorkoutHistory from './components/WorkoutHistory';
import RewardsList from './components/RewardsList';
import AdminPanel from './components/AdminPanel';
import DeveloperCard from './components/DeveloperCard';
import { 
  AppBar, Toolbar, Typography, Container, Box, 
  Paper, CircularProgress, Button, Grid, CssBaseline
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const Dashboard = () => {
  const { account, userTokens, loading, isOwner } = useContext(ContractContext);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading application...</Typography>
      </Box>
    );
  }

  if (!account) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please connect your MetaMask wallet to access the FitnessRewards platform.
          </Typography>
          <Button 
            variant="contained"
            onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}
          >
            Connect Wallet
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              FitnessRewards
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
              Earn rewards for your workouts
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Paper sx={{ px: 2, py: 1, mb: 1 }}>
              <Typography variant="body2" component="span" color="text.secondary" sx={{ mr: 1 }}>
                Balance:
              </Typography>
              <Typography variant="body1" component="span" fontWeight="bold" color="primary">
                {userTokens} Tokens
              </Typography>
            </Paper>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <WorkoutForm />
          </Grid>
          <Grid item xs={12} md={6}>
            <RewardsList />
          </Grid>
        </Grid>

        <Box sx={{ mb: 4 }}>
          <WorkoutHistory />
        </Box>

        {isOwner && (
          <Box sx={{ mb: 4 }}>
            <AdminPanel />
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <DeveloperCard />
        </Box>
      </Container>

      <Box component="footer" sx={{ py: 3, bgcolor: 'text.primary', color: 'white' }}>
        <Container>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>&copy; 2025 FitnessRewards. All rights reserved.</Typography>
            <Box sx={{ mt: { xs: 2, md: 0 } }}>
              <Typography component="a" href="#" sx={{ color: '#bbdefb', mr: 2, textDecoration: 'none' }}>
                Terms
              </Typography>
              <Typography component="a" href="#" sx={{ color: '#bbdefb', textDecoration: 'none' }}>
                Privacy
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ContractProvider>
        <Dashboard />
      </ContractProvider>
    </ThemeProvider>
  );
}

export default App;
