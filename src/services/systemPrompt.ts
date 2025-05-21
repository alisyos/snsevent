// systemPrompt.ts
// 시스템 프롬프트 관리 서비스

// 로컬 스토리지 키
const SYSTEM_PROMPT_KEY = 'sns_event_system_prompt';
const USER_PROMPT_TEMPLATE_KEY = 'sns_event_user_prompt_template';
const FEEDBACK_PROMPT_TEMPLATE_KEY = 'sns_event_feedback_prompt_template';

// 기본 시스템 프롬프트
const DEFAULT_SYSTEM_PROMPT = "당신은 전문적인 SNS 마케팅 이벤트 기획자입니다.";

// 기본 사용자 프롬프트 템플릿
const DEFAULT_USER_PROMPT_TEMPLATE = `
  다음 정보를 바탕으로 SNS 이벤트 기획안을 생성해주세요:
  
  제품/서비스 이름: {productName}
  카테고리: {productCategory}
  특징 및 장점: {productFeatures}
  타겟 고객층: {targetAudience}
  마케팅 목표: {marketingGoals}
  KPI 지표: {kpiMetrics}
  예산: {budget}원
  플랫폼: {platforms}
  이벤트 기간: {eventDuration}
  {prizes}
  {brandTone}
  {additionalInfo}
  {referenceLinks}
  
  다음 형식으로 응답해주세요:
  1. 이벤트 제목
  2. 이벤트 컨셉 (2~3문장)
  3. 이벤트 유형 (예: UGC 챌린지, 해시태그 이벤트 등)
  4. 플랫폼
  5. 기간
  6. 타겟 오디언스
  7. 실행 단계 (5단계 이상)
  8. 추천 해시태그 (4개 이상)
  9. 예상 성과 (4가지 이상)
  10. 경품 구성 추천
  11. SNS 포스팅 예시 (1개)
`;

// 기본 피드백 프롬프트 템플릿
const DEFAULT_FEEDBACK_PROMPT_TEMPLATE = `
  다음은 기존 SNS 이벤트 기획안입니다:
  
  제목: {eventTitle}
  컨셉: {eventConcept}
  유형: {eventType}
  플랫폼: {platforms}
  기간: {duration}
  타겟 오디언스: {targetAudience}
  실행 단계: 
  {executionSteps}
  해시태그: {hashtags}
  예상 성과: 
  {expectedResults}
  경품 구성: 
  {suggestedPrizes}
  SNS 포스팅 예시: 
  {samplePost}
  
  사용자가 다음과 같은 피드백을 주었습니다:
  "{feedback}"
  
  이 피드백을 반영하여 기획안을 수정하고 다음 형식으로 응답해주세요:
  1. 이벤트 제목
  2. 이벤트 컨셉 (2~3문장)
  3. 이벤트 유형 (예: UGC 챌린지, 해시태그 이벤트 등)
  4. 플랫폼
  5. 기간
  6. 타겟 오디언스
  7. 실행 단계 (5단계 이상)
  8. 추천 해시태그 (4개 이상)
  9. 예상 성과 (4가지 이상)
  10. 경품 구성 추천
  11. SNS 포스팅 예시 (1개)
`;

// 히스토리 공통 인터페이스
export interface PromptHistory {
  id: string;
  prompt: string;
  date: string;
  description: string;
}

// 초기화 함수: 앱 시작 시 실행
export const initializeSystemPrompt = (): void => {
  if (!localStorage.getItem(SYSTEM_PROMPT_KEY)) {
    localStorage.setItem(SYSTEM_PROMPT_KEY, DEFAULT_SYSTEM_PROMPT);
    console.log('시스템 프롬프트 초기화됨:', DEFAULT_SYSTEM_PROMPT);
  }
  
  if (!localStorage.getItem(USER_PROMPT_TEMPLATE_KEY)) {
    localStorage.setItem(USER_PROMPT_TEMPLATE_KEY, DEFAULT_USER_PROMPT_TEMPLATE);
    console.log('사용자 프롬프트 템플릿 초기화됨');
  }
  
  if (!localStorage.getItem(FEEDBACK_PROMPT_TEMPLATE_KEY)) {
    localStorage.setItem(FEEDBACK_PROMPT_TEMPLATE_KEY, DEFAULT_FEEDBACK_PROMPT_TEMPLATE);
    console.log('피드백 프롬프트 템플릿 초기화됨');
  }
};

// 앱 시작 시 초기화 실행
initializeSystemPrompt();

// 현재 시스템 프롬프트 가져오기
export const getSystemPrompt = (): string => {
  const savedPrompt = localStorage.getItem(SYSTEM_PROMPT_KEY);
  // 여전히 값이 없으면 기본값 반환 (안전장치)
  if (!savedPrompt) {
    console.log('프롬프트가 저장되어 있지 않아 기본값을 반환합니다');
    localStorage.setItem(SYSTEM_PROMPT_KEY, DEFAULT_SYSTEM_PROMPT);
    return DEFAULT_SYSTEM_PROMPT;
  }
  return savedPrompt;
};

