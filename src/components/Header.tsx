import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const Header: React.FC = () => {
  return (
    <AppBar 
      position="static" 
      color="primary" 
      elevation={0}
      sx={{ 
        mb: 4,
        background: 'linear-gradient(90deg, #3f51b5 0%, #536dfe 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1.5 }}>
          <AutoAwesomeIcon sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            <RouterLink to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              AI 기반 SNS 이벤트 기획
            </RouterLink>
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 