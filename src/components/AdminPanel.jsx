// src/components/AdminPanel.jsx
import { useState, useEffect, useContext } from 'react';
import { ContractContext } from '../context/ContractContext';
import {
  Paper, Typography, Box, TextField, Button,
  FormControl, InputLabel, Select, MenuItem,
  Grid, FormControlLabel, Radio, RadioGroup,
  Alert, CircularProgress, Divider
} from '@mui/material';

const AdminPanel = () => {
  const { contract, isOwner } = useContext(ContractContext);
  const [rewardName, setRewardName] = useState('');
  const [rewardCost, setRewardCost] = useState('');
  const [message, setMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [rewardId, setRewardId] = useState('');
  const [rewardStatus, setRewardStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRewards = async () => {
      if (contract && isOwner) {
        try {
          const rewardCount = await contract.rewardCounter();
          const rewardsArray = [];

          for (let i = 0n; i < rewardCount; i++) {
            const reward = await contract.rewards(i);
            rewardsArray.push({
              id: Number(i),
              name: reward.name,
              cost: reward.cost.toString(),
              available: reward.available
            });
          }

          setRewards(rewardsArray);
        } catch (error) {
          console.error('Error fetching rewards:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchRewards();
  }, [contract, isOwner]);

  const handleAddReward = async (e) => {
    e.preventDefault();

    if (!rewardName || !rewardCost) {
      setMessage('Please fill in all fields');
      setAlertSeverity('warning');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('Adding new reward...');
      setAlertSeverity('info');

      // Convert rewardCost to BigInt
      const tx = await contract.addReward(rewardName, BigInt(rewardCost));
      await tx.wait();

      setMessage('Reward added successfully!');
      setAlertSeverity('success');
      setRewardName('');
      setRewardCost('');

      // Fetch newly added reward (safely with BigInt math)
      const rewardCount = await contract.rewardCounter();
      const lastIndex = rewardCount - 1n;
      const newReward = await contract.rewards(lastIndex);

      setRewards([...rewards, {
        id: Number(lastIndex), // for rendering
        name: newReward.name,
        cost: newReward.cost.toString(),
        available: newReward.available
      }]);
    } catch (error) {
      console.error('Error adding reward:', error);
      setMessage(`Error: ${error.message}`);
      setAlertSeverity('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleReward = async (e) => {
    e.preventDefault();

    if (!rewardId) {
      setMessage('Please select a reward');
      setAlertSeverity('warning');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(`${rewardStatus ? 'Enabling' : 'Disabling'} reward...`);
      setAlertSeverity('info');

      const tx = await contract.toggleRewardAvailability(rewardId, rewardStatus);
      await tx.wait();

      setMessage(`Reward ${rewardStatus ? 'enabled' : 'disabled'} successfully!`);
      setAlertSeverity('success');

      const updatedRewards = rewards.map(reward => {
        if (reward.id.toString() === rewardId) {
          return { ...reward, available: rewardStatus };
        }
        return reward;
      });

      setRewards(updatedRewards);
    } catch (error) {
      console.error('Error updating reward:', error);
      setMessage(`Error: ${error.message}`);
      setAlertSeverity('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOwner) return null;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Admin Panel</Typography>

      {message && (
        <Alert severity={alertSeverity} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Add New Reward */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>Add New Reward</Typography>
          <Box component="form" onSubmit={handleAddReward}>
            <TextField
              fullWidth
              label="Reward Name"
              variant="outlined"
              margin="normal"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              placeholder="e.g. Free Gym Pass"
              required
            />
            <TextField
              fullWidth
              label="Token Cost"
              type="number"
              variant="outlined"
              margin="normal"
              value={rewardCost}
              onChange={(e) => setRewardCost(e.target.value)}
              placeholder="100"
              inputProps={{ min: 1 }}
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Add Reward'}
            </Button>
          </Box>
        </Grid>

        {/* Toggle Reward Availability */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>Toggle Reward Availability</Typography>
          <Box component="form" onSubmit={handleToggleReward}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Reward</InputLabel>
              <Select
                value={rewardId}
                label="Select Reward"
                onChange={(e) => setRewardId(e.target.value)}
                required
              >
                <MenuItem value="">
                  <em>Select a reward</em>
                </MenuItem>
                {rewards.map((reward) => (
                  <MenuItem key={reward.id} value={reward.id}>
                    {reward.name} ({reward.available ? 'Available' : 'Not Available'})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl component="fieldset" margin="normal">
              <Typography variant="body2" color="text.secondary" gutterBottom>Status</Typography>
              <RadioGroup
                row
                value={rewardStatus.toString()}
                onChange={(e) => setRewardStatus(e.target.value === 'true')}
              >
                <FormControlLabel value="true" control={<Radio />} label="Available" />
                <FormControlLabel value="false" control={<Radio />} label="Not Available" />
              </RadioGroup>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Update Reward Status'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AdminPanel;
