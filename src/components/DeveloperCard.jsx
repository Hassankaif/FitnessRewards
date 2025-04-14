import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';

const DeveloperCard = () => {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', maxWidth: 360, p: 2, mx: 'auto', mt: 4 }}>
      <Avatar
        alt="Hassan Kaif"
        src="pic.jpeg" // Replace with actual path to your passport size photo
        sx={{ width: 72, height: 72, mr: 2 }}
      />
      <CardContent sx={{ px: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          Hassan Kaif
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Role: Developer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          CSE Student, RIT College
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DeveloperCard;
