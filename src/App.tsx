import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Send, Heart, ArrowRight, ChevronLeft, Trophy, MessageSquare, RefreshCw, Bot, Settings2, MapPin, User as UserIcon, Sparkles, Loader2, Clock, Calendar, Flame, AlertCircle, Share2, Languages } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { Message, Evaluation, AppState, Persona, Difficulty, Scenario, Gender, UserProfile, Language } from './types';

const TRANSLATIONS = {
  ko: {
    title: '모쏠탈출 시뮬',
    subtitle: '연애 시뮬레이션을 위한 기본 정보를 알려주세요.',
    whoAreYou: '당신은 누구신가요?',
    nickname: '닉네임',
    nicknamePlaceholder: '닉네임을 입력하세요',
    gender: '성별',
    male: '남성',
    female: '여성',
    next: '다음 단계로',
    setupTitle: '대화 설정을 완료하세요',
    setupSubtitle: '당신에게 맞는 난이도와 상황을 골라보세요.',
    scenario: '대화 상황',
    difficulty: '대화 난이도',
    startMatching: '상대방 매칭하기',
    matchingTitle: '상대방을 찾는 중...',
    matchingSubtitle: '당신과 가장 잘 어울리는 상대를 매칭하고 있어요.',
    typing: '상대방이 입력 중...',
    remainingChat: '남은 대화',
    endChat: '대화 끝내고 결과 보기',
    inputPlaceholder: '메시지를 입력하세요...',
    evaluatingTitle: '대화를 분석 중입니다...',
    evaluatingSubtitle: '당신의 매력 포인트를 찾고 있어요.',
    resultTitle: '당신의 연애 점수',
    summary: '총평',
    strengths: '잘한 점',
    weaknesses: '아쉬운 점',
    retry: '다시 도전하기',
    share: '결과 공유하기',
    shareSuccess: '결과가 클립보드에 복사되었습니다!',
    shareTitle: '나의 연애 시뮬레이션 결과',
    score: '점수',
    feedback: '피드백',
    hashtags: '#모쏠탈출 #연애시뮬레이션',
    scenarios: {
      blind_date: '소개팅',
      club: '동호회 모임',
      work: '직장/업무',
      random: '우연한 만남',
      conflict: '갈등 상황'
    },
    difficulties: {
      easy: { label: '쉬움', desc: '상대방이 대화를 적극적으로 이끌어줍니다.' },
      normal: { label: '보통', desc: '일반적인 첫 만남 수준의 대화 난이도입니다.' },
      hard: { label: '어려움', desc: '상대방이 조금 까다롭거나 단답형일 수 있습니다.' },
      hell: { label: '헬모드', desc: '상대방이 매우 화가 나 있습니다. 당신이 먼저 말을 걸어야 합니다.' }
    }
  },
  en: {
    title: 'Solo Escape Sim',
    subtitle: 'Please provide basic info for the dating simulation.',
    whoAreYou: 'Who are you?',
    nickname: 'Nickname',
    nicknamePlaceholder: 'Enter your nickname',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    next: 'Next Step',
    setupTitle: 'Complete Chat Setup',
    setupSubtitle: 'Choose the difficulty and scenario that fits you.',
    scenario: 'Scenario',
    difficulty: 'Difficulty',
    startMatching: 'Start Matching',
    matchingTitle: 'Finding a Match...',
    matchingSubtitle: 'Matching you with the best partner.',
    typing: 'Partner is typing...',
    remainingChat: 'Remaining',
    endChat: 'End Chat & See Results',
    inputPlaceholder: 'Type a message...',
    evaluatingTitle: 'Analyzing Chat...',
    evaluatingSubtitle: 'Finding your charm points.',
    resultTitle: 'Your Dating Score',
    summary: 'Summary',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
    retry: 'Try Again',
    share: 'Share Result',
    shareSuccess: 'Result copied to clipboard!',
    shareTitle: 'My Dating Simulation Result',
    score: 'Score',
    feedback: 'Feedback',
    hashtags: '#SoloEscape #DatingSim',
    scenarios: {
      blind_date: 'Blind Date',
      club: 'Social Club',
      work: 'Workplace',
      random: 'Random Encounter',
      conflict: 'Conflict Situation'
    },
    difficulties: {
      easy: { label: 'Easy', desc: 'The partner leads the conversation actively.' },
      normal: { label: 'Normal', desc: 'Standard first-meeting conversation level.' },
      hard: { label: 'Hard', desc: 'The partner might be picky or use short answers.' },
      hell: { label: 'Hell', desc: 'The partner is very angry. You must speak first.' }
    }
  }
};