// 시스템 프롬프트 저장하기
export const saveSystemPrompt = (prompt: string): void => {
  localStorage.setItem(SYSTEM_PROMPT_KEY, prompt);
};

// 시스템 프롬프트 초기화하기 (기본값으로)
export const resetSystemPrompt = (): void => {
  localStorage.setItem(SYSTEM_PROMPT_KEY, DEFAULT_SYSTEM_PROMPT);
};

// 사용자 프롬프트 템플릿 관리 함수들
export const getUserPromptTemplate = (): string => {
  const savedTemplate = localStorage.getItem(USER_PROMPT_TEMPLATE_KEY);
  if (!savedTemplate) {
    localStorage.setItem(USER_PROMPT_TEMPLATE_KEY, DEFAULT_USER_PROMPT_TEMPLATE);
    return DEFAULT_USER_PROMPT_TEMPLATE;
  }
  return savedTemplate;
};

export const saveUserPromptTemplate = (template: string): void => {
  localStorage.setItem(USER_PROMPT_TEMPLATE_KEY, template);
};

export const resetUserPromptTemplate = (): void => {
  localStorage.setItem(USER_PROMPT_TEMPLATE_KEY, DEFAULT_USER_PROMPT_TEMPLATE);
};

// 피드백 프롬프트 템플릿 관리 함수들
export const getFeedbackPromptTemplate = (): string => {
  const savedTemplate = localStorage.getItem(FEEDBACK_PROMPT_TEMPLATE_KEY);
  if (!savedTemplate) {
    localStorage.setItem(FEEDBACK_PROMPT_TEMPLATE_KEY, DEFAULT_FEEDBACK_PROMPT_TEMPLATE);
    return DEFAULT_FEEDBACK_PROMPT_TEMPLATE;
  }
  return savedTemplate;
};

export const saveFeedbackPromptTemplate = (template: string): void => {
  localStorage.setItem(FEEDBACK_PROMPT_TEMPLATE_KEY, template);
};

export const resetFeedbackPromptTemplate = (): void => {
  localStorage.setItem(FEEDBACK_PROMPT_TEMPLATE_KEY, DEFAULT_FEEDBACK_PROMPT_TEMPLATE);
};

// 히스토리 키
const SYSTEM_PROMPT_HISTORY_KEY = 'sns_event_system_prompt_history';
const USER_PROMPT_HISTORY_KEY = 'sns_event_user_prompt_history';

// 시스템 프롬프트 히스토리 저장
export const savePromptToHistory = (prompt: string, description: string = ''): void => {
  const history = getPromptHistory();
  const newEntry: PromptHistory = {
    id: Date.now().toString(),
    prompt,
    date: new Date().toISOString(),
    description: description || `프롬프트 업데이트 ${new Date().toLocaleString()}`,
  };
  
  history.unshift(newEntry);
  
  // 최대 20개까지만 저장
  if (history.length > 20) {
    history.pop();
  }
  
  localStorage.setItem(SYSTEM_PROMPT_HISTORY_KEY, JSON.stringify(history));
};

// 시스템 프롬프트 히스토리 가져오기
export const getPromptHistory = (): PromptHistory[] => {
  const historyString = localStorage.getItem(SYSTEM_PROMPT_HISTORY_KEY);
  return historyString ? JSON.parse(historyString) : [];
};

// 특정 시스템 프롬프트 히스토리 항목 삭제
export const deletePromptHistory = (id: string): void => {
  const history = getPromptHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(SYSTEM_PROMPT_HISTORY_KEY, JSON.stringify(updatedHistory));
};

// 사용자 프롬프트 템플릿 히스토리 저장
export const saveUserPromptToHistory = (prompt: string, description: string = ''): void => {
  const history = getUserPromptHistory();
  const newEntry: PromptHistory = {
    id: Date.now().toString(),
    prompt,
    date: new Date().toISOString(),
    description: description || `사용자 프롬프트 업데이트 ${new Date().toLocaleString()}`,
  };
  
  history.unshift(newEntry);
  
  // 최대 20개까지만 저장
  if (history.length > 20) {
    history.pop();
  }
  
  localStorage.setItem(USER_PROMPT_HISTORY_KEY, JSON.stringify(history));
};

// 사용자 프롬프트 템플릿 히스토리 가져오기
export const getUserPromptHistory = (): PromptHistory[] => {
  const historyString = localStorage.getItem(USER_PROMPT_HISTORY_KEY);
  return historyString ? JSON.parse(historyString) : [];
};

// 특정 사용자 프롬프트 템플릿 히스토리 항목 삭제
export const deleteUserPromptHistory = (id: string): void => {
  const history = getUserPromptHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(USER_PROMPT_HISTORY_KEY, JSON.stringify(updatedHistory));
}; 