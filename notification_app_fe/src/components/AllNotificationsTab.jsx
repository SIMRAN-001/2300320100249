import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Pagination, CircularProgress, Alert, Button } from '@mui/material';
import axios from 'axios';

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaW1yYW4uMjNiMDEwMTI1MUBhYmVzLmFjLmluIiwiZXhwIjoxNzgwOTkyMjAzLCJpYXQiOjE3ODA5OTEzMDMsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5M2NiMjNlYy03NmQ2LTQzZGMtODk4My0yNWZmOTM3OThiNDIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzaW1yYW4iLCJzdWIiOiIyN2UyNTZlYy1jMjA1LTRlOWEtYTAxOS03ZjQxYzBmNmY1ZTkifSwiZW1haWwiOiJzaW1yYW4uMjNiMDEwMTI1MUBhYmVzLmFjLmluIiwibmFtZSI6InNpbXJhbiIsInJvbGxObyI6IjIzMDAzMjAxMDAyNDkiLCJhY2Nlc3NDb2RlIjoiY1h1cWh0IiwiY2xpZW50SUQiOiIyN2UyNTZlYy1jMjA1LTRlOWEtYTAxOS03ZjQxYzBmNmY1ZTkiLCJjbGllbnRTZWNyZXQiOiJ1UFNwSlZlY1BxVlBxa1ZFIn0.0gAvGXNYw7l6nkVjRAUF-KjjjUuMFutUlO_8bACsNqc";

// Frontend-compatible logging utility
async function logFrontendEvent(level, message) {
    console.log(`[Frontend Log] ${level.toUpperCase()}: ${message}`);
    // FIXED: Commented out the server logging to bypass the remote CORS block
    /*
    try {
        await axios.post("http://4.224.186.213/evaluation-service/logs", {
            stack: "frontend",
            level: level.toLowerCase(),
            package: "component",
            message: message
        }, {
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        });
    } catch (err) {}
    */
}

function AllNotificationsTab({ readStatus, markAsRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      await logFrontendEvent("info", `Triggering API fetch for page ${page} with filter: ${typeFilter || 'None'}`);

      try {
        // FIXED: Pointed URL to your local running backend port 5000 to pull your data
        let url = `http://localhost:5000/notifications?page=${page}&limit=${limit}`;
        if (typeFilter) {
          url += `&notification_type=${typeFilter}`;
        }

        const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        });

        setNotifications(response.data.notifications || []);
        await logFrontendEvent("info", "Successfully rendered fresh notifications state items.");
      } catch (err) {
        setError("Failed to stream server updates. Please check authorization status.");
        await logFrontendEvent("error", `Component fetch error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, typeFilter]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;

  return (
    <Box>
      <Box sx={{ minWidth: 120, mb: 3 }}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Filter by Notification Type</InputLabel>
          <Select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            label="Filter by Notification Type"
          >
            <MenuItem value=""><em>All Elements</em></MenuItem>
            <MenuItem value="Placement">Placements</MenuItem>
            <MenuItem value="Result">Results</MenuItem>
            <MenuItem value="Event">Events</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {notifications.length === 0 ? (
        <Typography variant="body1" align="center" color="text.secondary">No notification events available match criteria.</Typography>
      ) : (
        notifications.map((item) => {
          const isRead = !!readStatus[item.ID];
          return (
            <Card 
              key={item.ID} 
              sx={{ 
                mb: 2, 
                borderLeft: isRead ? '6px solid #b0bec5' : '6px solid #1976d2',
                backgroundColor: isRead ? '#fafafa' : '#ffffff',
                transition: '0.2s',
                '&:hover': { boxShadow: 3 }
              }}
            >
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', px: 1, py: 0.5, borderRadius: 1, backgroundColor: item.Type === 'Placement' ? '#e3f2fd' : item.Type === 'Result' ? '#e8f5e9' : '#fff3e0', color: item.Type === 'Placement' ? '#0d47a1' : item.Type === 'Result' ? '#1b5e20' : '#e65100' }}>
                      {item.Type.toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{item.Timestamp}</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ fontWeight: isRead ? 'normal' : 'bold', color: isRead ? 'text.secondary' : 'text.primary' }}>
                    {item.Message}
                  </Typography>
                </Box>
                {!isRead && (
                  <Button size="small" variant="outlined" color="primary" onClick={() => markAsRead(item.ID)}>
                    Mark Read
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={5} page={page} onChange={(e, val) => setPage(val)} color="primary" />
      </Box>
    </Box>
  );
}

export default AllNotificationsTab;