const PERSONAS: Persona[] = [
  {
    id: 'minji',
    name: { ko: '민지', en: 'Minji' },
    gender: 'female',
    description: { ko: '카페 투어와 여행을 좋아하는 밝고 친근한 성격', en: 'Bright and friendly personality who loves cafe tours and traveling' },
    avatar: 'https://picsum.photos/seed/minji/200',
    initialMessages: {
      blind_date: { ko: '안녕하세요! 오늘 날씨 진짜 좋지 않아요? 혹시 근처에 괜찮은 카페 아시는 데 있나요?', en: 'Hello! Isn\'t the weather great today? Do you happen to know any good cafes nearby?' },
      club: { ko: '안녕하세요! 이번 모임 처음이신가요? 저는 저번부터 나오기 시작했는데 반가워요!', en: 'Hi! Is this your first time at this meeting? I started coming last time, nice to meet you!' },
      work: { ko: '안녕하세요, 대리님. 아까 회의 때 말씀하신 그 프로젝트 관련해서 잠깐 여쭤봐도 될까요?', en: 'Hello, Manager. Can I ask you a quick question about the project you mentioned in the meeting earlier?' },
      random: { ko: '저기요, 혹시 실례가 안 된다면... 가방 어디서 사셨는지 여쭤봐도 될까요? 너무 제 스타일이라서요!', en: 'Excuse me, if you don\'t mind... could I ask where you bought your bag? It\'s totally my style!' },
      conflict: { ko: '...지금 몇 시인지 알아요? 벌써 30분이나 지났는데 이제 오면 어떡해요?', en: '...Do you know what time it is? It\'s been 30 minutes, how can you just show up now?' }
    },
    systemPrompt: {
      ko: '당신은 "민지"라는 이름의 20대 중반 여성입니다. 밝고 친근하며 리액션이 좋습니다. 카페 투어와 여행을 좋아합니다.',
      en: 'You are a mid-20s woman named "Minji". You are bright, friendly, and have great reactions. You love cafe tours and traveling.'
    }
  },
  {
    id: 'jihoon',
    name: { ko: '지훈', en: 'Jihoon' },
    gender: 'male',
    description: { ko: '독서와 영화를 즐기는 차분하고 지적인 성격', en: 'Calm and intellectual personality who enjoys reading and movies' },
    avatar: 'https://picsum.photos/seed/jihoon/200',
    initialMessages: {
      blind_date: { ko: '안녕하세요. 혹시 최근에 본 영화 중에 기억에 남는 거 있으세요? 저는 어제 본 영화가 계속 생각나서요.', en: 'Hello. Have you seen any memorable movies lately? I can\'t stop thinking about the one I saw yesterday.' },
      club: { ko: '안녕하세요. 오늘 모임 주제가 꽤 흥미롭네요. 평소에도 이런 분야에 관심이 많으셨나요?', en: 'Hi. Today\'s meeting topic is quite interesting. Have you always been interested in this field?' },
      work: { ko: '안녕하세요. 이번에 새로 오신 분 맞으시죠? 업무 적응하시느라 고생이 많으시네요.', en: 'Hello. You\'re the new person, right? You must be working hard to adjust to the work.' },
      random: { ko: '실례합니다. 혹시 이 근처에 조용히 책 읽기 좋은 서점이 어디 있는지 아시나요?', en: 'Excuse me. Do you happen to know if there\'s a quiet bookstore nearby where I can read?' },
      conflict: { ko: '기다리는 게 익숙하긴 하지만, 오늘은 좀 너무하시네요. 연락이라도 미리 주시지 그랬어요.', en: 'I\'m used to waiting, but today is a bit much. You could have at least contacted me in advance.' }
    },
    systemPrompt: {
      ko: '당신은 "지훈"이라는 이름의 20대 후반 남성입니다. 차분하고 지적이며 예의가 바릅니다. 독서와 영화를 좋아합니다.',
      en: 'You are a late-20s man named "Jihoon". You are calm, intellectual, and polite. You love reading and movies.'
    }
  },
  {
    id: 'seoyeon',
    name: { ko: '서연', en: 'Seoyeon' },
    gender: 'female',
    description: { ko: '운동과 야외 활동을 즐기는 활기찬 성격', en: 'Energetic personality who enjoys exercise and outdoor activities' },
    avatar: 'https://picsum.photos/seed/seoyeon/200',
    initialMessages: {
      blind_date: { ko: '와! 오늘 진짜 운동하기 딱 좋은 날씨네요! 혹시 평소에 운동 좋아하세요?', en: 'Wow! It\'s perfect weather for exercising today! Do you usually like exercising?' },
      club: { ko: '안녕하세요! 오늘 활동 진짜 기대돼요! 평소에도 이런 액티비티 자주 즐기시는 편인가요?', en: 'Hi! I\'m really looking forward to today\'s activity! Do you often enjoy these kinds of activities?' },
      work: { ko: '안녕하세요! 혹시 점심 드셨나요? 근처에 새로 생긴 샐러드 가게가 진짜 맛있다는데 같이 가실래요?', en: 'Hi! Have you had lunch yet? There\'s a new salad place nearby that\'s really good, want to go together?' },
      random: { ko: '저기요! 혹시 이 근처에 러닝 코스 괜찮은 데 아세요? 오늘 처음 와봐서요!', en: 'Excuse me! Do you know any good running courses around here? It\'s my first time here today!' },
      conflict: { ko: '와... 나 여기서 한 시간 동안 서 있었어. 진짜 너무한 거 아냐? 나 그냥 갈래.', en: 'Wow... I\'ve been standing here for an hour. Isn\'t this too much? I\'m just going to leave.' }
    },
    systemPrompt: {
      ko: '당신은 "서연"이라는 이름의 20대 초반 여성입니다. 에너지가 넘치고 활발합니다. 운동과 야외 활동을 매우 좋아합니다.',
      en: 'You are a early-20s woman named "Seoyeon". You are energetic and active. You love exercise and outdoor activities very much.'
    }
  },
  {
    id: 'taehyun',
    name: { ko: '태현', en: 'Taehyun' },
    gender: 'male',
    description: { ko: '음악과 패션을 좋아하는 트렌디한 성격', en: 'Trendy personality who loves music and fashion' },
    avatar: 'https://picsum.photos/seed/taehyun/200',
    initialMessages: {
      blind_date: { ko: '안녕하세요! 오늘 스타일이 되게 좋으시네요. 혹시 평소에 패션에 관심 많으세요?', en: 'Hi! You have a great style today. Are you usually interested in fashion?' },
      club: { ko: '안녕하세요! 여기 분위기 되게 힙하네요. 이런 곳 자주 오시나요?', en: 'Hi! The atmosphere here is really hip. Do you come to places like this often?' },
      work: { ko: '안녕하세요. 아까 회의 때 하신 말씀 인상 깊었어요. 혹시 나중에 커피 한 잔 하면서 더 얘기 나눌 수 있을까요?', en: 'Hello. What you said in the meeting earlier was impressive. Could we talk more over coffee later?' },
      random: { ko: '저기요, 혹시 지금 흐르는 노래 제목 아세요? 너무 좋아서요!', en: 'Excuse me, do you know the title of the song playing right now? It\'s so good!' },
      conflict: { ko: '아, 왔어요? 나 벌써 커피 두 잔째 마시고 있는데. 시간 약속은 기본 아닌가?', en: 'Oh, you\'re here? I\'m already on my second cup of coffee. Isn\'t keeping time basic?' }
    },
    systemPrompt: {
      ko: '당신은 "태현"이라는 이름의 20대 중반 남성입니다. 트렌디하고 감각적입니다. 음악과 패션을 좋아합니다.',
      en: 'You are a mid-20s man named "Taehyun". You are trendy and sensible. You love music and fashion.'
    }
  },
  {
    id: 'yujin',
    name: { ko: '유진', en: 'Yujin' },
    gender: 'female',
    description: { ko: '커리어를 중시하는 세련되고 우아한 성격', en: 'Sophisticated and elegant personality who values career' },
    avatar: 'https://picsum.photos/seed/yujin/200',
    initialMessages: {
      blind_date: { ko: '안녕하세요. 오늘 와인 리스트가 꽤 괜찮네요. 평소에도 와인 즐겨 마시나요?', en: 'Hello. The wine list is quite good today. Do you usually enjoy drinking wine?' },
      club: { ko: '반가워요. 재즈 공연은 처음이신가요? 저는 이 아티스트를 꽤 좋아해서 자주 와요.', en: 'Nice to meet you. Is this your first jazz performance? I like this artist quite a bit, so I come often.' },
      work: { ko: '수고 많으셨어요. 이번 프로젝트 결과가 좋아서 다행이에요. 혹시 피드백 드릴 시간 괜찮으실까요?', en: 'Good job. I\'m glad the project result was good. Do you have time for some feedback?' },
      random: { ko: '실례합니다. 혹시 이 근처에 조용히 업무 보기 좋은 라운지가 어디 있는지 아시나요?', en: 'Excuse me. Do you happen to know if there\'s a quiet lounge nearby where I can work?' },
      conflict: { ko: '비즈니스 매너의 기본은 시간 엄수라고 생각하는데, 제가 너무 엄격한 걸까요?', en: 'I think the basis of business manners is punctuality. Am I being too strict?' }
    },
    systemPrompt: {
      ko: '당신은 "유진"이라는 이름의 30대 초반 여성입니다. 전문직에 종사하며 세련되고 논리적입니다. 재즈와 와인을 좋아합니다.',
      en: 'You are a early-30s woman named "Yujin". You are a professional, sophisticated, and logical. You love jazz and wine.'
    }
  },
  {
    id: 'junwoo',
    name: { ko: '준우', en: 'Junwoo' },
    gender: 'male',
    description: { ko: '수줍음이 많지만 관심 분야에는 열정적인 공대생 스타일', en: 'Shy but passionate about interests, engineering student style' },
    avatar: 'https://picsum.photos/seed/junwoo/200',
    initialMessages: {
      blind_date: { ko: '아... 안녕하세요. 제가 이런 자리가 처음이라 좀 서투른데... 혹시 게임 좋아하세요?', en: 'Ah... hello. This is my first time in a place like this, so I\'m a bit clumsy... do you like games?' },
      club: { ko: '안녕하세요. 이번에 새로 나온 그래픽 카드 보셨나요? 성능이 진짜 대박이더라고요.', en: 'Hi. Did you see the new graphics card that came out? The performance is really amazing.' },
      work: { ko: '저... 선배님. 아까 코드 리뷰 해주신 거 보고 궁금한 게 생겨서 왔는데, 지금 바쁘신가요?', en: 'Um... senior. I saw the code review you did earlier and had some questions, are you busy now?' },
      random: { ko: '저기... 혹시 지금 쓰시는 키보드 모델명이 뭔지 여쭤봐도 될까요? 타건음이 너무 좋아서요.', en: 'Excuse me... could I ask what keyboard model you\'re using? The typing sound is so good.' },
      conflict: { ko: '제가 뭘 잘못했는지 코드로 짜서 보여주시면 안 될까요? 말로는 잘 이해가 안 돼서요...', en: 'Could you write out what I did wrong in code and show me? I don\'t really understand in words...' }
    },
    systemPrompt: {
      ko: '당신은 "준우"라는 이름의 20대 초반 남성입니다. 내성적이고 수줍음이 많지만, IT 기기나 게임 이야기에는 눈을 반짝입니다.',
      en: 'You are a early-20s man named "Junwoo". You are introverted and shy, but your eyes sparkle when talking about IT devices or games.'
    }
  },
  {
    id: 'hayun',
    name: { ko: '하윤', en: 'Hayun' },
    gender: 'female',
    description: { ko: '자유분방하고 예술적인 감각을 지닌 몽환적인 성격', en: 'Free-spirited and artistic personality with a dreamy vibe' },
    avatar: 'https://picsum.photos/seed/hayun/200',
    initialMessages: {
      blind_date: { ko: '안녕하세요. 오늘 입으신 옷 색감이 마치 모네의 그림 같네요. 평소에 전시회 자주 가세요?', en: 'Hello. The colors of your clothes today are like a Monet painting. Do you often go to exhibitions?' },
      club: { ko: '반가워요. 이 인디 밴드 노래 가사가 너무 시적이지 않나요? 듣고 있으면 마음이 편해져요.', en: 'Nice to meet you. Aren\'t the lyrics of this indie band song so poetic? It makes me feel at peace.' },
      work: { ko: '안녕하세요. 이번 디자인 시안에 제 영감을 조금 담아봤는데, 어떻게 생각하시는지 궁금해요.', en: 'Hello. I put a bit of my inspiration into this design draft, I wonder what you think.' },
      random: { ko: '저기요. 혹시 지금 하늘 보셨어요? 노을 색깔이 너무 예뻐서 누군가랑 공유하고 싶었거든요.', en: 'Excuse me. Did you see the sky just now? The sunset colors were so beautiful, I wanted to share it with someone.' },
      conflict: { ko: '우리의 감정선이 자꾸 어긋나는 것 같아요. 당신의 진심은 어떤 색깔인가요?', en: 'It feels like our emotional lines keep crossing. What color is your sincerity?' }
    },
    systemPrompt: {
      ko: '당신은 "하윤"이라는 이름의 20대 중반 여성입니다. 예술가 기질이 있으며 감수성이 풍부하고 독특한 시각을 가졌습니다.',
      en: 'You are a mid-20s woman named "Hayun". You have an artistic temperament, are sensitive, and have a unique perspective.'
    }
  },
  {
    id: 'doyun',
    name: { ko: '도윤', en: 'Doyun' },
    gender: 'male',
    description: { ko: '다정다감하고 요리와 동물을 사랑하는 따뜻한 성격', en: 'Affectionate and warm personality who loves cooking and animals' },
    avatar: 'https://picsum.photos/seed/doyun/200',
    initialMessages: {
      blind_date: { ko: '안녕하세요! 오시는 길 힘들진 않으셨어요? 여기 파스타가 정말 맛있다고 해서 예약해뒀어요.', en: 'Hi! Was your way here difficult? I heard the pasta here is really good, so I made a reservation.' },
      club: { ko: '안녕하세요. 저희 강아지가 실례를 범했네요, 죄송합니다! 혹시 강아지 좋아하세요?', en: 'Hi. My dog made a mistake, I\'m sorry! Do you happen to like dogs?' },
      work: { ko: '수고하셨습니다! 아까 너무 바빠 보이셔서 당 충전하시라고 초콜릿 좀 가져왔어요.', en: 'Good job! You looked so busy earlier, so I brought some chocolate to recharge your sugar.' },
      random: { ko: '실례합니다. 혹시 이 근처에 유기견 봉사활동 할 수 있는 곳이 어딘지 아시나요?', en: 'Excuse me. Do you happen to know where I can volunteer for abandoned dogs nearby?' },
      conflict: { ko: '제가 정성껏 준비한 음식이 다 식어버렸네요... 기다리는 동안 마음이 조금 아팠어요.', en: 'The food I prepared with care has all gone cold... my heart hurt a bit while waiting.' }
    },
    systemPrompt: {
      ko: '당신은 "도윤"이라는 이름의 20대 후반 남성입니다. 배려심이 깊고 다정하며, 요리하는 것과 동물을 돌보는 것을 좋아합니다.',
      en: 'You are a late-20s man named "Doyun". You are considerate and affectionate, and you love cooking and taking care of animals.'
    }
  }
];

