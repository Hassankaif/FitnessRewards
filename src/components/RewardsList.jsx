// src/components/RewardsList.jsx
import { useState, useEffect, useContext } from 'react';
import { ContractContext } from '../context/ContractContext';
import {
  Paper, Typography, Grid, Card, CardContent,
  CardActions, Button, Box, Alert, CircularProgress, Chip
} from '@mui/material';

const RewardsList = () => {
  const { contract, userTokens, refreshUserTokens } = useContext(ContractContext);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  useEffect(() => {
    const fetchRewards = async () => {
      if (contract) {
        try {
          const rewardCount = await contract.rewardCounter();
          const rewardsArray = [];
          
          for (let i = 0; i < rewardCount; i++) {
            const reward = await contract.rewards(i);
            rewardsArray.push({
              id: i,
              name: reward.name,
              cost: reward.cost.toString(),
              available: reward.available
            });
          }
          
          setRewards(rewardsArray);
        } catch (error) {
          console.error('Error fetching rewards:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [contract]);

  const handleRedeemReward = async (rewardId, rewardName, rewardCost) => {
    try {
      setIsRedeeming(true);
      setMessage(`Redeeming ${rewardName}...`);
      setAlertSeverity('info');
      
      const tx = await contract.redeemReward(rewardId);
      await tx.wait();
      
      setMessage(`Successfully redeemed ${rewardName}!`);
      setAlertSeverity('success');
      refreshUserTokens();
    } catch (error) {
      console.error('Error redeeming reward:', error);
      setMessage(`Error: ${error.message}`);
      setAlertSeverity('error');
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (rewards.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Available Rewards</Typography>
        <Typography color="text.secondary">No rewards available at the moment.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Available Rewards</Typography>
        <Chip 
          label={`Your Balance: ${userTokens} tokens`} 
          color="primary" 
          variant="outlined"
        />
      </Box>
      
      {message && (
        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        {rewards.filter(reward => reward.available).map((reward) => (
          <Grid item xs={12} sm={6} key={reward.id}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {reward.name}
                </Typography>
                <Typography variant="body2" color="success.main" fontWeight="medium">
                  {reward.cost} tokens
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={parseInt(userTokens) < parseInt(reward.cost) || isRedeeming}
                  onClick={() => handleRedeemReward(reward.id, reward.name, reward.cost)}
                  color={parseInt(userTokens) >= parseInt(reward.cost) ? 'primary' : 'inherit'}
                >
                  {isRedeeming ? 'Processing...' : 'Redeem Reward'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default RewardsList;