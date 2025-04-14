// src/components/WorkoutHistory.jsx
import { useState, useEffect, useContext } from 'react';
import { ContractContext } from '../context/ContractContext';
import {
  Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Box, CircularProgress
} from '@mui/material';

const WorkoutHistory = () => {
  const { contract, account } = useContext(ContractContext);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (contract && account) {
        try {
          const workoutHistory = await contract.getUserWorkouts(account);
          const formattedWorkouts = workoutHistory.map((workout) => ({
            workoutType: workout.workoutType,
            duration: workout.duration.toString(),
            timestamp: new Date(Number(workout.timestamp) * 1000),
            tokensEarned: workout.tokensEarned.toString(),
          }));
          
          // Sort by timestamp (most recent first)
          const sortedWorkouts = formattedWorkouts.sort((a, b) => b.timestamp - a.timestamp);
          setWorkouts(sortedWorkouts);
        } catch (error) {
          console.error('Error fetching workouts:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [contract, account]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (workouts.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Workout History</Typography>
        <Typography color="text.secondary">No workouts logged yet. Start logging your fitness activities!</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Workout History</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Workout Type</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Tokens Earned</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workouts.map((workout, index) => (
              <TableRow key={index}>
                <TableCell>
                  {workout.timestamp.toLocaleDateString()} {workout.timestamp.toLocaleTimeString()}
                </TableCell>
                <TableCell>{workout.workoutType}</TableCell>
                <TableCell>{workout.duration} min</TableCell>
                <TableCell sx={{ color: 'success.main', fontWeight: 'medium' }}>
                  {workout.tokensEarned}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default WorkoutHistory;