// src/components/WorkoutForm.jsx
import { useState, useContext } from 'react';
import { ContractContext } from '../context/ContractContext';
import { 
  Paper, Typography, TextField, Button, 
  FormControl, InputLabel, Select, MenuItem,
  Alert, Box
} from '@mui/material';

const WorkoutForm = () => {
  const { contract, refreshUserTokens } = useContext(ContractContext);
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const workoutTypes = [
    'Running', 'Swimming', 'Cycling', 'Weight Training', 
    'Yoga', 'HIIT', 'Pilates', 'Walking'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!workoutType || !duration) {
      setMessage('Please fill in all fields');
      setAlertSeverity('warning');
      return;
    }

    if (!contract) {
      setMessage('Contract not initialized. Please check your MetaMask connection.');
      setAlertSeverity('error');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('Logging workout...');
      setAlertSeverity('info');
      
      const tx = await contract.logWorkout(workoutType, parseInt(duration));
      await tx.wait();
      
      setMessage('Workout logged successfully!');
      setAlertSeverity('success');
      setWorkoutType('');
      setDuration('');
      refreshUserTokens();
    } catch (error) {
      console.error('Error logging workout:', error);
      setMessage(`Error: ${error.message}`);
      setAlertSeverity('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Log Workout</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Workout Type</InputLabel>
          <Select
            value={workoutType}
            label="Workout Type"
            onChange={(e) => setWorkoutType(e.target.value)}
            required
          >
            <MenuItem value="">
              <em>Select workout type</em>
            </MenuItem>
            {workoutTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          margin="normal"
          label="Duration (minutes)"
          type="number"
          fullWidth
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          inputProps={{ min: 1 }}
          required
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading || !contract}
        >
          {isLoading ? 'Processing...' : 'Log Workout'}
        </Button>
      </Box>
      
      {message && (
        <Alert severity={alertSeverity} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Paper>
  );
};

export default WorkoutForm;