// ⚠️ firebase config는 아래에 본인 것으로 교체하세요
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, increment, collection, addDoc, getDocs, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_uNzj6LpGnPEX-CuXcPn2O2m8D07qQcs",
  authDomain: "studio-3919876017-baf1f.firebaseapp.com",
  projectId: "studio-3919876017-baf1f",
  storageBucket: "studio-3919876017-baf1f.firebasestorage.app",
  messagingSenderId: "543782121144",
  appId: "1:543782121144:web:f1e92967c1521e7a9fce4d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const BASE_SCENARIOS = [
  { id: 1,  emoji: "🚪", text: "카페에서 문을 잡아주며 먼저 들어가라고 함", tag: "문 잡아주기" },
  { id: 2,  emoji: "👜", text: "무거운 짐 들고 있으면 말없이 가방 들어줌", tag: "가방 들어주기" },
  { id: 3,  emoji: "🧥", text: "춥다고 했더니 자기 겉옷 벗어서 줌", tag: "옷 빌려주기" },
  { id: 4,  emoji: "📱", text: "카카오톡 프로필 사진 바꾸자마자 바로 '사진 바꿨네?' 함", tag: "프사 댓글" },
  { id: 5,  emoji: "🍜", text: "\"밥 먹었어?\" 텍스트 매일 보냄", tag: "밥먹었어 문자" },
  { id: 6,  emoji: "🎵", text: "\"이 노래 들으면 네 생각나\" 하면서 곡 공유함", tag: "노래 공유" },
  { id: 7,  emoji: "🚗", text: "늦은 밤 집까지 차로 데려다줌", tag: "귀가 데려다주기" },
  { id: 8,  emoji: "🎂", text: "내 생일 기억하고 자정에 문자 보냄", tag: "자정 생일 축하" },
  { id: 9,  emoji: "😅", text: "대화 중에 내 팔을 가볍게 툭툭 침", tag: "팔 툭툭" },
  { id: 10, emoji: "☕", text: "내가 좋아하는 음료 기억해서 먼저 사다 줌", tag: "음료 기억" },
  { id: 11, emoji: "📸", text: "사진 찍어줄 때 한 장만 안 찍고 계속 많이 찍어줌", tag: "사진 많이 찍어주기" },
  { id: 12, emoji: "🐾", text: "길가다 강아지 보면 \"귀엽지? 너 닮았다\" 함", tag: "강아지 닮았다" },
  { id: 13, emoji: "🌙", text: "\"잘 자\" 문자를 매일 밤 먼저 보냄", tag: "굿나잇 문자" },
  { id: 14, emoji: "🎮", text: "게임하다가 아이템이나 캐릭터 선물해줌", tag: "게임 선물" },
  { id: 15, emoji: "🩹", text: "아프다고 했더니 약이나 죽 들고 나타남", tag: "아플 때 챙겨주기" },
  { id: 16, emoji: "👀", text: "내가 올린 스토리에 항상 제일 먼저 반응함", tag: "스토리 첫 반응" },
  { id: 17, emoji: "🎁", text: "여행 다녀오면서 내 취향 맞게 선물 사다 줌", tag: "여행 선물" },
  { id: 18, emoji: "🌧️", text: "비 온다고 우산 챙겼냐고 먼저 문자 옴", tag: "우산 챙겨주기" },
  { id: 19, emoji: "🍕", text: "\"뭐 먹고 싶어?\" 물어보고 배달시켜줌", tag: "배달 쏘기" },
  { id: 20, emoji: "💻", text: "내 발표나 과제 봐준다고 늦게까지 같이 있어줌", tag: "발표 도와주기" },
  { id: 21, emoji: "🎤", text: "노래방에서 내가 좋아하는 노래 외워서 불러줌", tag: "노래방 전곡 암기" },
  { id: 22, emoji: "🧸", text: "내가 뭔가 힘들다고 하니까 인형 선물해줌", tag: "위로 선물" },
  { id: 23, emoji: "🙋", text: "내가 헷갈려하는 거 설명해주려고 30분 넘게 통화함", tag: "긴 통화 설명" },
  { id: 24, emoji: "🧁", text: "내 생일도 아닌데 갑자기 케이크 사옴", tag: "갑작스런 케이크" },
  { id: 25, emoji: "🚌", text: "같은 방향 아닌데 같이 가겠다고 버스 탐", tag: "같이 귀가" },
  { id: 26, emoji: "📝", text: "내가 좋아하는 것들 다 메모해뒀다가 나중에 써먹음", tag: "취향 메모" },
  { id: 27, emoji: "🌅", text: "\"일출 보러 가자\" 해서 새벽에 픽업 옴", tag: "새벽 픽업" },
  { id: 28, emoji: "🎬", text: "내가 보고 싶다던 영화 예매해서 티켓 보내줌", tag: "영화 예매" },
  { id: 29, emoji: "🏃", text: "내가 운동 시작했다고 하니까 같이 뛰러 오겠다고 함", tag: "운동 같이" },
  { id: 30, emoji: "🤧", text: "감기 걸렸다니까 편의점 봉지 들고 집 앞에 나타남", tag: "감기 케어" },
  { id: 31, emoji: "📖", text: "내가 읽고 싶다던 책 먼저 다 읽고 요약해서 보내줌", tag: "책 요약" },
  { id: 32, emoji: "🌸", text: "벚꽃 폈다고 \"같이 보러 가자\" 먼저 연락함", tag: "벚꽃 데이트 제안" },
  { id: 33, emoji: "💬", text: "카톡 읽씹 없이 항상 빠르게 답장함", tag: "빠른 답장" },
  { id: 34, emoji: "🍦", text: "편의점 가다가 \"뭐 먹고 싶어?\" 물어보고 사다 줌", tag: "편의점 심부름" },
  { id: 35, emoji: "🎯", text: "내가 좋아하는 아이돌 굿즈 구해준다고 직접 줄 섬", tag: "굿즈 구해주기" },
  { id: 36, emoji: "🌃", text: "야경 예쁜 데 알았다고 \"데려가줄게\" 함", tag: "야경 데려가기" },
  { id: 37, emoji: "🧇", text: "아침에 \"밥은 먹었어?\" 문자가 옴", tag: "아침 안부" },
  { id: 38, emoji: "🚿", text: "\"씻었어?\" \"집 도착했어?\" 확인 문자가 옴", tag: "안전 확인 문자" },
  { id: 39, emoji: "🎸", text: "내가 좋아하는 곡 연습해서 연주 영상 보내줌", tag: "커버 영상" },
  { id: 40, emoji: "🐱", text: "길냥이 보면 내 생각났다며 사진 보내줌", tag: "고양이 사진" },
  { id: 41, emoji: "🧴", text: "피부 트러블 났다고 하니까 추천 크림 직접 사다 줌", tag: "스킨케어 챙기기" },
  { id: 42, emoji: "🎠", text: "놀이공원 가고 싶다 했더니 다음 주 바로 예약해버림", tag: "놀이공원 예약" },
  { id: 43, emoji: "🌙", text: "자기 전에 \"오늘 하루 어땠어?\" 먼저 물어봄", tag: "하루 물어보기" },
  { id: 44, emoji: "🎀", text: "내 SNS 사진에 항상 '예쁘다' 댓글 달아줌", tag: "SNS 예쁘다 댓글" },
  { id: 45, emoji: "🧆", text: "내가 요리 배우고 싶다 했더니 직접 만들어서 도시락 싸옴", tag: "도시락 싸오기" },
  { id: 46, emoji: "🛍️", text: "쇼핑할 때 들어줄게 하면서 따라다님", tag: "쇼핑 따라다니기" },
  { id: 47, emoji: "🌊", text: "\"바다 가고 싶다\" 했더니 다음날 새벽 드라이브 제안함", tag: "바다 드라이브" },
  { id: 48, emoji: "🤝", text: "내가 취업 준비한다고 하니까 자소서 다 봐줌", tag: "자소서 첨삭" },
  { id: 49, emoji: "💐", text: "길 가다가 꽃 파는 사람 보이면 한 송이 사줌", tag: "꽃 한 송이" },
  { id: 50, emoji: "🍱", text: "점심 뭐 먹을지 고민된다 했더니 직접 만들어서 가져다 줌", tag: "점심 직접 만들어오기" },
];