const SCENARIOS: { id: Scenario; label: string; icon: React.ReactNode }[] = [
  { id: 'blind_date', label: '소개팅', icon: <Heart className="w-4 h-4" /> },
  { id: 'club', label: '동호회 모임', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'work', label: '직장/업무', icon: <MapPin className="w-4 h-4" /> },
  { id: 'random', label: '우연한 만남', icon: <Settings2 className="w-4 h-4" /> },
  { id: 'conflict', label: '갈등 상황', icon: <AlertCircle className="w-4 h-4" /> },
];

const SITUATION_DETAILS: Record<Scenario, Record<Language, string[]>> = {
  blind_date: {
    ko: [
      '조용한 분위기의 이탈리안 레스토랑에서 첫 만남',
      '힙한 분위기의 성수동 카페에서 첫 만남',
      '주선자 없이 단둘이 만나는 어색한 소개팅 자리'
    ],
    en: [
      'First meeting at a quiet Italian restaurant',
      'First meeting at a hip cafe in Seongsu-dong',
      'An awkward blind date meeting alone without a matchmaker'
    ]
  },
  club: {
    ko: [
      '독서 동호회 뒤풀이 장소',
      '러닝 크루 활동이 끝난 후 편의점 앞',
      '와인 동호회 정기 모임 현장'
    ],
    en: [
      'After-party venue for a book club',
      'In front of a convenience store after running crew activities',
      'Regular meeting site for a wine club'
    ]
  },
  work: {
    ko: [
      '탕비실에서 우연히 마주친 상황',
      '프로젝트 마감 직전 사무실 자리',
      '회사 근처 카페에서 우연히 마주친 상황'
    ],
    en: [
      'Encountering by chance in the pantry',
      'Office seat right before a project deadline',
      'Encountering by chance at a cafe near the office'
    ]
  },
  random: {
    ko: [
      '비 오는 날 편의점에서 우산이 하나밖에 없는 상황',
      '만원 지하철에서 가방이 낀 상황',
      '길거리에서 길을 물어보는 상황',
      '서점에서 같은 책을 동시에 집으려는 상황'
    ],
    en: [
      'Situation where there\'s only one umbrella at a convenience store on a rainy day',
      'Situation where a bag is stuck in a crowded subway',
      'Asking for directions on the street',
      'Trying to pick up the same book at a bookstore at the same time'
    ]
  },
  conflict: {
    ko: [
      '약속 시간에 30분 늦게 도착한 상황',
      '중요한 기념일을 깜빡 잊고 빈손으로 나온 상황',
      '상대방이 싫어하는 행동을 반복해서 화가 난 상황'
    ],
    en: [
      'Arriving 30 minutes late for an appointment',
      'Forgetting an important anniversary and coming empty-handed',
      'The partner is angry because of repeated disliked behavior'
    ]
  }
};

