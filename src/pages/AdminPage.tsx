import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, TextField, Button,
  Box, Divider, List, ListItem, ListItemText, IconButton,
  Card, CardContent, CardActions, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert, Tooltip, Chip, alpha, CircularProgress,
  Tabs, Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import InfoIcon from '@mui/icons-material/Info';
import KeyIcon from '@mui/icons-material/Key';
import LockIcon from '@mui/icons-material/Lock';
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { 
  getSystemPrompt, 
  saveSystemPrompt, 
  resetSystemPrompt,
  getPromptHistory,
  savePromptToHistory,
  deletePromptHistory,
  getUserPromptTemplate,
  saveUserPromptTemplate,
  resetUserPromptTemplate,
  getUserPromptHistory,
  saveUserPromptToHistory,
  deleteUserPromptHistory,
  PromptHistory,
  getFeedbackPromptTemplate,
  saveFeedbackPromptTemplate,
  resetFeedbackPromptTemplate
} from '../services/systemPrompt';

// 스타일 컴포넌트
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const PromptCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
  },
}));

const HistoryListItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px dashed ${theme.palette.divider}`,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
  },
}));

// 탭 패널 인터페이스
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// 탭 패널 컴포넌트
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`prompt-tabpanel-${index}`}
      aria-labelledby={`prompt-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `prompt-tab-${index}`,
    'aria-controls': `prompt-tabpanel-${index}`,
  };
}

