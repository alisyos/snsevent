import { Configuration, OpenAIApi } from 'openai';

// 환경 변수에서 API 키를 가져오거나 설정에서 관리
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

// API 설정
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// 이벤트 기획을 위한 입력 데이터 인터페이스
export interface EventPlanningInput {
  productName: string;
  productCategory: string;
  productFeatures: string;
  targetAudience: string;
  marketingGoals: string[];
  kpiMetrics: string[];
  budget: string;
  platforms: string[];
  eventDuration: string;
  prizes?: string;
  brandTone?: string;
  additionalInfo?: string;
  referenceLinks?: string;
  referenceFile?: File | null;
}

// AI 응답 인터페이스
export interface AIEventResponse {
  eventTitle: string;
  eventConcept: string;
  eventType: string;
  platforms: string[];
  duration: string;
  targetAudience: string;
  executionSteps: string[];
  hashtags: string[];
  expectedResults: string[];
  suggestedPrizes: string[];
  samplePost: string;
}

/**
 * OpenAI API를 사용하여 이벤트 기획안을 생성하는 함수
 * @param eventData 사용자 입력 이벤트 데이터
 * @returns Promise<AIEventResponse> AI가 생성한 이벤트 기획안
 */
export const generateEventPlan = async (eventData: EventPlanningInput): Promise<AIEventResponse> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    // 프롬프트 구성
    const prompt = `
      다음 정보를 바탕으로 SNS 이벤트 기획안을 생성해주세요:
      
      제품/서비스 이름: ${eventData.productName}
      카테고리: ${eventData.productCategory}
      특징 및 장점: ${eventData.productFeatures}
      타겟 고객층: ${eventData.targetAudience}
      마케팅 목표: ${eventData.marketingGoals.join(', ')}
      KPI 지표: ${eventData.kpiMetrics.join(', ')}
      예산: ${eventData.budget}원
      플랫폼: ${eventData.platforms.join(', ')}
      이벤트 기간: ${eventData.eventDuration}
      ${eventData.prizes ? `경품 구성: ${eventData.prizes}` : ''}
      ${eventData.brandTone ? `브랜드 톤앤매너: ${eventData.brandTone}` : ''}
      ${eventData.additionalInfo ? `추가 정보: ${eventData.additionalInfo}` : ''}
      ${eventData.referenceLinks ? `참고 링크: ${eventData.referenceLinks}` : ''}
      
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

    console.log("=== OpenAI API 요청 정보 ===");
    console.log("입력 데이터:", JSON.stringify(eventData, null, 2));
    console.log("프롬프트:", prompt);

    // API 키가 없는 경우 목업 데이터 반환 (개발 모드)
    if (OPENAI_API_KEY === 'your_openai_api_key_here' || OPENAI_API_KEY === '') {
      console.log('개발 모드: API 키가 설정되지 않아 목업 데이터를 반환합니다.');
      // 목업 데이터 제공 (개발 목적)
      const mockData: AIEventResponse = {
        eventTitle: `${eventData.productName} SNS 챌린지: 함께하는 특별한 경험`,
        eventConcept: `사용자가 ${eventData.productName} 제품과 함께하는 창의적인 활동을 SNS에 공유하는 참여형 챌린지입니다. 
        해시태그를 활용해 참여자들의 콘텐츠를 모으고, 우수 참여자에게는 제품을 증정하는 방식으로 브랜드 인지도와 참여를 동시에 높일 수 있습니다.`,
        eventType: "UGC(User Generated Content) 챌린지",
        platforms: eventData.platforms,
        duration: eventData.eventDuration || "4주",
        targetAudience: eventData.targetAudience || "MZ세대, SNS 활동이 활발한 고객",
        executionSteps: [
          "1. 티저 콘텐츠 배포 (D-7): 인플루언서를 통해 챌린지 예고",
          "2. 공식 런칭 (D-Day): 브랜드 계정에서 챌린지 방법과 상품 안내",
          "3. 중간 리마인더 (D+14): 우수 참여 사례 소개 및 참여 독려",
          "4. 마감 임박 알림 (D+25): 마지막 참여 독려",
          "5. 수상자 발표 (D+30): 우수 참여자 10명 선정 및 발표"
        ],
        hashtags: [`#${eventData.productName}챌린지`, `#${eventData.productCategory}`, `#${eventData.productName}`, "#소통해요"],
        expectedResults: [
          "SNS 팔로워 15-20% 증가",
          "참여 게시물 500개 이상 예상",
          "해시태그 노출 50,000회 이상",
          "브랜드 웹사이트 트래픽 30% 증가"
        ],
        suggestedPrizes: [
          "1등(1명): 제품 풀세트 (가치 30만원)",
          "2등(3명): 신제품 패키지 (가치 15만원)",
          "3등(6명): 미니 샘플러 세트 (가치 5만원)"
        ],
        samplePost: `"특별한 순간을 #${eventData.productName}챌린지 와 함께 공유해보세요! 🌟

        📸 ${eventData.productName}과 함께하는 특별한 순간을 사진으로 찍어 해시태그와 함께 업로드
        🏆 창의적인 콘텐츠 작성자 총 10분께 경품을 드립니다!
        
        참여기간: 이벤트 기간
        당첨자 발표: 이벤트 종료 후 1주일 이내
        
        #${eventData.productName}챌린지 #${eventData.productCategory} #${eventData.productName}"`
      };
      
      console.log("목업 데이터 반환:", JSON.stringify(mockData, null, 2));
      return mockData;
    }

    // OpenAI API 호출
    console.log("API 호출 시작:", new Date().toISOString());
    const response = await openai.createChatCompletion({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "당신은 전문적인 SNS 마케팅 이벤트 기획자입니다." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    console.log("API 호출 완료:", new Date().toISOString());
    console.log("API 응답 상태:", response.status);
    console.log("API 응답 헤더:", JSON.stringify(response.headers, null, 2));
    
    // 응답 텍스트 분석 및 파싱
    const aiResponse = response.data.choices[0]?.message?.content || '';
    console.log("API 응답 내용:", aiResponse);
    
    // 파싱 결과
    const parsedResponse = parseAIResponse(aiResponse);
    console.log("파싱된 응답:", JSON.stringify(parsedResponse, null, 2));
    
    return parsedResponse;
  } catch (error: any) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    console.error('에러 상세 정보:', error.message);
    if (error.response) {
      console.error('에러 응답:', error.response.status);
      console.error('에러 데이터:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error('이벤트 기획 생성 중 오류가 발생했습니다.');
  }
};

/**
 * 사용자 피드백을 반영해 이벤트 기획안을 수정하는 함수
 * @param eventData 기존 이벤트 기획안
 * @param feedback 사용자 피드백
 * @returns Promise<AIEventResponse> 수정된 이벤트 기획안
 */
export const refineEventPlan = async (
  eventData: AIEventResponse, 
  feedback: string
): Promise<AIEventResponse> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    // 프롬프트 구성
    const prompt = `
      다음은 기존 SNS 이벤트 기획안입니다:
      
      제목: ${eventData.eventTitle}
      컨셉: ${eventData.eventConcept}
      유형: ${eventData.eventType}
      플랫폼: ${eventData.platforms.join(', ')}
      기간: ${eventData.duration}
      타겟 오디언스: ${eventData.targetAudience}
      실행 단계: 
      ${eventData.executionSteps.join('\n')}
      해시태그: ${eventData.hashtags.join(', ')}
      예상 성과: 
      ${eventData.expectedResults.join('\n')}
      경품 구성: 
      ${eventData.suggestedPrizes.join('\n')}
      SNS 포스팅 예시: 
      ${eventData.samplePost}
      
      사용자가 다음과 같은 피드백을 주었습니다:
      "${feedback}"
      
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

    // API 키가 없는 경우 목업 데이터 반환 (개발 모드)
    if (OPENAI_API_KEY === 'your_openai_api_key_here' || OPENAI_API_KEY === '') {
      console.log('개발 모드: API 키가 설정되지 않아 목업 데이터를 반환합니다.');
      // 간단한 수정된 목업 반환
      return {
        ...eventData,
        eventTitle: `${eventData.eventTitle} (피드백 반영)`,
        eventConcept: `${eventData.eventConcept} 피드백을 반영하여 ${feedback.substring(0, 30)}... 부분을 개선했습니다.`,
      };
    }

    // OpenAI API 호출
    const response = await openai.createChatCompletion({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "당신은 전문적인 SNS 마케팅 이벤트 기획자입니다." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // 응답 텍스트 분석 및 파싱
    const aiResponse = response.data.choices[0]?.message?.content || '';
    return parseAIResponse(aiResponse);
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    throw new Error('이벤트 기획 수정 중 오류가 발생했습니다.');
  }
};

// AI 응답을 파싱하는 함수 개선
const parseAIResponse = (responseText: string): AIEventResponse => {
  console.log("=== 파싱 시작 ===");
  console.log("원본 텍스트:", responseText);
  
  try {
    // 기본 응답 템플릿 (실패 시 폴백)
    let result: AIEventResponse = {
      eventTitle: "이벤트 제목 파싱 실패",
      eventConcept: "이벤트 컨셉을 파싱하지 못했습니다.",
      eventType: "기본 이벤트",
      platforms: ["Instagram"],
      duration: "4주",
      targetAudience: "일반 고객",
      executionSteps: ["1. 계획 수립", "2. 이벤트 실행", "3. 결과 분석"],
      hashtags: ["#이벤트", "#브랜드"],
      expectedResults: ["브랜드 인지도 상승"],
      suggestedPrizes: ["경품 미정"],
      samplePost: "이벤트 포스팅 예시를 생성하지 못했습니다."
    };

    // 응답 텍스트 분석
    if (responseText) {
      // 이벤트 제목 추출 (개선된 패턴)
      const titleMatch = responseText.match(/(?:^|\n)1\.[\s]*(?:이벤트 제목:?[\s]*)?(.*?)(?:\n|$)/i);
      console.log("제목 매칭:", titleMatch);
      if (titleMatch && titleMatch[1]) {
        result.eventTitle = titleMatch[1].trim();
      }

      // 이벤트 컨셉 추출 (개선된 패턴)
      const conceptMatch = responseText.match(/(?:^|\n)2\.[\s]*(?:이벤트 컨셉:?[\s]*)([\s\S]*?)(?=(?:^|\n)3\.)/i);
      console.log("컨셉 매칭:", conceptMatch);
      if (conceptMatch && conceptMatch[1]) {
        result.eventConcept = conceptMatch[1].trim();
      }

      // 이벤트 유형 추출 (개선된 패턴)
      const typeMatch = responseText.match(/(?:^|\n)3\.[\s]*(?:이벤트 유형:?[\s]*)(.*?)(?:\n|$)/i);
      console.log("유형 매칭:", typeMatch);
      if (typeMatch && typeMatch[1]) {
        result.eventType = typeMatch[1].trim();
      }

      // 플랫폼 추출 (개선된 패턴)
      const platformMatch = responseText.match(/(?:^|\n)4\.[\s]*(?:플랫폼:?[\s]*)(.*?)(?:\n|$)/i);
      console.log("플랫폼 매칭:", platformMatch);
      if (platformMatch && platformMatch[1]) {
        result.platforms = platformMatch[1].split(/,|\s*\/\s*/).map(p => p.trim()).filter(p => p);
      }

      // 기간 추출 (개선된 패턴)
      const durationMatch = responseText.match(/(?:^|\n)5\.[\s]*(?:기간:?[\s]*)(.*?)(?:\n|$)/i);
      console.log("기간 매칭:", durationMatch);
      if (durationMatch && durationMatch[1]) {
        result.duration = durationMatch[1].trim();
      }

      // 타겟 오디언스 추출 (개선된 패턴)
      const audienceMatch = responseText.match(/(?:^|\n)6\.[\s]*(?:타겟 오디언스:?[\s]*)(.*?)(?:\n|$)/i);
      console.log("타겟 매칭:", audienceMatch);
      if (audienceMatch && audienceMatch[1]) {
        result.targetAudience = audienceMatch[1].trim();
      }

      // 실행 단계 추출 (개선된 패턴)
      const stepsSection = responseText.match(/(?:^|\n)7\.[\s]*(?:실행 단계:?[\s]*)([\s\S]*?)(?=(?:^|\n)8\.)/i);
      console.log("실행 단계 섹션:", stepsSection);
      if (stepsSection && stepsSection[1]) {
        const stepsText = stepsSection[1].trim();
        // 단계별 줄바꿈 또는 번호로 구분된 항목 추출
        const steps = stepsText.split(/\n+/)
          .map(step => step.trim())
          .filter(step => step && /^(?:\d+\.|-|\*)/.test(step));
        console.log("추출된 실행 단계:", steps);
        if (steps.length > 0) {
          result.executionSteps = steps;
        } else {
          // 번호가 없는 경우에도 추출 시도
          const fallbackSteps = stepsText.split(/\n+/)
            .map(step => step.trim())
            .filter(step => step);
          if (fallbackSteps.length > 0) {
            result.executionSteps = fallbackSteps;
          }
        }
      }

      // 해시태그 추출 (개선된 패턴)
      const hashtagsSection = responseText.match(/(?:^|\n)8\.[\s]*(?:추천 해시태그:?[\s]*)([\s\S]*?)(?=(?:^|\n)9\.)/i);
      console.log("해시태그 섹션:", hashtagsSection);
      if (hashtagsSection && hashtagsSection[1]) {
        let hashtags: string[] = [];
        const hashtagText = hashtagsSection[1].trim();
        
        // 해시태그에 # 기호가 포함된 경우
        const hashWithSymbol = hashtagText.match(/(#\w+)/g);
        if (hashWithSymbol && hashWithSymbol.length > 0) {
          hashtags = hashWithSymbol;
        } else {
          // 쉼표나 줄바꿈으로 구분된 경우
          hashtags = hashtagText.split(/,|\n/)
            .map(tag => {
              const trimmed = tag.trim();
              return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
            })
            .filter(tag => tag && tag !== '#');
        }
        
        console.log("추출된 해시태그:", hashtags);
        if (hashtags.length > 0) {
          result.hashtags = hashtags;
        }
      }

      // 예상 성과 추출 (개선된 패턴)
      const resultsSection = responseText.match(/(?:^|\n)9\.[\s]*(?:예상 성과:?[\s]*)([\s\S]*?)(?=(?:^|\n)10\.)/i);
      console.log("예상 성과 섹션:", resultsSection);
      if (resultsSection && resultsSection[1]) {
        const resultsText = resultsSection[1].trim();
        const results = resultsText.split(/\n+/)
          .map(r => r.trim())
          .filter(r => r && /^(?:\d+\.|-|\*)/.test(r));
        console.log("추출된 예상 성과:", results);
        if (results.length > 0) {
          result.expectedResults = results;
        } else {
          // 번호가 없는 경우에도 추출 시도
          const fallbackResults = resultsText.split(/\n+/)
            .map(r => r.trim())
            .filter(r => r);
          if (fallbackResults.length > 0) {
            result.expectedResults = fallbackResults;
          }
        }
      }

      // 경품 구성 추출 (개선된 패턴)
      const prizesSection = responseText.match(/(?:^|\n)10\.[\s]*(?:경품 구성 추천:?[\s]*)([\s\S]*?)(?=(?:^|\n)11\.)/i);
      console.log("경품 구성 섹션:", prizesSection);
      if (prizesSection && prizesSection[1]) {
        const prizesText = prizesSection[1].trim();
        const prizes = prizesText.split(/\n+/)
          .map(p => p.trim())
          .filter(p => p && /^(?:\d+\.|-|\*)/.test(p));
        console.log("추출된 경품 구성:", prizes);
        if (prizes.length > 0) {
          result.suggestedPrizes = prizes;
        } else {
          // 번호가 없는 경우에도 추출 시도
          const fallbackPrizes = prizesText.split(/\n+/)
            .map(p => p.trim())
            .filter(p => p);
          if (fallbackPrizes.length > 0) {
            result.suggestedPrizes = fallbackPrizes;
          }
        }
      }

      // SNS 포스팅 예시 추출 (개선된 패턴)
      const postMatch = responseText.match(/(?:^|\n)11\.[\s]*(?:SNS 포스팅 예시:?[\s]*)([\s\S]*?)(?:$)/i);
      console.log("포스팅 예시 매칭:", postMatch);
      if (postMatch && postMatch[1]) {
        result.samplePost = postMatch[1].trim();
      }
    }

    console.log("=== 최종 파싱 결과 ===");
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('AI 응답 파싱 중 오류 발생:', error);
    // 기본 응답 반환
    return {
      eventTitle: "이벤트 제목 파싱 오류",
      eventConcept: "응답 파싱 중 오류가 발생했습니다.",
      eventType: "기본 이벤트",
      platforms: ["Instagram"],
      duration: "4주",
      targetAudience: "일반 고객",
      executionSteps: ["1. 계획 수립", "2. 이벤트 실행", "3. 결과 분석"],
      hashtags: ["#이벤트", "#브랜드"],
      expectedResults: ["브랜드 인지도 상승"],
      suggestedPrizes: ["경품 미정"],
      samplePost: "이벤트 포스팅 예시를 생성하지 못했습니다."
    };
  }
};

export default {
  generateEventPlan,
  refineEventPlan
}; 