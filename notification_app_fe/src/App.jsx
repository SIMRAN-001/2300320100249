import React, { useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, Tabs, Tab, Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import AllNotificationsTab from './components/AllNotificationsTab';
import PriorityInboxTab from './components/PriorityInboxTab';

// Production-grade material design theme settings
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    background: { default: '#f5f7fa' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [readStatus, setReadStatus] = useState(() => {
    const saved = localStorage.getItem('read_notifications');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('read_notifications', JSON.stringify(readStatus));
  }, [readStatus]);

  const markAsRead = (id) => {
    setReadStatus((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <NotificationsIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Campus Notification Portal
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, val) => setCurrentTab(val)} 
            variant="fullWidth"
            aria-label="Notification Navigation Tabs"
          >
            <Tab icon={<NotificationsIcon />} label="All Notifications" iconPosition="start" />
            <Tab icon={<StarIcon />} label="Priority Inbox" iconPosition="start" />
          </Tabs>
        </Box>

        <Box sx={{ py: 2 }}>
          {currentTab === 0 && (
            <AllNotificationsTab readStatus={readStatus} markAsRead={markAsRead} />
          )}
          {currentTab === 1 && (
            <PriorityInboxTab readStatus={readStatus} markAsRead={markAsRead} />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;