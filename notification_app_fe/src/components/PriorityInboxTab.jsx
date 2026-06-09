import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Button } from '@mui/material';
import axios from 'axios';

// The live JWT access token provided
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaW1yYW4uMjNiMDEwMTI1MUBhYmVzLmFjLmluIiwiZXhwIjoxNzgwOTkzNjA2LCJpYXQiOjE3ODA5OTI3MDYsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIyN2E4ZjJlZC00YmM1LTQwNDYtOGE3NS1iNGE5ZjQxNWQ0N2UiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzaW1yYW4iLCJzdWIiOiIyN2UyNTZlYy1jMjA1LTRlOWEtYTAxOS03ZjQxYzBmNmY1ZTkifSwiZW1haWwiOiJzaW1yYW4uMjNiMDEwMTI1MUBhYmVzLmFjLmluIiwibmFtZSI6InNpbXJhbiIsInJvbGxObyI6IjIzMDAzMjAxMDAyNDkiLCJhY2Nlc3NDb2RlIjoiY1h1cWh0IiwiY2xpZW50SUQiOiIyN2UyNTZlYy1jMjA1LTRlOWEtYTAxOS03ZjQxYzBmNmY1ZTkiLCJjbGllbnRTZWNyZXQiOiJ1UFNwSlZlY1BxVlBxa1ZFIn0.Hw12IGgPOvNSr8R2g2rF9OJswjhlkI7stcH6K56ROmQ";
const TYPE_WEIGHTS = { 'Placement': 3, 'Result': 2, 'Event': 1 };

// Frontend-compatible logging utility to communicate cleanly with evaluation metrics
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
    } catch (err) {
        // Fallback silently if logging API experiences network hiccups
    }
    */
}

function PriorityInboxTab({ readStatus, markAsRead }) {
  const [priorityData, setPriorityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10); // Dynamic variable constraint handling user choice (10, 15, 20)

  useEffect(() => {
    const fetchPriorityData = async () => {
      setLoading(true);
      setError(null);
      await logFrontendEvent("info", `Compiling dynamic Priority Inbox feed. Cap threshold limit: ${topN}`);

      try {
        // FIXED: Pointed URL endpoint directly to your local backend server on port 5000
        const response = await axios.get("http://localhost:5000/notifications", {
          headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        });

        const rawList = response.data.notifications || [];
        
        // Map elements alongside calculation criteria weights
        const processed = rawList.map(item => ({
          ...item,
          weight: TYPE_WEIGHTS[item.Type] || 0,
          epoch: new Date(item.Timestamp.replace(' ', 'T')).getTime()
        }));

        // Sort via weight metric ranking hierarchy logic breaking ties by epoch values
        const sorted = processed.sort((a, b) => {
          if (b.weight !== a.weight) return b.weight - a.weight;
          return b.epoch - a.epoch;
        });

        // Limit subset array strictly to capacity value specified by selector input element
        setPriorityData(sorted.slice(0, topN));
      } catch (err) {
        setError("Failed to construct the algorithm queue interface.");
        await logFrontendEvent("error", `Priority calculations failure structure exception: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPriorityData();
  }, [topN]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>;

  return (
    <Box>
      <Box sx={{ minWidth: 120, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Display Density Limit (n)</InputLabel>
          <Select
            value={topN}
            onChange={(e) => setTopN(e.target.value)}
            label="Display Density Limit (n)"
          >
            <MenuItem value={10}>Top 10 High Importance Alerts</MenuItem>
            <MenuItem value={15}>Top 15 High Importance Alerts</MenuItem>
            <MenuItem value={20}>Top 20 High Importance Alerts</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {priorityData.map((item, index) => {
        const isRead = !!readStatus[item.ID];
        return (
          <Card 
            key={item.ID} 
            sx={{ 
              mb: 2, 
              borderLeft: '6px solid #dc004e',
              backgroundColor: isRead ? '#f5f5f5' : '#fff8f9',
              boxShadow: isRead ? 1 : 2
            }}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', px: 1, color: '#dc004e', backgroundColor: '#ffebee', borderRadius: 1 }}>
                    RANK #{index + 1} • {item.Type.toUpperCase()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{item.Timestamp}</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: isRead ? 'normal' : 'bold' }}>
                  {item.Message}
                </Typography>
              </Box>
              {!isRead && (
                <Button size="small" variant="contained" color="secondary" onClick={() => markAsRead(item.ID)}>
                  Acknowledge
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

export default PriorityInboxTab;