const SEED = {
  1:{flirt:61,notFlirt:89},2:{flirt:74,notFlirt:66},3:{flirt:118,notFlirt:42},
  4:{flirt:95,notFlirt:55},5:{flirt:88,notFlirt:72},6:{flirt:132,notFlirt:28},
  7:{flirt:109,notFlirt:51},8:{flirt:121,notFlirt:39},9:{flirt:83,notFlirt:67},
  10:{flirt:97,notFlirt:63},11:{flirt:58,notFlirt:102},12:{flirt:76,notFlirt:84},
  13:{flirt:104,notFlirt:46},14:{flirt:71,notFlirt:79},15:{flirt:115,notFlirt:45},
  16:{flirt:89,notFlirt:61},17:{flirt:98,notFlirt:52},18:{flirt:67,notFlirt:93},
  19:{flirt:80,notFlirt:80},20:{flirt:72,notFlirt:88},21:{flirt:126,notFlirt:34},
  22:{flirt:88,notFlirt:62},23:{flirt:63,notFlirt:97},24:{flirt:119,notFlirt:41},
  25:{flirt:91,notFlirt:59},26:{flirt:107,notFlirt:43},27:{flirt:123,notFlirt:37},
  28:{flirt:112,notFlirt:48},29:{flirt:69,notFlirt:81},30:{flirt:108,notFlirt:52},
  31:{flirt:74,notFlirt:86},32:{flirt:86,notFlirt:74},33:{flirt:59,notFlirt:101},
  34:{flirt:77,notFlirt:83},35:{flirt:114,notFlirt:46},36:{flirt:118,notFlirt:42},
  37:{flirt:65,notFlirt:95},38:{flirt:71,notFlirt:89},39:{flirt:128,notFlirt:32},
  40:{flirt:79,notFlirt:81},41:{flirt:73,notFlirt:87},42:{flirt:102,notFlirt:58},
  43:{flirt:66,notFlirt:94},44:{flirt:81,notFlirt:79},45:{flirt:129,notFlirt:31},
  46:{flirt:68,notFlirt:92},47:{flirt:116,notFlirt:44},48:{flirt:70,notFlirt:90},
  49:{flirt:111,notFlirt:49},50:{flirt:133,notFlirt:27},
};

