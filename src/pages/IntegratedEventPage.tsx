import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Grid, Box, Paper, Typography, Divider,
  Stepper, Step, StepLabel, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip,
  OutlinedInput, FormHelperText, CircularProgress,
  Tab, Tabs, Card, CardContent, List, ListItem,
  ListItemIcon, ListItemText, Avatar, alpha, useMediaQuery,
  Snackbar, Alert, IconButton
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material';
import { generateEventPlan, refineEventPlan, AIEventResponse, EventPlanningInput } from '../services/openai';
// 아이콘 임포트
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
// PDF 생성 라이브러리 import
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// jsPDF 타입 확장
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY?: number;
  };
}

// 스텝 제목 변경
const steps = ['제품/서비스정보', '마케팅 목표', '이벤트 조건', '브랜드 정보'];

// 마케팅 목표 옵션들
const marketingGoals = [
  '브랜드/제품 인지도 향상',
  '신규 고객 유치',
  '제품 구매 증대',
  '사용자 참여도 증가',
  '앱 다운로드/회원가입 증가',
  '브랜드 충성도 강화',
  '신제품 출시 홍보',
  '사용후기/피드백 수집'
];

// KPI 옵션들
const kpiOptions = [
  '팔로워 수 증가',
  '이벤트 참여자 수',
  '게시물 참여율',
  '해시태그 사용량',
  '클릭률',
  '전환율',
  '웹사이트 트래픽',
  '앱 다운로드 수',
  '회원가입 수',
  '판매량'
];

// SNS 플랫폼 옵션
const platformOptions = [
  'Instagram',
  'Facebook',
  'Twitter',
  'YouTube',
  'TikTok',
  'KakaoTalk',
  'Naver Blog',
  'LinkedIn'
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// 미리 정의된 스타일드 컴포넌트들
const StepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  color: theme.palette.text.disabled,
  display: 'flex',
  height: 22,
  alignItems: 'center',
  ...(ownerState.active && {
    color: theme.palette.primary.main,
  }),
  '& .StepIcon-completedIcon': {
    color: theme.palette.primary.main,
    zIndex: 1,
    fontSize: 18,
  },
}));

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px dashed ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    borderRadius: theme.shape.borderRadius,
  },
}));

const ResultCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'visible',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  },
}));

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
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

const ResultContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
  },
}));

const TabPanelStyled = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <TabPanelStyled
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children}
    </TabPanelStyled>
  );
}

