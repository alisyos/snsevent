import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom fontWeight={600}>
              AI 기반 SNS 이벤트 기획
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              브랜드 마케터와 콘텐츠 기획자를 위한 인공지능 기반 SNS 이벤트 기획 지원 도구입니다.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom fontWeight={600}>
              주요 기능
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - AI 기반 이벤트 아이디어 제안<br />
              - 맞춤형 기획서 제공<br />
              - SNS 플랫폼별 최적화 전략<br />
              - 실시간 피드백 및 수정
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} AI 기반 SNS 이벤트기획 제안 시스템
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 