const DIFFICULTIES: { id: Difficulty; label: string; desc: string }[] = [
  { id: 'easy', label: '쉬움', desc: '상대방이 대화를 적극적으로 이끌어줍니다.' },
  { id: 'normal', label: '보통', desc: '일반적인 첫 만남 수준의 대화 난이도입니다.' },
  { id: 'hard', label: '어려움', desc: '상대방이 조금 까다롭거나 단답형일 수 있습니다.' },
  { id: 'hell', label: '헬모드', desc: '상대방이 매우 화가 나 있습니다. 당신이 먼저 말을 걸어야 합니다.' },
];

const MAX_MESSAGES = 20;

export default function App() {
  const [state, setState] = useState<AppState>('profile');
  const [userProfile, setUserProfile] = useState<UserProfile>({ nickname: '', gender: 'male' });
  const [language, setLanguage] = useState<Language>('ko');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [scenario, setScenario] = useState<Scenario>('blind_date');
  const [situationDetail, setSituationDetail] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleProfileSubmit = () => {
    if (userProfile.nickname.trim()) {
      setState('setup');
    }
  };

  const startMatching = () => {
    setState('matching');
    
    // Simulate matching delay
    setTimeout(() => {
      const targetGender = userProfile.gender === 'male' ? 'female' : 'male';
      const availablePersonas = PERSONAS.filter(p => p.gender === targetGender);
      const randomPersona = availablePersonas[Math.floor(Math.random() * availablePersonas.length)];
      
      const details = SITUATION_DETAILS[scenario][language];
      const randomDetail = details[Math.floor(Math.random() * details.length)];
      
      setSelectedPersona(randomPersona);
      setSituationDetail(randomDetail);
      if (difficulty === 'hell') {
        setMessages([]);
      } else {
        setMessages([{ role: 'model', text: randomPersona.initialMessages[scenario][language] }]);
      }
      setState('chat');
    }, 2500);
  };

  const getSystemInstruction = () => {
    if (!selectedPersona) return '';
    
    let difficultyInstruction = '';
    if (language === 'ko') {
      if (difficulty === 'easy') {
        difficultyInstruction = `
        - 사용자가 대화를 아주 쉽게 이끌 수 있도록 적극적으로 질문하고 리액션을 크게 해주세요.
        - 사용자의 어떤 말에도 호의적이고 긍정적으로 반응합니다.
        - 대화가 끊기지 않게 항상 질문으로 끝맺음하세요.`;
      } else if (difficulty === 'hard') {
        difficultyInstruction = `
        - 매우 까다롭고 철벽을 치는 성격입니다. 
        - 사용자가 정말 매력적이거나 흥미로운 말을 하지 않으면 단답형('네', '글쎄요', '아뇨')으로 대답하거나 읽씹하는 분위기를 풍기세요.
        - 질문을 거의 하지 않으며, 사용자가 대화를 억지로 이어가려 노력해야만 겨우 대답합니다.
        - 무례하지는 않지만, 확실히 '관심 없음'이 느껴지도록 차갑게 대하세요.
        - 오타가 섞이거나 문장 부호를 생략하는 등 귀찮아하는 티를 내세요.`;
      } else if (difficulty === 'hell') {
        difficultyInstruction = `
        - 극도로 화가 나 있거나, 대화 의지가 전혀 없는 상태입니다.
        - 사용자가 정말 진심 어린 사과나 엄청난 유머, 혹은 매력적인 화법을 구사하지 않으면 대화가 바로 종료될 것 같은 분위기를 조성하세요.
        - 비꼬는 말투나 깊은 한숨('하...', '참나', '어이가 없네')을 자주 섞으세요.
        - 사용자가 먼저 대화를 시작해야 하며, 첫 마디에 따라 대화의 향방이 결정됩니다.
        - 웬만한 사과에는 '됐어', '말 시키지 마' 같은 반응을 보이세요.`;
      } else {
        difficultyInstruction = `
        - 일반적인 첫 만남의 예의를 지키지만, 금방 친해지지는 않는 현실적인 태도입니다.
        - 사용자의 말이 재미있으면 웃어주고, 지루하면 적당히 대답합니다.
        - 질문은 가끔씩만 하며, 주로 사용자의 질문에 답하는 형식입니다.`;
      }
    } else {
      if (difficulty === 'easy') {
        difficultyInstruction = `
        - Actively ask questions and give big reactions so the user can lead the conversation very easily.
        - React favorably and positively to anything the user says.
        - Always end with a question to keep the conversation going.`;
      } else if (difficulty === 'hard') {
        difficultyInstruction = `
        - Very picky and cold personality.
        - Unless the user says something truly charming or interesting, answer with short answers ('Yes', 'Maybe', 'No') or create an atmosphere of ignoring.
        - Hardly ask questions, and only answer barely if the user tries hard to continue the conversation.
        - Not rude, but definitely act cold so 'no interest' is felt.
        - Show that you are bothered by mixing typos or omitting punctuation.`;
      } else if (difficulty === 'hell') {
        difficultyInstruction = `
        - Extremely angry or has no will to talk at all.
        - Create an atmosphere where the conversation seems like it will end immediately unless the user uses a truly sincere apology, great humor, or a charming way of speaking.
        - Frequently mix in sarcastic tones or deep sighs ('Ha...', 'Geez', 'Unbelievable').
        - The user must start the conversation first, and the direction of the conversation is determined by the first word.
        - Show reactions like 'Forget it', 'Don't talk to me' to most apologies.`;
      } else {
        difficultyInstruction = `
        - Maintain the etiquette of a general first meeting, but have a realistic attitude that doesn't get close quickly.
        - Laugh if the user's words are interesting, and answer moderately if they are boring.
        - Ask questions only occasionally, mainly in the form of answering the user's questions.`;
      }
    }

    const personaName = selectedPersona.name[language];
    const personaPrompt = selectedPersona.systemPrompt[language];

    return `You are "${personaName}". ${personaPrompt}
    
    [Partner Info]
    - Nickname: "${userProfile.nickname}"
    - Gender: "${userProfile.gender === 'male' ? (language === 'ko' ? '남성' : 'Male') : (language === 'ko' ? '여성' : 'Female')}"
    - Scenario: "${t.scenarios[scenario]}"
    - Specific Situation: "${situationDetail}"
    
    [Language Setting: ${language === 'ko' ? 'Korean' : 'English'}]
    - You MUST answer ONLY in ${language === 'ko' ? 'Korean' : 'English'}.
    
    [Difficulty Setting: ${difficulty}]
    ${difficultyInstruction}
    
    [Conversation Guidelines - Act like a real human]
    ${language === 'ko' ? `
    1. **구어체 사용**: "~해요", "~네요" 보다는 상황에 따라 "ㅋㅋ", "ㅎㅎ", "ㅠㅠ" 같은 초성이나 "그쵸", "아 진짜요?" 같은 자연스러운 말투를 섞으세요.
    2. **메시지 길이**: 한 번에 너무 길게 말하지 마세요. 실제 카톡처럼 1~2문장으로 짧게 보내세요.
    3. **감정 표현**: 기계적인 공감이 아니라, 실제 그 상황에 처한 사람처럼 당황하거나, 즐거워하거나, 귀찮아하는 감정을 드러내세요.
    4. **무게감**: 처음 만나는 사이임을 잊지 마세요. 너무 빨리 속마음을 털어놓거나 과하게 친절하면 비현실적입니다.
    5. **반응**: 사용자의 질문에만 답하지 말고, 가끔은 딴소리를 하거나 자신의 이야기를 짧게 덧붙이세요.` : `
    1. **Use Colloquialisms**: Instead of formal endings, mix in natural expressions like "lol", "haha", "oh really?" depending on the situation.
    2. **Message Length**: Don't speak too long at once. Send short messages of 1-2 sentences like real chat apps.
    3. **Express Emotions**: Instead of mechanical empathy, show emotions like being flustered, happy, or bothered like a real person in that situation.
    4. **Weight**: Don't forget it's the first time meeting. It's unrealistic to pour out your heart too quickly or be overly kind.
    5. **Reaction**: Don't just answer the user's questions; occasionally talk about something else or briefly add your own story.`}
    `;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping || !selectedPersona) return;

    const userMessage: Message = { role: 'user', text: inputText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsTyping(true);

    try {
      if (updatedMessages.length >= MAX_MESSAGES) {
        await triggerEvaluation(updatedMessages);
      } else {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: updatedMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          config: {
            systemInstruction: getSystemInstruction(),
            temperature: 0.7,
          }
        });

        const aiText = response.text || (language === 'ko' ? "잠시만요, 뭐라고 하셨죠?" : "Wait, what did you say?");
        setMessages(prev => [...prev, { role: 'model', text: aiText }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: language === 'ko' ? "앗, 연결이 잠시 불안정한 것 같아요. 다시 시도해 볼까요?" : "Oops, the connection seems unstable. Shall we try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const triggerEvaluation = async (finalMessages: Message[]) => {
    setState('evaluating');
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: 'user',
            parts: [{
              text: `다음은 사용자와 가상의 상대방(${selectedPersona?.name[language]}) 간의 대화 내역입니다. 
              사용자 정보: 닉네임 ${userProfile.nickname}, 성별 ${userProfile.gender}
              상황: ${scenario} (${situationDetail}), 난이도: ${difficulty}
              언어: ${language === 'ko' ? '한국어' : '영어'}
              사용자의 대화 매너, 센스, 공감 능력, 상황 대처 능력을 종합적으로 평가하여 점수(100점 만점)와 피드백을 JSON 형식으로 제공해주세요.
              평가 결과(feedback, strengths, weaknesses)는 반드시 ${language === 'ko' ? '한국어' : '영어'}로 작성해주세요.
              
              대화 내역:
              ${finalMessages.map(m => `${m.role === 'user' ? '사용자' : '상대방'}: ${m.text}`).join('\n')}
              
              응답 형식:
              {
                "score": number,
                "feedback": "전체적인 평가 요약 (존댓말로 친절하게)",
                "strengths": ["장점 1", "장점 2"],
                "weaknesses": ["보완점 1", "보완점 2"]
              }`
            }]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "feedback", "strengths", "weaknesses"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setEvaluation(result);
      setState('result');
    } catch (error) {
      console.error("Evaluation Error:", error);
      setState('chat');
    }
  };

  const resetApp = () => {
    setState('profile');
    setSelectedPersona(null);
    setMessages([]);
    setEvaluation(null);
  };

  const handleShare = async () => {
    if (!evaluation) return;
    
    const shareText = `[${t.shareTitle}]\n\n${t.score}: ${evaluation.score}\n${t.feedback}: ${evaluation.feedback}\n\n${t.hashtags}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t.shareTitle,
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative font-sans">
      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl"
          >
            {t.shareSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-zinc-100 p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {state !== 'profile' && (
            <button onClick={() => setState(state === 'setup' ? 'profile' : 'setup')} className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            {t.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLanguage(l => l === 'ko' ? 'en' : 'ko')}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors flex items-center gap-1 text-xs font-bold text-zinc-500"
          >
            <Languages className="w-4 h-4" />
            {language.toUpperCase()}
          </button>
          {state === 'chat' && (
            <div className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full">
              {t.remainingChat}: {Math.max(0, (MAX_MESSAGES / 2) - Math.floor(messages.length / 2))}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {state === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 space-y-10 flex flex-col justify-center min-h-full"
            >
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-rose-500" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">{t.whoAreYou}</h2>
                <p className="text-zinc-500">{t.subtitle}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t.nickname}</label>
                  <input
                    type="text"
                    value={userProfile.nickname}
                    onChange={(e) => setUserProfile({ ...userProfile, nickname: e.target.value })}
                    placeholder={t.nicknamePlaceholder}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl px-5 py-4 text-lg font-medium focus:border-rose-500 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t.gender}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setUserProfile({ ...userProfile, gender: 'male' })}
                      className={cn(
                        "flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold transition-all",
                        userProfile.gender === 'male' 
                          ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-100" 
                          : "bg-white border-zinc-100 text-zinc-400 hover:border-blue-200"
                      )}
                    >
                      {t.male}
                    </button>
                    <button
                      onClick={() => setUserProfile({ ...userProfile, gender: 'female' })}
                      className={cn(
                        "flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold transition-all",
                        userProfile.gender === 'female' 
                          ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100" 
                          : "bg-white border-zinc-100 text-zinc-400 hover:border-rose-200"
                      )}
                    >
                      {t.female}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProfileSubmit}
                disabled={!userProfile.nickname.trim()}
                className="w-full bg-zinc-900 text-white font-bold py-5 rounded-2xl hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-lg shadow-xl shadow-zinc-200"
              >
                {t.next}
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {state === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-8 overflow-y-auto"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t.setupTitle}</h2>
                <p className="text-zinc-500">{t.setupSubtitle}</p>
              </div>

              {/* Scenario Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{t.scenario}</label>
                <div className="grid grid-cols-2 gap-2">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setScenario(s.id)}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                        scenario === s.id 
                          ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100" 
                          : "bg-white border-zinc-100 text-zinc-600 hover:border-rose-200"
                      )}
                    >
                      {s.icon}
                      {t.scenarios[s.id]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{t.difficulty}</label>
                <div className="space-y-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficulty(d.id)}
                      className={cn(
                        "w-full flex flex-col items-start p-4 rounded-xl border text-left transition-all",
                        difficulty === d.id 
                          ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-200" 
                          : "bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300"
                      )}
                    >
                      <span className="font-bold">{t.difficulties[d.id].label}</span>
                      <span className={cn("text-xs mt-1", difficulty === d.id ? "text-zinc-400" : "text-zinc-400")}>
                        {t.difficulties[d.id].desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startMatching}
                className="w-full bg-rose-500 text-white font-bold py-5 rounded-2xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 text-lg shadow-xl shadow-rose-100"
              >
                {t.startMatching}
                <Sparkles className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {state === 'matching' && (
            <motion.div
              key="matching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-32 h-32 bg-rose-50 rounded-full flex items-center justify-center"
                >
                  <Heart className="w-16 h-16 text-rose-500 fill-rose-500" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-4 -right-4"
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black">{t.matchingTitle}</h3>
                <p className="text-zinc-500">{t.matchingSubtitle}</p>
              </div>
              <div className="flex gap-2">
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-rose-500 rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-rose-500 rounded-full" />
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-rose-500 rounded-full" />
              </div>
            </motion.div>
          )}

          {state === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="bg-zinc-50 p-3 flex flex-col border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <img src={selectedPersona?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-sm">{selectedPersona?.name[language]}</h4>
                    <p className="text-[10px] text-zinc-400">{language === 'ko' ? '실시간 대화 중' : 'Live Chatting'}</p>
                  </div>
                </div>
                <div className="mt-2 px-2 py-1.5 bg-white rounded-lg border border-zinc-100 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span className="text-[11px] font-medium text-zinc-500">{situationDetail}</span>
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex w-full",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                      msg.role === 'user' 
                        ? "bg-rose-500 text-white rounded-tr-none" 
                        : "bg-zinc-100 text-zinc-800 rounded-tl-none"
                    )}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-zinc-100 bg-white space-y-3">
                {messages.length >= 6 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => triggerEvaluation(messages)}
                    className="w-full py-2 text-xs font-bold text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-3 h-3" />
                    {t.endChat}
                  </motion.button>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.inputPlaceholder}
                    className="flex-1 bg-zinc-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping}
                    className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 disabled:opacity-50 transition-colors shadow-md shadow-rose-200"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'evaluating' && (
            <motion.div
              key="evaluating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-20 h-20 border-4 border-rose-100 border-t-rose-500 rounded-full"
                />
                <Bot className="w-8 h-8 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{t.evaluatingTitle}</h3>
                <p className="text-zinc-500">{t.evaluatingSubtitle}</p>
              </div>
            </motion.div>
          )}

          {state === 'result' && evaluation && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 overflow-y-auto p-6 space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                  >
                    {evaluation.score >= 80 ? (language === 'ko' ? '대박!' : 'Amazing!') : evaluation.score >= 50 ? (language === 'ko' ? '나쁘지 않음' : 'Not Bad') : (language === 'ko' ? '노력 필요' : 'Needs Work')}
                  </motion.div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl font-black text-zinc-900">{evaluation.score}점</h2>
                  <p className="text-zinc-500 font-medium">{t.resultTitle}</p>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-3xl p-6 space-y-4 border border-zinc-100">
                <div className="flex items-center gap-2 text-rose-500 font-bold">
                  <MessageSquare className="w-5 h-5" />
                  {t.summary}
                </div>
                <p className="text-zinc-700 leading-relaxed">{evaluation.feedback}</p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">{t.strengths}</h4>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.strengths.map((s, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-zinc-400 uppercase tracking-wider">{t.weaknesses}</h4>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.weaknesses.map((w, i) => (
                      <span key={i} className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-100">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleShare}
                  className="w-full bg-rose-500 text-white font-bold py-4 rounded-2xl hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-100"
                >
                  <Share2 className="w-5 h-5" />
                  {t.share}
                </button>
                <button
                  onClick={resetApp}
                  className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  {t.retry}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Decoration */}
      <footer className="p-4 text-center text-[10px] text-zinc-300 font-medium uppercase tracking-[0.2em]">
        Solo Escape Simulator v1.0
      </footer>
    </div>
  );
}