function getStyles(name: string, selectedItems: readonly string[], theme: Theme) {
  return {
    fontWeight:
      selectedItems.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const IntegratedEventPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [aiResponse, setAiResponse] = useState<AIEventResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Form 상태관리
  const [formData, setFormData] = useState<EventPlanningInput>({
    // 1단계: 제품/서비스 정보
    productName: '',
    productCategory: '',
    productFeatures: '',
    targetAudience: '',
    
    // 2단계: 마케팅 목표
    marketingGoals: [] as string[],
    kpiMetrics: [] as string[],
    
    // 3단계: 이벤트 실행 조건
    budget: '',
    platforms: [] as string[],
    eventDuration: '',
    prizes: '',
    
    // 4단계: 브랜드 정보
    brandTone: '',
    additionalInfo: '',
    referenceFile: null
  });

  // 이벤트 생성 함수
  const handleGenerateEvent = async () => {
    const hasRequiredFields = 
      formData.productName && 
      formData.productCategory && 
      formData.productFeatures && 
      formData.marketingGoals.length > 0 &&
      formData.platforms.length > 0;
    
    if (hasRequiredFields) {
      setLoading(true);
      setError(null);
      
      try {
        console.log("이벤트 생성 요청 시작");
        
        // 파일이 있으면 파일명을 참고링크 대신 전달
        let requestData = { ...formData };
        if (formData.referenceFile) {
          requestData.referenceLinks = `[첨부파일] ${formData.referenceFile.name}`;
        }
        
        const response = await generateEventPlan(requestData);
        setAiResponse(response);
        console.log("이벤트 생성 완료");
      } catch (err: any) {
        console.error('API 에러:', err);
        setError(`API 호출 중 오류 발생: ${err.message || '알 수 없는 오류'}. 개발자 도구 콘솔에서 자세한 로그를 확인하세요.`);
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    } else {
      setError('필수 입력 항목을 모두 입력해주세요.');
      setOpenSnackbar(true);
    }
  };

  const isStepOptional = (step: number) => {
    return step === 3;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      throw new Error("단계를 건너뛸 수 없습니다.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent<string[]>, fieldName: string) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      [fieldName]: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(e.target.value);
  };
  
  const handleFeedbackSubmit = async () => {
    if (feedback.trim() && aiResponse) {
      setLoading(true);
      setError(null);
      
      try {
        const refinedResponse = await refineEventPlan(aiResponse, feedback);
        setAiResponse(refinedResponse);
        setFeedback('');
        setOpenSnackbar(true); // 성공 메시지 표시
      } catch (err) {
        setError('피드백 처리 중 오류가 발생했습니다.');
        setOpenSnackbar(true);
        console.error('Feedback API error:', err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleSaveAsPdf = async () => {
    if (!aiResponse || !resultRef.current) return;
    
    try {
      setLoading(true);
      
      // 화면에 표시되는 결과 컴포넌트를 캡처
      const canvas = await html2canvas(resultRef.current, {
        scale: 2, // 고해상도로 렌더링
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // PDF 생성
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // 이미지 크기 계산
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // 첫 페이지 추가
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // 필요한 경우 여러 페이지로 분할
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // 파일 저장
      const fileName = `${aiResponse.eventTitle.replace(/\s+/g, '_')}_이벤트기획안.pdf`;
      pdf.save(fileName);
      
      setOpenSnackbar(true);
      setError(null);
    } catch (err) {
      console.error('PDF 생성 중 오류 발생:', err);
      setError('PDF 저장 중 오류가 발생했습니다. 자세한 내용은 개발자 도구 콘솔을 확인하세요.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Snackbar 닫기 핸들러
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // 파일 업로드 처리 핸들러
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // 파일 유형 검증 (txt, docx, pdf, jpg, png만 허용)
      const validTypes = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('지원되지 않는 파일 형식입니다. txt, docx, pdf, jpg, png 파일만 업로드 가능합니다.');
        setOpenSnackbar(true);
        return;
      }
      
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기가 너무 큽니다. 10MB 이하의 파일만 업로드 가능합니다.');
        setOpenSnackbar(true);
        return;
      }
      
      setUploadedFile(file);
      setFormData({ ...formData, referenceFile: file });
    }
  };

  // 업로드된 파일 삭제
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData({ ...formData, referenceFile: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 파일 선택 버튼 클릭 핸들러
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Step에 따른 폼 내용 렌더링
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              제품/서비스정보
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="productName"
                  name="productName"
                  label="제품/서비스 이름"
                  fullWidth
                  value={formData.productName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="productCategory"
                  name="productCategory"
                  label="카테고리"
                  fullWidth
                  value={formData.productCategory}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="productFeatures"
                  name="productFeatures"
                  label="제품/서비스 특징 및 장점"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.productFeatures}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="targetAudience"
                  name="targetAudience"
                  label="타겟 고객층 (연령, 성별, 관심사 등)"
                  fullWidth
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              마케팅 목표
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="marketing-goals-label">마케팅 목표</InputLabel>
                  <Select
                    labelId="marketing-goals-label"
                    id="marketingGoals"
                    multiple
                    value={formData.marketingGoals}
                    onChange={(e) => handleSelectChange(e, 'marketingGoals')}
                    input={<OutlinedInput id="select-marketing-goals" label="마케팅 목표" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {marketingGoals.map((goal) => (
                      <MenuItem
                        key={goal}
                        value={goal}
                        style={getStyles(goal, formData.marketingGoals, theme)}
                      >
                        {goal}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>이벤트를 통해 달성하고자 하는 목표를 선택하세요</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="kpi-metrics-label">KPI 지표</InputLabel>
                  <Select
                    labelId="kpi-metrics-label"
                    id="kpiMetrics"
                    multiple
                    value={formData.kpiMetrics}
                    onChange={(e) => handleSelectChange(e, 'kpiMetrics')}
                    input={<OutlinedInput id="select-kpi" label="KPI 지표" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {kpiOptions.map((kpi) => (
                      <MenuItem
                        key={kpi}
                        value={kpi}
                        style={getStyles(kpi, formData.kpiMetrics, theme)}
                      >
                        {kpi}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>이벤트 성과를 측정할 지표를 선택하세요</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              이벤트 조건
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="budget"
                  name="budget"
                  label="예산 (원)"
                  fullWidth
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  id="eventDuration"
                  name="eventDuration"
                  label="이벤트 기간 (예: 2주, 1개월)"
                  fullWidth
                  value={formData.eventDuration}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="platforms-label">SNS 플랫폼</InputLabel>
                  <Select
                    labelId="platforms-label"
                    id="platforms"
                    multiple
                    value={formData.platforms}
                    onChange={(e) => handleSelectChange(e, 'platforms')}
                    input={<OutlinedInput id="select-platforms" label="SNS 플랫폼" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {platformOptions.map((platform) => (
                      <MenuItem
                        key={platform}
                        value={platform}
                        style={getStyles(platform, formData.platforms, theme)}
                      >
                        {platform}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>이벤트를 진행할 SNS 플랫폼을 선택하세요</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="prizes"
                  name="prizes"
                  label="경품 구성 (선택사항)"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.prizes}
                  onChange={handleInputChange}
                  helperText="경품이 있는 경우 상품 및 수량을 적어주세요"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              브랜드 정보
            </Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
              선택사항이지만, 입력하시면 더 정확한 제안을 받을 수 있습니다.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  id="brandTone"
                  name="brandTone"
                  label="브랜드 톤앤매너"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.brandTone}
                  onChange={handleInputChange}
                  helperText="브랜드의 성격, 커뮤니케이션 스타일 등을 자유롭게 설명해 주세요"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="additionalInfo"
                  name="additionalInfo"
                  label="추가 정보"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  helperText="이벤트 기획에 참고할만한 추가 정보가 있다면 입력해 주세요"
                />
              </Grid>
              <Grid item xs={12}>
                {renderFileUpload()}
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return '알 수 없는 단계입니다';
    }
  };

  // 참고링크 입력 필드를 파일 첨부 기능으로 교체
  const renderFileUpload = () => {
    return (
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          참고 자료 (txt, docx, pdf, jpg, png 형식)
        </Typography>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx,.pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        {uploadedFile ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
            backgroundColor: alpha(theme.palette.primary.light, 0.05)
          }}>
            <AttachFileIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {uploadedFile.name}
            </Typography>
            <IconButton size="small" onClick={handleRemoveFile}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={handleFileButtonClick}
            fullWidth
            sx={{ 
              borderStyle: 'dashed', 
              py: 1.5,
              borderColor: theme.palette.divider,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.light, 0.05)
              }
            }}
          >
            파일 선택
          </Button>
        )}
        <FormHelperText>
          참고할 자료 파일을 첨부해주세요
        </FormHelperText>
      </Box>
    );
  };

  // 결과 보기 렌더링 개선
  const renderResults = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 8,
          minHeight: '500px'
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 4, fontWeight: 500 }}>
            AI가 이벤트 기획안을 생성하고 있습니다...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            입력하신 정보를 분석 중입니다
          </Typography>
        </Box>
      );
    }

    if (!aiResponse) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          py: 8,
          minHeight: '500px'
        }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3
          }}>
            <LightbulbIcon color="primary" sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            왼쪽에 정보를 입력하시면
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom fontWeight={600}>
            AI가 이벤트 기획안을 제안해 드립니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: '400px', textAlign: 'center' }}>
            제품 정보, 마케팅 목표, 타겟층 등의 정보를 입력할수록 더 정교한 제안을 받을 수 있습니다
          </Typography>
        </Box>
      );
    }

    return (
      <Box ref={resultRef}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Box>
            <Typography variant="h5" fontWeight={600} color="primary">
              이벤트 기획 제안
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI가 생성한 맞춤형 이벤트 기획안입니다
            </Typography>
          </Box>
          <Button 
            variant="contained"
            onClick={handleSaveAsPdf}
            size="medium"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 20, px: 2 }}
          >
            PDF 저장
          </Button>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
            {aiResponse.eventTitle}
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              position: 'relative',
              overflow: 'hidden',
              mb: 4,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: theme.palette.primary.main
              }
            }}
          >
            <Box sx={{ display: 'flex', mb: 2 }}>
              <FormatQuoteIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.3), mr: 1 }} />
            </Box>
            <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', pl: 1 }}>
              {aiResponse.eventConcept}
            </Typography>
          </Paper>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <ResultCard>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      mb: 2
                    }}
                  >
                    <CampaignIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>이벤트 유형</Typography>
                  <Typography variant="body2" align="center">{aiResponse.eventType}</Typography>
                </CardContent>
              </ResultCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <ResultCard>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      mb: 2
                    }}
                  >
                    <CalendarMonthIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>진행 기간</Typography>
                  <Typography variant="body2" align="center">{aiResponse.duration}</Typography>
                </CardContent>
              </ResultCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <ResultCard>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 4 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: theme.palette.primary.main,
                      width: 56,
                      height: 56,
                      mb: 2
                    }}
                  >
                    <GroupIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>대상 타겟</Typography>
                  <Typography variant="body2" align="center">{aiResponse.targetAudience}</Typography>
                </CardContent>
              </ResultCard>
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={{ width: '100%', mt: 4 }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 'auto',
              py: 1.5,
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '0.95rem'
            }
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 'auto' }}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="실행 계획" sx={{ minHeight: 'auto', py: 1 }} />
              <Tab label="예상 성과" sx={{ minHeight: 'auto', py: 1 }} />
              <Tab label="경품 구성" sx={{ minHeight: 'auto', py: 1 }} />
              <Tab label="포스팅 예시" sx={{ minHeight: 'auto', py: 1 }} />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">세부 실행 계획</Typography>
            <List>
              {aiResponse.executionSteps.map((step: string, index: number) => (
                <ListItemStyled key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar sx={{ 
                      width: 24, 
                      height: 24,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={step} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItemStyled>
              ))}
            </List>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 4, fontWeight: 600, color: 'primary.main' }}>추천 해시태그</Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              {aiResponse.hashtags.map((tag: string, index: number) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  color="primary" 
                  variant="outlined" 
                  size="medium"
                  icon={<LocalOfferIcon />} 
                />
              ))}
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">예상 성과</Typography>
            <List>
              {aiResponse.expectedResults.map((result: string, index: number) => (
                <ListItemStyled key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <AnalyticsIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={result} 
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                </ListItemStyled>
              ))}
            </List>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">제안 경품 구성</Typography>
            <List>
              {aiResponse.suggestedPrizes.map((prize: string, index: number) => (
                <ListItemStyled key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EmojiEventsIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={prize} 
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                  />
                </ListItemStyled>
              ))}
            </List>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">SNS 포스팅 예시</Typography>
            <Paper 
              sx={{ 
                p: 3, 
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                whiteSpace: 'pre-line',
                borderLeft: `4px solid ${theme.palette.primary.main}`
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontFamily: 'inherit' }}>
                {aiResponse.samplePost}
              </Typography>
            </Paper>
          </TabPanel>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mt: 3, bgcolor: alpha(theme.palette.background.default, 0.5), p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600} color="primary">
            피드백 제공
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            제안에 대한 피드백이나 수정 요청사항이 있으면 입력해주세요
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="예: '더 바이럴한 요소를 추가해주세요'"
            value={feedback}
            onChange={handleFeedbackChange}
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            size="medium"
            onClick={handleFeedbackSubmit}
            disabled={!feedback.trim()}
            endIcon={<SendIcon />}
            sx={{ borderRadius: 20, px: 3 }}
          >
            피드백 제출
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} color="primary">
          AI 기반 SNS 이벤트 기획
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          정보를 입력하고 실시간으로 AI가 제안하는 맞춤형 이벤트 기획안을 확인하세요
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {/* 좌측: 입력 폼 */}
        <Grid item xs={12} md={5}>
          <FormContainer elevation={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                <LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
                이벤트 정보 입력
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                필요한 정보를 입력하시면 AI가 맞춤형 이벤트 기획안을 제안합니다
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4, px: 2 }}>
              <Stepper 
                activeStep={activeStep} 
                sx={{ 
                  mb: 4,
                  '& .MuiStepConnector-line': {
                    minHeight: 5,
                    marginTop: '15px'
                  },
                  '& .MuiStepLabel-labelContainer': {
                    mt: 1
                  },
                  '& .MuiStepLabel-label': {
                    fontSize: '0.875rem',
                    textAlign: 'center'
                  },
                  '& .MuiStepLabel-label.Mui-active': {
                    fontWeight: 600,
                    color: theme.palette.primary.main
                  },
                  '& .MuiStep-root': {
                    padding: '0 8px'
                  }
                }}
              >
                {steps.map((label, index) => {
                  const stepProps: { completed?: boolean } = {};
                  
                  if (isStepSkipped(index)) {
                    stepProps.completed = false;
                  }
                  
                  return (
                    <Step key={label} {...stepProps}>
                      <StepLabel 
                        StepIconComponent={() => {
                          const isCompleted = activeStep > index;
                          const isActive = activeStep === index;
                          
                          return (
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                bgcolor: isCompleted 
                                  ? theme.palette.success.main 
                                  : isActive
                                    ? theme.palette.primary.main
                                    : theme.palette.grey[300],
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 600,
                                mx: 'auto',
                                boxShadow: isActive ? '0px 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
                                border: isActive ? `2px solid ${theme.palette.primary.light}` : 'none',
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {isCompleted ? (
                                <CheckCircleIcon fontSize="small" />
                              ) : (
                                index + 1
                              )}
                            </Avatar>
                          );
                        }}
                        sx={{
                          flexDirection: 'column',
                          '& .MuiStepLabel-iconContainer': {
                            padding: 0,
                            mb: 0.5
                          },
                          '& .MuiStepLabel-labelContainer': {
                            textAlign: 'center',
                            width: '100%'
                          }
                        }}
                      >
                        {label}
                        {isStepOptional(index) && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            선택사항
                          </Typography>
                        )}
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Box>
            
            <Box sx={{ mb: 4, minHeight: '300px' }}>
              {getStepContent(activeStep)}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                sx={{ borderRadius: '20px', px: 2 }}
              >
                이전
              </Button>
              <Box>
                {isStepOptional(activeStep) && activeStep !== steps.length - 1 && (
                  <Button
                    color="inherit"
                    onClick={handleSkip}
                    sx={{ mr: 1, borderRadius: '20px', px: 2 }}
                  >
                    건너뛰기
                  </Button>
                )}
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  disabled={activeStep === steps.length - 1}
                  sx={{ 
                    borderRadius: '20px', 
                    px: 3
                  }}
                >
                  다음
                </Button>
              </Box>
            </Box>
            
            {/* 이벤트 생성 버튼 추가 */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleGenerateEvent}
                startIcon={<LightbulbIcon />}
                disabled={loading}
                sx={{
                  borderRadius: '20px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 8px 16px rgba(63, 81, 181, 0.2)',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  '&:hover': {
                    boxShadow: '0 12px 20px rgba(63, 81, 181, 0.3)',
                  }
                }}
              >
                {loading ? '생성 중...' : '이벤트 기획 생성'}
              </Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                모든 필수 정보를 입력한 후 클릭하세요
              </Typography>
            </Box>
          </FormContainer>
        </Grid>
        
        {/* 우측: 결과 보기 */}
        <Grid item xs={12} md={7}>
          <ResultContainer elevation={2}>
            {renderResults()}
          </ResultContainer>
        </Grid>
      </Grid>
      
      {/* 에러 및 성공 메시지 표시를 위한 Snackbar 추가 */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {error || (aiResponse ? "이벤트 기획이 성공적으로 생성되었습니다!" : "작업이 완료되었습니다!")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IntegratedEventPage; 