const FLIRT = "플러팅";
const NOT_FLIRT = "그냥 친절";
const MIN_VOTES_TO_SHOW = 10;
const REPORT_RATIO_THRESHOLD = 0.8;
const GAME_SIZE = 10;
const EMOJIS = ["💬","🥺","😏","🤭","😳","💌","🫶","🤔","😂","🫠","👀","🙈"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Firebase helpers
async function fbGetVotes(id) {
  try {
    const snap = await getDoc(doc(db, "votes", String(id)));
    if (snap.exists()) {
      const d = snap.data();
      return { flirt: d.flirt || 0, notFlirt: d.notFlirt || 0 };
    }
    return { flirt: 0, notFlirt: 0 };
  } catch { return { flirt: 0, notFlirt: 0 }; }
}

async function fbIncrementVote(id, choice) {
  try {
    const ref = doc(db, "votes", String(id));
    await setDoc(ref, {
      [choice === FLIRT ? "flirt" : "notFlirt"]: increment(1)
    }, { merge: true });
  } catch {}
}

async function fbIncrementReport(id) {
  try {
    const ref = doc(db, "reports", String(id));
    await setDoc(ref, { count: increment(1) }, { merge: true });
  } catch {}
}

async function fbGetReports(id) {
  try {
    const snap = await getDoc(doc(db, "reports", String(id)));
    return snap.exists() ? (snap.data().count || 0) : 0;
  } catch { return 0; }
}

async function fbAddSuggestion(item) {
  try {
    await setDoc(doc(db, "suggestions", item.id), item);
  } catch {}
}

async function fbGetSuggestions() {
  try {
    const snap = await getDocs(collection(db, "suggestions"));
    return snap.docs.map(d => d.data()).sort((a, b) => b.createdAt - a.createdAt);
  } catch { return []; }
}

async function fbVoteSuggestion(id, choice) {
  try {
    const ref = doc(db, "suggestionVotes", String(id));
    await setDoc(ref, {
      [choice === FLIRT ? "flirt" : "notFlirt"]: increment(1)
    }, { merge: true });
  } catch {}
}

async function fbGetSuggestionVotes(id) {
  try {
    const snap = await getDoc(doc(db, "suggestionVotes", String(id)));
    return snap.exists() ? snap.data() : { flirt: 0, notFlirt: 0 };
  } catch { return { flirt: 0, notFlirt: 0 }; }
}

export default function FlirtVoteApp() {
  const [tab, setTab] = useState("game");
  const [phase, setPhase] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState({});
  const [animating, setAnimating] = useState(false);
  const [chosenSide, setChosenSide] = useState(null);
  const [globalVotes, setGlobalVotes] = useState({});
  const [reports, setReports] = useState({});
  const [reportedByMe, setReportedByMe] = useState({});
  const [gameScenarios, setGameScenarios] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [suggestText, setSuggestText] = useState("");
  const [suggestEmoji, setSuggestEmoji] = useState("💬");
  const [suggestions, setSuggestions] = useState([]);
  const [submitDone, setSubmitDone] = useState(false);
  const [suggestionVotes, setSuggestionVotes] = useState({});
  const [myVotedSuggestions, setMyVotedSuggestions] = useState({});
  const [copied, setCopied] = useState(null);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoadingData(true);
    const allVotes = {};
    await Promise.all(BASE_SCENARIOS.map(async s => {
      const seed = SEED[s.id] || { flirt: 0, notFlirt: 0 };
      const stored = await fbGetVotes(s.id);
      allVotes[s.id] = {
        flirt: seed.flirt + (stored.flirt || 0),
        notFlirt: seed.notFlirt + (stored.notFlirt || 0)
      };
    }));
    setGlobalVotes(allVotes);

    // 신고 로드
    const allReports = {};
    await Promise.all(BASE_SCENARIOS.map(async s => {
      allReports[s.id] = await fbGetReports(s.id);
    }));
    setReports(allReports);

    // 유저 제안 로드
    const loadedSuggestions = await fbGetSuggestions();
    setSuggestions(loadedSuggestions);

    // 제안 투표 로드
    const svMap = {};
    await Promise.all(loadedSuggestions.map(async s => {
      svMap[s.id] = await fbGetSuggestionVotes(s.id);
    }));
    setSuggestionVotes(svMap);

    setLoadingData(false);
  }

  const buildPool = (currentSuggestions, currentSuggestionVotes) => {
    // 기본 50개는 항상 전부 포함
    const base = [...BASE_SCENARIOS];
    // 유저 제안은 투표 5개↑인 것만
    const userPicks = currentSuggestions.filter(s => {
      const sv = currentSuggestionVotes[s.id] || { flirt: 0, notFlirt: 0 };
      return (sv.flirt + sv.notFlirt) >= 5;
    });
    return [...base, ...userPicks];
  };

  const activeScenarios = gameScenarios;
  const scenario = activeScenarios[currentIndex];
  const totalScenarios = activeScenarios.length;

  function castVote(choice) {
    if (animating || !scenario) return;
    setAnimating(true);
    setChosenSide(choice);
    setVotes(prev => ({ ...prev, [scenario.id]: choice }));

    setTimeout(() => {
      setAnimating(false);
      setChosenSide(null);
      if (currentIndex + 1 >= totalScenarios) setPhase("result");
      else setCurrentIndex(i => i + 1);
    }, 800);

    // Firebase에 투표 저장 (백그라운드)
    const seed = SEED[scenario.id] || { flirt: 0, notFlirt: 0 };
    const current = globalVotes[scenario.id] || { flirt: seed.flirt, notFlirt: seed.notFlirt };
    setGlobalVotes(prev => ({
      ...prev,
      [scenario.id]: {
        flirt: current.flirt + (choice === FLIRT ? 1 : 0),
        notFlirt: current.notFlirt + (choice === NOT_FLIRT ? 1 : 0)
      }
    }));
    fbIncrementVote(scenario.id, choice);
  }

  async function handleReport(id) {
    if (reportedByMe[id]) return;
    setReports(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setReportedByMe(prev => ({ ...prev, [id]: true }));
    await fbIncrementReport(id);
  }

  async function submitSuggestion() {
    if (!suggestText.trim()) return;
    const newItem = { id: `u_${Date.now()}`, emoji: suggestEmoji, text: suggestText.trim(), tag: "유저 제안", createdAt: Date.now() };
    setSuggestions(prev => [newItem, ...prev]);
    setSuggestText("");
    setSubmitDone(true);
    setTimeout(() => setSubmitDone(false), 2500);
    await fbAddSuggestion(newItem);
  }

  async function voteSuggestion(id, choice) {
    if (myVotedSuggestions[id]) return;
    const current = suggestionVotes[id] || { flirt: 0, notFlirt: 0 };
    setSuggestionVotes(prev => ({ ...prev, [id]: { flirt: current.flirt + (choice === FLIRT ? 1 : 0), notFlirt: current.notFlirt + (choice === NOT_FLIRT ? 1 : 0) } }));
    setMyVotedSuggestions(prev => ({ ...prev, [id]: choice }));
    await fbVoteSuggestion(id, choice);
  }

  function restart() {
    setCurrentIndex(0);
    setVotes({});
    setPhase("voting");
    const pool = buildPool(suggestions, suggestionVotes);
    setGameScenarios(shuffle(pool).slice(0, GAME_SIZE));
  }

  const flirtCount = Object.values(votes).filter(v => v === FLIRT).length;
  const notFlirtCount = Object.values(votes).filter(v => v === NOT_FLIRT).length;

  const isInToss = !window.location.href.includes('netlify') && !window.location.href.includes('localhost');
  const shareUrl = isInToss ? 'intoss://flirt/' : 'https://flirt-vote.netlify.app';

  function shareLink() {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied("link"); setTimeout(() => setCopied(null), 2000); });
  }

  function shareAll() {
    const res = resultMessage();
    const pct = Math.round((flirtCount / totalScenarios) * 100);
    const filled = Math.round(pct / 10);
    const bar = "█".repeat(filled) + "░".repeat(10 - filled);
    const text = `💬 이게 플러팅이야?\n\n나의 결과: ${res.title}\n💘 플러팅 ${pct}% | 😊 친절 ${100 - pct}%\n${bar}\n\n나도 해보기 👇\n${shareUrl}`;
    navigator.clipboard.writeText(text).then(() => { setCopied("share"); setTimeout(() => setCopied(null), 2000); });
  }

  const resultMessage = () => {
    let agreeCount = 0, flirtAgree = 0, coolCount = 0;
    activeScenarios.forEach(s => {
      const myVote = votes[s.id]; if (!myVote) return;
      const gv = globalVotes[s.id] || { flirt: 0, notFlirt: 0 };
      const total = gv.flirt + gv.notFlirt; if (total === 0) return;
      const majorityIsFlirt = gv.flirt >= gv.notFlirt;
      const agree = (majorityIsFlirt && myVote === FLIRT) || (!majorityIsFlirt && myVote === NOT_FLIRT);
      if (agree) agreeCount++;
      if (majorityIsFlirt && myVote === FLIRT) flirtAgree++;
      if (majorityIsFlirt && myVote === NOT_FLIRT) coolCount++;
    });
    const total = Object.keys(votes).length;
    const agreeRatio = total > 0 ? agreeCount / total : 0.5;
    const coolRatio = total > 0 ? coolCount / total : 0;
    const flirtAgreeRatio = total > 0 ? flirtAgree / total : 0;
    if (agreeRatio >= 0.7 && flirtAgreeRatio >= 0.4)
      return { title: "💘 설레는 공감러", desc: `다른 사람들이 플러팅이라 할 때 나도 설렌 비율 ${Math.round(flirtAgreeRatio*100)}%\n대세 감각이 딱 맞아요 — 힌트 절대 안 놓쳐요!` };
    if (agreeRatio >= 0.7 && flirtAgreeRatio < 0.3)
      return { title: "😌 냉정한 현실주의자", desc: `다들 친절이라고 할 때 나도 친절이라 한 비율 높음\n과도한 기대 없이 상황을 있는 그대로 보는 타입이에요.` };
    if (coolRatio >= 0.35)
      return { title: "😎 쿨내 나는 둔감러", desc: `다른 사람들은 플러팅이라 했는데 나는 친절이라 한 경우 ${Math.round(coolRatio*100)}%\n웬만한 건 다 친절로 넘기는 쿨한 스타일!\n진짜 플러팅도 그냥 지나칠 수 있어요 👀` };
    if (agreeRatio < 0.5 && flirtAgreeRatio >= 0.3)
      return { title: "🥹 설렘 과부하 타입", desc: `남들은 그냥 친절이라 하는데 나는 플러팅으로 느낀 경우가 꽤 돼요\n작은 것에도 잘 설레는 감수성 풍부한 타입!` };
    return { title: "🤔 판단 보류형", desc: `대세와 내 의견이 딱 반반!\n플러팅인지 아닌지 확신하기 어려운 상황이 많은 타입이에요.` };
  };

  const card = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", backdropFilter: "blur(20px)" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0514 0%, #1a0a2e 40%, #0d1a3a 100%)", fontFamily: "'Noto Sans KR', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 48px", position: "relative", overflow: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", top: "-120px", right: "-120px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,100,180,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-120px", left: "-120px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(100,100,255,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "480px", marginBottom: "20px" }}>
        <h1 style={{ color: "#fff", fontSize: "clamp(20px,5vw,26px)", fontWeight: 900, margin: "0 0 14px", textAlign: "center", letterSpacing: "-0.5px" }}>💬 이게 플러팅이야?</h1>
        <div style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "50px", padding: "4px" }}>
          {[["game","🎮 게임"],["ranking","🔥 랭킹"],["suggest","✏️ 제안"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: "10px", borderRadius: "50px", border: "none", background: tab === key ? "linear-gradient(135deg, #ff5fb0, #a855f7)" : "transparent", color: tab === key ? "#fff" : "rgba(255,255,255,0.35)", fontWeight: 700, fontSize: "13px", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loadingData && (
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginTop: "40px" }}>데이터 불러오는 중... ✨</div>
      )}

      {!loadingData && tab === "game" && (
        <div style={{ width: "100%", maxWidth: "480px" }}>

          {phase === "intro" && (
            <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease", paddingTop: "40px" }}>
              <div style={{ fontSize: "72px", marginBottom: "28px" }}>🤭</div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "16px", margin: "0 0 48px", lineHeight: 2 }}>
                매번 달라지는 랜덤 질문! 🎲<br />투표하고 다른 사람 생각도 확인해봐!
              </p>
              <button onClick={() => {
                const pool = buildPool(suggestions, suggestionVotes);
                setGameScenarios(shuffle(pool).slice(0, GAME_SIZE));
                setPhase("voting");
              }} style={{ background: "linear-gradient(135deg, #ff5fb0, #a855f7)", color: "#fff", border: "none", borderRadius: "50px", padding: "18px 52px", fontSize: "17px", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 28px rgba(255,95,176,0.35)", fontFamily: "inherit" }}>
                시작하기 🔥
              </button>
            </div>
          )}

          {phase === "voting" && scenario && (
            <div style={{ animation: "slideUp 0.35s ease" }}>
              <div style={{ marginBottom: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.3)", fontSize: "12px", marginBottom: "6px" }}>
                  <span>{currentIndex + 1} / {totalScenarios}</span>
                  <span>{scenario.tag}</span>
                </div>
                <div style={{ height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px" }}>
                  <div style={{ height: "100%", width: `${(currentIndex / totalScenarios) * 100}%`, background: "linear-gradient(90deg, #ff5fb0, #a855f7)", borderRadius: "2px", transition: "width 0.4s ease" }} />
                </div>
              </div>

              <div style={{ ...card, padding: "34px 26px", textAlign: "center", marginBottom: "14px", transform: animating ? "scale(0.97)" : "scale(1)", transition: "transform 0.3s ease" }}>
                <div style={{ fontSize: "46px", marginBottom: "14px" }}>{scenario.emoji}</div>
                <p style={{ color: "#fff", fontSize: "clamp(15px,4vw,18px)", fontWeight: 700, lineHeight: 1.6, margin: 0 }}>{scenario.text}</p>
              </div>

              {/* 투표 후 결과 미리보기 */}
              {animating && chosenSide && (() => {
                const gv = globalVotes[scenario.id] || { flirt: 0, notFlirt: 0 };
                const total = gv.flirt + gv.notFlirt;
                const flirtPct = total > 0 ? Math.round((gv.flirt / total) * 100) : 50;
                return (
                  <div style={{ ...card, padding: "12px 16px", marginBottom: "14px", animation: "fadeIn 0.2s ease" }}>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", margin: "0 0 7px", textAlign: "center" }}>
                      {total.toLocaleString()}명이 투표했어요
                    </p>
                    <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                      <span style={{ color: "#ff5fb0", fontSize: "11px", fontWeight: 700, minWidth: "28px" }}>{flirtPct}%</span>
                      <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.07)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${flirtPct}%`, background: "linear-gradient(90deg, #ff5fb0, #a855f7)", transition: "width 0.4s ease" }} />
                      </div>
                      <span style={{ color: "#64b5f6", fontSize: "11px", fontWeight: 700, minWidth: "28px", textAlign: "right" }}>{100 - flirtPct}%</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>💘 플러팅</span>
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>친절 😊</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", margin: "8px 0 0", textAlign: "center" }}>
                      나는 {chosenSide === FLIRT ? "💘 플러팅" : "😊 친절"} 선택!
                    </p>
                  </div>
                );
              })()}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                {[[FLIRT,"💘 플러팅이지","rgba(255,95,176,0.1)","rgba(255,95,176,0.4)","linear-gradient(135deg,#ff5fb0,#ff2d7a)"],
                  [NOT_FLIRT,"😊 그냥 친절","rgba(100,181,246,0.1)","rgba(100,181,246,0.4)","linear-gradient(135deg,#64b5f6,#2979ff)"]].map(([val,label,bg,border,activeBg]) => (
                  <button key={val} onClick={() => castVote(val)} style={{ background: chosenSide === val ? activeBg : bg, border: `2px solid ${border}`, borderRadius: "14px", color: "#fff", padding: "17px 10px", fontSize: "15px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}>{label}</button>
                ))}
              </div>

              <div style={{ textAlign: "right" }}>
                <button onClick={() => handleReport(scenario.id)} disabled={!!reportedByMe[scenario.id]} style={{ background: "none", border: "none", color: reportedByMe[scenario.id] ? "rgba(255,100,100,0.55)" : "rgba(255,255,255,0.18)", fontSize: "11px", cursor: reportedByMe[scenario.id] ? "default" : "pointer", fontFamily: "inherit" }}>
                  🚩 {reportedByMe[scenario.id] ? "신고됨" : "부적절한 내용 신고"}{(reports[scenario.id]||0) > 0 && ` (${reports[scenario.id]})`}
                </button>
              </div>
            </div>
          )}

          {phase === "result" && (() => {
            const res = resultMessage();
            return (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <h2 style={{ color: "#fff", fontSize: "clamp(22px,5vw,30px)", fontWeight: 900, margin: "0 0 8px" }}>{res.title}</h2>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>{res.desc}</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                  {[["#ff5fb0", flirtCount, "💘 플러팅"], ["#64b5f6", notFlirtCount, "😊 친절"], ["#a78bfa", (() => {
                    let m = 0;
                    activeScenarios.forEach(s => {
                      const v = votes[s.id]; if (!v) return;
                      const gv = globalVotes[s.id] || { flirt:0, notFlirt:0 };
                      const maj = gv.flirt >= gv.notFlirt;
                      if ((maj && v===FLIRT)||(!maj && v===NOT_FLIRT)) m++;
                    });
                    return `${Math.round((m/totalScenarios)*100)}%`;
                  })(), "🫂 대세 일치"]].map(([color, val, label]) => (
                    <div key={label} style={{ ...card, padding: "14px", textAlign: "center" }}>
                      <div style={{ color, fontSize: "24px", fontWeight: 900 }}>{val}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "4px" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ ...card, padding: "16px", marginBottom: "18px" }}>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", margin: "0 0 12px", fontWeight: 700 }}>전체 투표 결과</p>
                  {gameScenarios.map(s => {
                    const gv = globalVotes[s.id] || { flirt:0, notFlirt:0 };
                    const total = gv.flirt + gv.notFlirt;
                    const flirtPct = total > 0 ? Math.round((gv.flirt/total)*100) : 50;
                    const myVote = votes[s.id];
                    const majorityIsFlirt = gv.flirt >= gv.notFlirt;
                    const iDiffer = myVote && ((majorityIsFlirt && myVote===NOT_FLIRT)||(!majorityIsFlirt && myVote===FLIRT));
                    return (
                      <div key={s.id} style={{ marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", alignItems: "center" }}>
                          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px" }}>{s.emoji} {s.tag}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            {iDiffer && <span style={{ fontSize: "9px", color: "#fbbf24", background: "rgba(251,191,36,0.15)", borderRadius: "4px", padding: "1px 5px" }}>대세와 달라요</span>}
                            <span style={{ color: myVote===FLIRT ? "#ff5fb0" : "#64b5f6", fontSize: "10px", fontWeight: 700 }}>{myVote===FLIRT ? "💘" : "😊"}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", height: "5px", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ width: `${flirtPct}%`, background: "linear-gradient(90deg,#ff5fb0,#a855f7)" }} />
                          <div style={{ flex: 1, background: "rgba(100,181,246,0.3)" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: "10px" }}>💘 {flirtPct}%</span>
                          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: "10px" }}>{100-flirtPct}% 😊</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={shareAll} style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "50px", color: "#fff", padding: "13px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: "10px" }}>
                    {copied==="share" ? "✅ 복사됨!" : "🔗 결과 공유하기"}
                  </button>
                <button onClick={restart} style={{ width: "100%", background: "linear-gradient(135deg,#ff5fb0,#a855f7)", color: "#fff", border: "none", borderRadius: "50px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>다시 하기 🔄</button>
              </div>
            );
          })()}
        </div>
      )}

      {!loadingData && tab === "ranking" && (() => {
        // 기본 항목 + 투표 5개↑ 유저 제안 합쳐서 랭킹
        const allItems = [
          ...BASE_SCENARIOS,
          ...suggestions.filter(s => {
            const sv = suggestionVotes[s.id] || { flirt: 0, notFlirt: 0 };
            return (sv.flirt + sv.notFlirt) >= 5;
          })
        ];
        const ranked = allItems.map(s => {
          const gv = globalVotes[s.id] || suggestionVotes[s.id] || { flirt:0, notFlirt:0 };
          const total = gv.flirt + gv.notFlirt;
          const flirtPct = total > 0 ? (gv.flirt/total)*100 : 50;
          const heat = 100 - Math.abs(flirtPct - 50) * 2;
          return { ...s, gv, total, flirtPct: Math.round(flirtPct), heat };
        }).filter(s => s.total > 0).sort((a,b) => b.heat - a.heat).slice(0,5);

        const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
        const heatColors = ["#ff5fb0","#f97316","#eab308","#84cc16","#22d3ee"];
        return (
          <div style={{ width: "100%", maxWidth: "480px", animation: "fadeIn 0.4s ease" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textAlign: "center", marginBottom: "20px" }}>찬반이 가장 팽팽한 항목 TOP 5 🔥</p>
            {ranked.length === 0 && <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>아직 투표 데이터가 부족해요!</p>}
            {ranked.map((s, i) => (
              <div key={s.id} style={{ ...card, padding: "16px 18px", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${s.heat}%`, background: `linear-gradient(90deg, ${heatColors[i]}18, transparent)`, pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "24px" }}>{medals[i]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "16px" }}>{s.emoji}</span>
                      <span style={{ color: "#fff", fontSize: "13px", fontWeight: 700 }}>{s.tag}</span>
                      <span style={{ fontSize: "11px", color: heatColors[i], background: `${heatColors[i]}22`, borderRadius: "6px", padding: "1px 7px", fontWeight: 700 }}>열기 {Math.round(s.heat)}°</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", margin: 0, lineHeight: 1.4 }}>{s.text}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                  <span style={{ color: "#ff5fb0", fontSize: "12px", fontWeight: 700, minWidth: "32px" }}>{s.flirtPct}%</span>
                  <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.07)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.flirtPct}%`, background: "linear-gradient(90deg,#ff5fb0,#a855f7)" }} />
                  </div>
                  <span style={{ color: "#64b5f6", fontSize: "12px", fontWeight: 700, minWidth: "32px", textAlign: "right" }}>{100-s.flirtPct}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>💘 플러팅</span>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>{s.total.toLocaleString()}명 투표</span>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>친절 😊</span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {!loadingData && tab === "suggest" && (
        <div style={{ width: "100%", maxWidth: "480px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ ...card, padding: "18px", marginBottom: "18px" }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: "14px", margin: "0 0 12px" }}>새 상황 제안하기 ✏️</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setSuggestEmoji(e)} style={{ fontSize: "20px", background: suggestEmoji===e ? "rgba(255,95,176,0.2)" : "rgba(255,255,255,0.05)", border: suggestEmoji===e ? "2px solid rgba(255,95,176,0.5)" : "2px solid transparent", borderRadius: "8px", padding: "3px 7px", cursor: "pointer" }}>{e}</button>
              ))}
            </div>
            <textarea value={suggestText} onChange={e => setSuggestText(e.target.value)} maxLength={80} placeholder="예: 지나가다 넘어질 뻔했는데 반사적으로 잡아줌" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "13px", padding: "10px", resize: "none", height: "72px", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>{suggestText.length}/80</span>
              <button onClick={submitSuggestion} disabled={!suggestText.trim()} style={{ background: suggestText.trim() ? "linear-gradient(135deg,#ff5fb0,#a855f7)" : "rgba(255,255,255,0.08)", color: "#fff", border: "none", borderRadius: "50px", padding: "9px 22px", fontSize: "13px", fontWeight: 700, cursor: suggestText.trim() ? "pointer" : "default", fontFamily: "inherit" }}>
                {submitDone ? "✅ 제출됨!" : "제출하기"}
              </button>
            </div>
          </div>

          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: "0 0 10px", fontWeight: 700 }}>유저 제안 ({suggestions.length})</p>
          {suggestions.length === 0 && <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "13px", textAlign: "center", marginTop: "28px" }}>아직 제안이 없어요. 첫 번째로 올려봐요! 🙌</p>}
          {suggestions.map(s => {
            const sv = suggestionVotes[s.id] || { flirt:0, notFlirt:0 };
            const total = sv.flirt + sv.notFlirt;
            const flirtPct = total > 0 ? Math.round((sv.flirt/total)*100) : null;
            const myVote = myVotedSuggestions[s.id];
            const rCount = reports[s.id] || 0;
            const reported = reportedByMe[s.id];
            const isHidden = total > 0 && rCount/total >= REPORT_RATIO_THRESHOLD;
            if (isHidden) return (
              <div key={s.id} style={{ ...card, padding: "12px 16px", marginBottom: "8px", opacity: 0.35, textAlign: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>🚩 신고로 인해 숨겨진 항목</span>
              </div>
            );
            return (
              <div key={s.id} style={{ ...card, padding: "14px 16px", marginBottom: "10px" }}>
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "22px" }}>{s.emoji}</span>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 600, margin: 0, lineHeight: 1.5, flex: 1 }}>{s.text}</p>
                </div>
                {!myVote ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px", marginBottom: "8px" }}>
                    {[[FLIRT,"💘 플러팅","rgba(255,95,176,0.1)","rgba(255,95,176,0.35)"],
                      [NOT_FLIRT,"😊 친절","rgba(100,181,246,0.1)","rgba(100,181,246,0.35)"]].map(([val,label,bg,border]) => (
                      <button key={val} onClick={() => voteSuggestion(s.id, val)} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: "9px", color: "#fff", padding: "9px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{label}</button>
                    ))}
                  </div>
                ) : flirtPct !== null ? (
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "3px" }}>
                      <span style={{ color: "#ff5fb0", fontSize: "11px", fontWeight: 700, minWidth: "26px" }}>{flirtPct}%</span>
                      <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${flirtPct}%`, background: "linear-gradient(90deg,#ff5fb0,#a855f7)" }} />
                      </div>
                      <span style={{ color: "#64b5f6", fontSize: "11px", fontWeight: 700, minWidth: "26px", textAlign: "right" }}>{100-flirtPct}%</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.22)", fontSize: "10px", margin: 0 }}>{total}명 투표 · 내 선택: {myVote===FLIRT ? "💘 플러팅" : "😊 친절"}</p>
                  </div>
                ) : null}
                <div style={{ textAlign: "right" }}>
                  <button onClick={() => handleReport(s.id)} disabled={!!reported} style={{ background: "none", border: "none", color: reported ? "rgba(255,100,100,0.5)" : "rgba(255,255,255,0.16)", fontSize: "11px", cursor: reported ? "default" : "pointer", fontFamily: "inherit" }}>
                    🚩 {reported ? "신고됨" : "신고"}{rCount > 0 && ` (${rCount})`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <a href="/privacy.html" style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px", textDecoration: "none" }}>개인정보 처리방침</a>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        textarea::placeholder { color: rgba(255,255,255,0.18); }
      `}</style>
    </div>
  );
}