const AdminPage: React.FC = () => {
  // 상태 관리 - 시스템 프롬프트
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [description, setDescription] = useState('');
  
  // 상태 관리 - 사용자 프롬프트 템플릿
  const [currentUserPrompt, setCurrentUserPrompt] = useState('');
  const [editedUserPrompt, setEditedUserPrompt] = useState('');
  const [userPromptHistory, setUserPromptHistory] = useState<PromptHistory[]>([]);
  const [userPromptDescription, setUserPromptDescription] = useState('');
  
  // 상태 관리 - 피드백 프롬프트 템플릿
  const [currentFeedbackPrompt, setCurrentFeedbackPrompt] = useState('');
  const [editedFeedbackPrompt, setEditedFeedbackPrompt] = useState('');
  const [feedbackPromptDescription, setFeedbackPromptDescription] = useState('');
  
  // 공통 상태
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // 다이얼로그 상태
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<PromptHistory | null>(null);
  const [historyType, setHistoryType] = useState<'system' | 'user'>('system');

  // 초기 데이터 로드
  useEffect(() => {
    const loadPromptData = async () => {
      try {
        setLoading(true);
        
        // 시스템 프롬프트 로드
        const prompt = getSystemPrompt();
        console.log("관리자 페이지: 불러온 시스템 프롬프트", prompt);
        setCurrentPrompt(prompt);
        setEditedPrompt(prompt);
        
        // 사용자 프롬프트 템플릿 로드
        const userPrompt = getUserPromptTemplate();
        console.log("관리자 페이지: 불러온 사용자 프롬프트 템플릿", userPrompt);
        setCurrentUserPrompt(userPrompt);
        setEditedUserPrompt(userPrompt);
        
        // 피드백 프롬프트 템플릿 로드
        const feedbackPrompt = getFeedbackPromptTemplate();
        console.log("관리자 페이지: 불러온 피드백 프롬프트 템플릿", feedbackPrompt);
        setCurrentFeedbackPrompt(feedbackPrompt);
        setEditedFeedbackPrompt(feedbackPrompt);
        
        // 히스토리 로드
        loadHistory();
      } catch (error) {
        console.error("프롬프트 로드 중 오류:", error);
        showSnackbar("프롬프트 로드 중 오류가 발생했습니다.", "error");
      } finally {
        setLoading(false);
      }
    };
    
    loadPromptData();
  }, []);

  // 히스토리 로드
  const loadHistory = () => {
    const systemHistory = getPromptHistory();
    setPromptHistory(systemHistory);
    
    const userTemplateHistory = getUserPromptHistory();
    setUserPromptHistory(userTemplateHistory);
  };

  // 탭 변경 핸들러
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 시스템 프롬프트 저장
  const handleSavePrompt = () => {
    try {
      saveSystemPrompt(editedPrompt);
      savePromptToHistory(editedPrompt, description);
      setCurrentPrompt(editedPrompt);
      setDescription('');
      loadHistory();
      showSnackbar('시스템 프롬프트가 성공적으로 저장되었습니다!', 'success');
    } catch (error) {
      showSnackbar('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 사용자 프롬프트 템플릿 저장
  const handleSaveUserPrompt = () => {
    try {
      saveUserPromptTemplate(editedUserPrompt);
      saveUserPromptToHistory(editedUserPrompt, userPromptDescription);
      setCurrentUserPrompt(editedUserPrompt);
      setUserPromptDescription('');
      loadHistory();
      showSnackbar('사용자 프롬프트 템플릿이 성공적으로 저장되었습니다!', 'success');
    } catch (error) {
      showSnackbar('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 피드백 프롬프트 템플릿 저장
  const handleSaveFeedbackPrompt = () => {
    try {
      saveFeedbackPromptTemplate(editedFeedbackPrompt);
      setCurrentFeedbackPrompt(editedFeedbackPrompt);
      setFeedbackPromptDescription('');
      showSnackbar('피드백 프롬프트 템플릿이 성공적으로 저장되었습니다!', 'success');
    } catch (error) {
      showSnackbar('저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 시스템 프롬프트 초기화
  const handleResetPrompt = () => {
    setOpenResetDialog(false);
    try {
      if (activeTab === 0) {
        resetSystemPrompt();
        const defaultPrompt = getSystemPrompt();
        setCurrentPrompt(defaultPrompt);
        setEditedPrompt(defaultPrompt);
        savePromptToHistory(defaultPrompt, '기본 프롬프트로 초기화');
        showSnackbar('시스템 프롬프트가 초기화되었습니다.', 'info');
      } else if (activeTab === 1) {
        resetUserPromptTemplate();
        const defaultUserPrompt = getUserPromptTemplate();
        setCurrentUserPrompt(defaultUserPrompt);
        setEditedUserPrompt(defaultUserPrompt);
        saveUserPromptToHistory(defaultUserPrompt, '기본 템플릿으로 초기화');
        showSnackbar('사용자 프롬프트 템플릿이 초기화되었습니다.', 'info');
      } else {
        resetFeedbackPromptTemplate();
        const defaultFeedbackPrompt = getFeedbackPromptTemplate();
        setCurrentFeedbackPrompt(defaultFeedbackPrompt);
        setEditedFeedbackPrompt(defaultFeedbackPrompt);
        showSnackbar('피드백 프롬프트 템플릿이 초기화되었습니다.', 'info');
      }
      loadHistory();
    } catch (error) {
      showSnackbar('초기화 중 오류가 발생했습니다.', 'error');
    }
  };

  // 히스토리에서 복원
  const handleRestoreFromHistory = (item: PromptHistory) => {
    if (historyType === 'system') {
      setEditedPrompt(item.prompt);
    } else {
      setEditedUserPrompt(item.prompt);
    }
    setOpenHistoryDialog(false);
    showSnackbar('히스토리에서 프롬프트가 복원되었습니다. 저장하려면 저장 버튼을 클릭하세요.', 'info');
  };

  // 히스토리 상세 보기
  const handleViewHistory = (item: PromptHistory, type: 'system' | 'user') => {
    setSelectedHistoryItem(item);
    setHistoryType(type);
    setOpenHistoryDialog(true);
  };

  // 히스토리 삭제
  const handleDeleteHistory = () => {
    if (selectedHistoryId) {
      try {
        if (historyType === 'system') {
          deletePromptHistory(selectedHistoryId);
        } else {
          deleteUserPromptHistory(selectedHistoryId);
        }
        loadHistory();
        setOpenDeleteDialog(false);
        setSelectedHistoryId(null);
        showSnackbar('히스토리가 삭제되었습니다.', 'info');
      } catch (error) {
        showSnackbar('삭제 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  // 스낵바 표시
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // 히스토리 버튼 클릭 핸들러
  const handleOpenHistory = () => {
    setSelectedHistoryItem(null);
    setHistoryType(activeTab === 0 ? 'system' : 'user');
    setOpenHistoryDialog(true);
  };

  // 현재 활성 탭에 따른 히스토리 패널 렌더링
  const renderHistoryPanel = () => {
    return (
      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom color="primary">
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {activeTab === 0 ? '시스템 프롬프트 히스토리' : 
           activeTab === 1 ? '사용자 프롬프트 템플릿 히스토리' : 
           '피드백 프롬프트 템플릿 히스토리'}
        </Typography>
        
        {activeTab === 0 
          ? renderHistoryList(promptHistory, 'system')
          : activeTab === 1 ? renderHistoryList(userPromptHistory, 'user') : renderHistoryList(userPromptHistory, 'user')
        }
      </StyledPaper>
    );
  };

  // 히스토리 표시 함수
  const renderHistoryList = (historyItems: PromptHistory[], type: 'system' | 'user') => {
    if (historyItems.length === 0) {
      return (
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            저장된 히스토리가 없습니다.
          </Typography>
        </Box>
      );
    }

    return (
      <List disablePadding>
        {historyItems.map((item) => (
          <HistoryListItem key={item.id}>
            <ListItemText
              primary={
                <Typography variant="body2" noWrap>
                  {item.prompt.length > 40 
                    ? `${item.prompt.substring(0, 40)}...` 
                    : item.prompt}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {new Date(item.date).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.description || '설명 없음'}
                  </Typography>
                </>
              }
              sx={{ overflow: 'hidden' }}
            />
            <Box>
              <Tooltip title="복원">
                <IconButton 
                  size="small" 
                  onClick={() => handleRestoreFromHistory(item)}
                  color="primary"
                >
                  <RestoreIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="상세보기">
                <IconButton 
                  size="small"
                  onClick={() => handleViewHistory(item, type)}
                >
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="삭제">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => {
                    setSelectedHistoryId(item.id);
                    setHistoryType(type);
                    setOpenDeleteDialog(true);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </HistoryListItem>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
        <KeyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI 프롬프트 관리
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        AI가 응답을 생성할 때 사용하는 프롬프트를 관리합니다. 좋은 프롬프트 설정은 더 정확하고 품질 높은 이벤트 기획안을 생성하는 데 도움이 됩니다.
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="프롬프트 관리 탭"
              variant="fullWidth"
            >
              <Tab 
                label="시스템 프롬프트" 
                icon={<ChatIcon />} 
                iconPosition="start"
                {...a11yProps(0)} 
              />
              <Tab 
                label="사용자 프롬프트 템플릿" 
                icon={<CodeIcon />} 
                iconPosition="start"
                {...a11yProps(1)} 
              />
              <Tab 
                label="피드백 프롬프트 템플릿" 
                icon={<AutoFixHighIcon />} 
                iconPosition="start"
                {...a11yProps(2)} 
              />
            </Tabs>
          </Box>
          
          <Grid container spacing={3}>
            {/* 프롬프트 편집 섹션 */}
            <Grid item xs={12} md={8}>
              {/* 시스템 프롬프트 탭 패널 */}
              <TabPanel value={activeTab} index={0}>
                <StyledPaper elevation={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="medium" color="primary">
                      시스템 프롬프트 편집
                    </Typography>
                    <Chip
                      icon={<LockIcon />}
                      label="관리자 전용"
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 1,
                    backgroundColor: (theme) => alpha(theme.palette.info.light, 0.1),
                    border: '1px solid',
                    borderColor: 'info.light'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'info.main' }} />
                      <strong>현재 활성화된 시스템 프롬프트:</strong> {currentPrompt}
                    </Typography>
                  </Box>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    variant="outlined"
                    label="시스템 프롬프트"
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    placeholder="AI에게 전달할 시스템 프롬프트를 입력하세요"
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="변경 설명 (선택사항)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="이 변경의 목적이나 이유를 간략히 설명하세요"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<ReplayIcon />}
                        onClick={() => setOpenResetDialog(true)}
                        sx={{ mr: 1 }}
                      >
                        초기화
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={handleOpenHistory}
                      >
                        히스토리
                      </Button>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSavePrompt}
                      disabled={!editedPrompt.trim() || editedPrompt === currentPrompt}
                    >
                      저장
                    </Button>
                  </Box>
                </StyledPaper>
                
                <StyledPaper elevation={3}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    시스템 프롬프트 사용 가이드
                  </Typography>
                  <Typography variant="body2" paragraph>
                    효과적인 시스템 프롬프트 작성 방법:
                  </Typography>
                  <List disablePadding>
                    <ListItem>
                      <ListItemText
                        primary="AI 역할 명확히 지정하기"
                        secondary="예: '당신은 소셜 미디어 마케팅 전문가로서 창의적이고 참여도가 높은 SNS 이벤트를 기획합니다.'"
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="전문성 수준 설정하기"
                        secondary="예: '당신은 10년 이상의 경험을 가진 소셜 미디어 마케팅 전략가입니다.'"
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="출력 스타일 지정하기"
                        secondary="예: '마케팅 전략과 기획안을 연령별, 플랫폼별 특성을 고려하여 세부적으로 제시합니다.'"
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="구체적인 지식 분야 언급하기"
                        secondary="예: '소셜 미디어 트렌드, ROI 측정, 콘텐츠 바이럴 전략 등에 대한 지식을 활용합니다.'"
                      />
                    </ListItem>
                  </List>
                </StyledPaper>
              </TabPanel>
              
              {/* 사용자 프롬프트 템플릿 탭 패널 */}
              <TabPanel value={activeTab} index={1}>
                <StyledPaper elevation={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="medium" color="primary">
                      사용자 프롬프트 템플릿 편집
                    </Typography>
                    <Chip
                      icon={<CodeIcon />}
                      label="템플릿 편집"
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 1,
                    backgroundColor: (theme) => alpha(theme.palette.warning.light, 0.1),
                    border: '1px solid',
                    borderColor: 'warning.light'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'warning.main' }} />
                      <strong>사용자 프롬프트 템플릿:</strong> 이 템플릿은 사용자 입력 데이터와 결합되어 AI에게 전달되는 실제 프롬프트를 생성합니다.
                    </Typography>
                  </Box>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    variant="outlined"
                    label="사용자 프롬프트 템플릿"
                    value={editedUserPrompt}
                    onChange={(e) => setEditedUserPrompt(e.target.value)}
                    placeholder="사용자 프롬프트 템플릿을 입력하세요"
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="변경 설명 (선택사항)"
                    value={userPromptDescription}
                    onChange={(e) => setUserPromptDescription(e.target.value)}
                    placeholder="이 변경의 목적이나 이유를 간략히 설명하세요"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<ReplayIcon />}
                        onClick={() => setOpenResetDialog(true)}
                        sx={{ mr: 1 }}
                      >
                        초기화
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={handleOpenHistory}
                      >
                        히스토리
                      </Button>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveUserPrompt}
                      disabled={!editedUserPrompt.trim() || editedUserPrompt === currentUserPrompt}
                    >
                      저장
                    </Button>
                  </Box>
                </StyledPaper>
                
                <StyledPaper elevation={3}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    템플릿 변수 사용 가이드
                  </Typography>
                  <Typography variant="body2" paragraph>
                    템플릿에서 사용할 수 있는 변수들:
                  </Typography>
                  <List disablePadding>
                    <ListItem>
                      <ListItemText
                        primary="{productName}, {productCategory}, {productFeatures}"
                        secondary="제품 또는 서비스 관련 정보가 삽입됩니다."
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="{targetAudience}, {marketingGoals}, {kpiMetrics}"
                        secondary="마케팅 목표와 대상 고객층 정보가 삽입됩니다."
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="{budget}, {platforms}, {eventDuration}"
                        secondary="이벤트 실행 조건 정보가 삽입됩니다."
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="{prizes}, {brandTone}, {additionalInfo}, {referenceLinks}"
                        secondary="추가 정보 필드들이 삽입됩니다. 이 필드들은 사용자가 입력하지 않으면 빈 문자열로 대체됩니다."
                      />
                    </ListItem>
                  </List>
                </StyledPaper>
              </TabPanel>
              
              {/* 피드백 프롬프트 템플릿 탭 패널 */}
              <TabPanel value={activeTab} index={2}>
                <StyledPaper elevation={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="medium" color="primary">
                      피드백 프롬프트 템플릿 편집
                    </Typography>
                    <Chip
                      icon={<AutoFixHighIcon />}
                      label="피드백 템플릿"
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    mb: 2, 
                    borderRadius: 1,
                    backgroundColor: (theme) => alpha(theme.palette.success.light, 0.1),
                    border: '1px solid',
                    borderColor: 'success.light'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'success.main' }} />
                      <strong>피드백 프롬프트 템플릿:</strong> 이 템플릿은 사용자의 피드백과 기존 결과를 결합하여 AI에게 전달되는 프롬프트를 생성합니다.
                    </Typography>
                  </Box>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    variant="outlined"
                    label="피드백 프롬프트 템플릿"
                    value={editedFeedbackPrompt}
                    onChange={(e) => setEditedFeedbackPrompt(e.target.value)}
                    placeholder="피드백 프롬프트 템플릿을 입력하세요"
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="변경 설명 (선택사항)"
                    value={feedbackPromptDescription}
                    onChange={(e) => setFeedbackPromptDescription(e.target.value)}
                    placeholder="이 변경의 목적이나 이유를 간략히 설명하세요"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<ReplayIcon />}
                        onClick={() => setOpenResetDialog(true)}
                        sx={{ mr: 1 }}
                      >
                        초기화
                      </Button>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveFeedbackPrompt}
                      disabled={!editedFeedbackPrompt.trim() || editedFeedbackPrompt === currentFeedbackPrompt}
                    >
                      저장
                    </Button>
                  </Box>
                </StyledPaper>
                
                <StyledPaper elevation={3}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    피드백 템플릿 변수 사용 가이드
                  </Typography>
                  <Typography variant="body2" paragraph>
                    피드백 템플릿에서 사용할 수 있는 변수들:
                  </Typography>
                  <List disablePadding>
                    <ListItem>
                      <ListItemText
                        primary="{eventTitle}, {eventConcept}, {eventType}"
                        secondary="기존에 생성된 이벤트의 제목, 컨셉, 유형 정보가 삽입됩니다."
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="{platforms}, {duration}, {targetAudience}"
                        secondary="기존에 생성된 이벤트의 플랫폼, 기간, 타겟 오디언스 정보가 삽입됩니다."
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="{executionSteps}, {hashtags}, {expectedResults}, {suggestedPrizes}"
                        secondary="기존에 생성된 이벤트의 실행 단계, 해시태그, 예상 성과, 경품 구성 정보가 삽입됩니다."
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="{samplePost}, {feedback}"
                        secondary="기존에 생성된 이벤트의 샘플 포스트와 사용자가 입력한 피드백이 삽입됩니다."
                      />
                    </ListItem>
                  </List>
                </StyledPaper>
              </TabPanel>
            </Grid>
            
            {/* 히스토리 섹션 */}
            <Grid item xs={12} md={4}>
              {renderHistoryPanel()}
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* 초기화 확인 다이얼로그 */}
      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
      >
        <DialogTitle>
          {activeTab === 0 ? '시스템 프롬프트 초기화' : 
           activeTab === 1 ? '사용자 프롬프트 템플릿 초기화' : 
           '피드백 프롬프트 템플릿 초기화'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {activeTab === 0 ? '시스템 프롬프트를 기본값으로 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.' :
             activeTab === 1 ? '사용자 프롬프트 템플릿을 기본값으로 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.' :
             '피드백 프롬프트 템플릿을 기본값으로 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetDialog(false)}>취소</Button>
          <Button onClick={handleResetPrompt} color="primary" variant="contained">
            초기화
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 히스토리 삭제 확인 다이얼로그 */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>히스토리 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            선택한 히스토리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>취소</Button>
          <Button onClick={handleDeleteHistory} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 히스토리 상세 다이얼로그 */}
      <Dialog
        open={openHistoryDialog}
        onClose={() => setOpenHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedHistoryItem 
            ? (historyType === 'system' ? '시스템 프롬프트 히스토리 상세' : '사용자 프롬프트 템플릿 히스토리 상세')
            : (historyType === 'system' ? '시스템 프롬프트 히스토리' : '사용자 프롬프트 템플릿 히스토리')
          }
        </DialogTitle>
        <DialogContent>
          {selectedHistoryItem ? (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                생성 날짜: {new Date(selectedHistoryItem.date).toLocaleString()}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                설명: {selectedHistoryItem.description || '설명 없음'}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={historyType === 'system' ? 6 : 12}
                variant="outlined"
                value={selectedHistoryItem.prompt}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ mt: 2 }}
              />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleRestoreFromHistory(selectedHistoryItem)}
                >
                  이 버전으로 복원
                </Button>
              </Box>
            </Box>
          ) : (
            <List>
              {(historyType === 'system' ? promptHistory : userPromptHistory).map((item) => (
                <PromptCard key={item.id}>
                  <CardContent>
                    <Typography variant="subtitle2" color="primary">
                      {new Date(item.date).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description || '설명 없음'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                      {item.prompt}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleRestoreFromHistory(item)}
                      startIcon={<RestoreIcon />}
                    >
                      복원
                    </Button>
                    <Button 
                      size="small" 
                      onClick={() => handleViewHistory(item, historyType)}
                      startIcon={<InfoIcon />}
                    >
                      상세보기
                    </Button>
                  </CardActions>
                </PromptCard>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
      
      {/* 스낵바 */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPage; 