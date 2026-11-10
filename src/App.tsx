import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  HelpCircle,
  FileText,
  Compass,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Languages,
  Sparkles,
  Flame,
  Ship,
  Waves,
  ShieldAlert,
  MessageSquare,
  BookOpen,
  Award
} from 'lucide-react';
import {
  TESTIMONIES,
  INTRO_PREMISE,
  HINTS,
  FULL_SOUP_TRUTH,
  checkExactOrRuleQuestion,
  evaluateDeduction
} from './game/rules.ts';

type Language = 'en' | 'zh';

interface ChatMessage {
  id: string;
  sender: 'investigator' | 'lucia';
  text: string;
  label?: 'Yes' | 'No' | 'Unknown' | 'Irrelevant';
  dialogue?: string;
  type?: 'YES' | 'NO' | 'UNKNOWN' | 'IRRELEVANT' | 'CLUE';
  deducted?: boolean;
  timestamp: string;
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [questionsLeft, setQuestionsLeft] = useState<number>(40);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mobileView, setMobileView] = useState<'chat' | 'dossier'>('chat');

  // Modals
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [hintStep, setHintStep] = useState<number>(1);
  const [showDeductionModal, setShowDeductionModal] = useState<boolean>(false);
  const [deductionInput, setDeductionInput] = useState<string>('');
  const [isDeducing, setIsDeducing] = useState<boolean>(false);
  const [deductionFeedback, setDeductionFeedback] = useState<any | null>(null);
  const [showTruthModal, setShowTruthModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: ChatMessage = {
        id: 'msg-0',
        sender: 'lucia',
        text:
          lang === 'en'
            ? "I survived the ascent... but my mind still trembles. Fellow investigator, ask me any single yes/no question about what I witnessed, and I shall tell you the truth of our dying waters."
            : "我活着从水面回来了……但恐惧依旧没有褪去。同族的调查员，请向我提出可以判断真伪的具体问题，我会如实回答我所见到的一切。",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialGreeting]);
    }
  }, [lang]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleAsk = async (questionToAsk?: string) => {
    const q = (questionToAsk || inputQuestion).trim();
    if (!q || isLoading) return;

    if (questionsLeft <= 0) {
      alert(
        lang === 'en'
          ? "No questions remaining! Please submit your deduction."
          : "提问次数已耗尽！请点击「提交推理」进行结案判定。"
      );
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'investigator',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      // Send to server
      const res = await fetch('/api/lucia/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          language: lang,
          history: messages.map(m => ({ role: m.sender, content: m.text }))
        })
      });

      if (!res.ok) {
        throw new Error('Server response error');
      }

      const data = await res.json();

      const luciaMsg: ChatMessage = {
        id: `msg-${Date.now()}-lucia`,
        sender: 'lucia',
        text: data.dialogue || data.answer || (data.label ? data.label : ''),
        label: data.label,
        dialogue: data.dialogue,
        type: data.type || (data.label ? (data.label.toUpperCase() as any) : undefined),
        deducted: data.deductAttempt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, luciaMsg]);

      // Deduct question count if applicable (clarifications & guidance do not deduct)
      if (data.deductAttempt) {
        setQuestionsLeft(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Ask failed, using deterministic local check:', err);
      // Local fallback
      const local = checkExactOrRuleQuestion(q, lang);
      const label = local ? local.label : 'Unknown';
      const dialogue = local
        ? (lang === 'zh' ? local.dialogueZh : local.dialogueEn)
        : (lang === 'zh' ? '我不知道。' : "I don't know.");
      const answer = local
        ? (lang === 'zh' ? local.fullTextZh : local.fullTextEn)
        : (lang === 'zh' ? 'Unknown\n我不知道。' : "Unknown\nI don't know.");
      const type = local ? local.type : 'UNKNOWN';
      const deduct = local ? local.deductAttempt : true;

      const luciaMsg: ChatMessage = {
        id: `msg-${Date.now()}-lucia-local`,
        sender: 'lucia',
        text: dialogue || label || answer,
        label,
        dialogue,
        type,
        deducted: deduct,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, luciaMsg]);
      if (deduct) {
        setQuestionsLeft(prev => Math.max(0, prev - 1));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (
      confirm(
        lang === 'en'
          ? "Reset the investigation and restore 40 question attempts?"
          : "确定要重置调查并将提问次数恢复为 40 次吗？"
      )
    ) {
      setQuestionsLeft(40);
      setMessages([]);
      setDeductionFeedback(null);
      setShowTruthModal(false);
      setHintStep(1);
    }
  };

  const handleDeduceSubmit = async () => {
    if (!deductionInput.trim() || isDeducing) return;
    setIsDeducing(true);

    try {
      const res = await fetch('/api/lucia/deduce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deduction: deductionInput.trim(),
          language: lang
        })
      });

      const data = await res.json();
      setDeductionFeedback(data);
      setShowDeductionModal(false);
      setShowTruthModal(true);
    } catch (err) {
      console.error('Deduction failed, running local evaluation:', err);
      const localEval = evaluateDeduction(deductionInput);
      setDeductionFeedback({
        isSolved: localEval.isSolved,
        score: localEval.score,
        feedback: lang === 'zh' ? localEval.feedbackZh : localEval.feedbackEn,
        unlockedClues: localEval.unlockedClues,
        fullTruth: localEval.isSolved ? (lang === 'zh' ? FULL_SOUP_TRUTH.bodyZh : FULL_SOUP_TRUTH.bodyEn) : null
      });
      setShowDeductionModal(false);
      setShowTruthModal(true);
    } finally {
      setIsDeducing(false);
    }
  };

  const renderBadge = (type?: string, label?: string) => {
    const key = (label || type || '').toUpperCase();
    switch (key) {
      case 'YES':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Yes
          </span>
        );
      case 'NO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5" />
            No
          </span>
        );
      case 'UNKNOWN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/40">
            <HelpCircle className="w-3.5 h-3.5" />
            Unknown
          </span>
        );
      case 'IRRELEVANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            Irrelevant
          </span>
        );
      case 'CLUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {lang === 'en' ? 'CLUE INSIGHT' : '破案线索'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans bg-[url('/assets/aistudio/image_73099071.png')] bg-cover bg-top bg-no-repeat bg-fixed">
      {/* Top Header Bar - completely transparent so the Ark at the top is unobstructed */}
      <header className="relative z-10 bg-transparent px-4 lg:px-8 pt-4 pb-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-950/40 border border-cyan-400/30 text-cyan-300 shadow-lg">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest font-mono text-cyan-400/90 uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40">
                {lang === 'en' ? 'SUB-ABYSS CASE #07' : '深海调查卷宗 #07'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {lang === 'en' ? 'LATERAL THINKING PUZZLE' : '硬核海龟汤'}
              </span>
            </div>
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white font-serif flex items-center gap-2">
              {lang === 'en' ? "Noah's Ark: Lucia's Testimony" : '《诺亚方舟：露琪亚的证词》'}
            </h1>
          </div>
        </div>

        {/* Status Tracker & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2 lg:gap-3">
          {/* Question counter pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-inner">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-300 font-medium">
              {lang === 'en' ? 'Questions Left:' : '剩余提问次数:'}
            </span>
            <span
              className={`font-mono font-bold text-sm px-1.5 py-0.5 rounded ${
                questionsLeft > 5
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'bg-rose-500/20 text-rose-300 animate-pulse'
              }`}
            >
              {questionsLeft} / 40
            </span>
          </div>

          {/* Hint button */}
          <button
            onClick={() => setShowHintModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            {lang === 'en' ? 'Ask for Hint' : '要提示'}
          </button>

          {/* Submit deduction button */}
          <button
            onClick={() => setShowDeductionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 transition transform hover:-translate-y-0.5"
          >
            <Award className="w-4 h-4" />
            {lang === 'en' ? 'Submit Deduction' : '提交推理'}
          </button>

          {/* Rules info */}
          <button
            onClick={() => setShowRulesModal(true)}
            aria-label="How to play"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-cyan-300 transition"
            title="Toggle Language"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? '中文' : 'English'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            aria-label="Reset"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-950/60 hover:border-rose-700 border border-slate-700 text-slate-400 hover:text-rose-300 transition"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile View Switcher */}
      <div className="lg:hidden px-4 pt-3 pb-0 flex gap-2 z-10 relative">
        <button
          onClick={() => setMobileView('chat')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            mobileView === 'chat'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Interrogation Chamber' : '审讯露琪亚'}</span>
        </button>
        <button
          onClick={() => setMobileView('dossier')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            mobileView === 'dossier'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
              : 'bg-slate-900/60 text-slate-400 border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Case Dossier & Testimonies' : '案情卷宗（含引子与证词）'}</span>
        </button>
      </div>

      {/* Main Container - pushed down slightly so the ship hull at the top of the background remains completely clear */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 px-4 lg:px-6 pb-5 pt-10 lg:pt-16 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Left Column: Testimonies & Lore Dossier */}
        <div className={`lg:col-span-5 ${mobileView === 'dossier' ? 'flex' : 'hidden lg:flex'} flex-col bg-slate-950/35 rounded-2xl border border-cyan-500/25 shadow-2xl overflow-hidden h-[calc(100vh-190px)] min-h-[480px]`}>
          {/* Dossier Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 bg-transparent px-4 py-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h2 className="font-serif font-bold text-sm text-cyan-300">
                {lang === 'en' ? 'Case Dossier & Testimonies' : '案情卷宗与六条证词'}
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-cyan-300/80">
              {lang === 'en' ? 'PREMISE & TESTIMONIES' : '引子与证词'}
            </span>
          </div>

          {/* Dossier Body: Merged Premise + 6 Testimonies */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* 1. The Premise (案情引子) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-cyan-300 flex items-center gap-2">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  {lang === 'en' ? INTRO_PREMISE.en.title : INTRO_PREMISE.zh.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/50 text-cyan-400">
                  {lang === 'en' ? 'PREMISE' : '核心引子'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {lang === 'en' ? INTRO_PREMISE.en.body : INTRO_PREMISE.zh.body}
              </p>

              {/* Witness Snapshot Badge */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
                <span>
                  <strong className="text-slate-300">{lang === 'en' ? 'Witness:' : '目击幸存者:'}</strong> Lucia (露琪亚)
                </span>
                <span>
                  <strong className="text-slate-300">{lang === 'en' ? 'Species/Anatomy:' : '族群特征:'}</strong>{' '}
                  {lang === 'en' ? 'Aquatic human (6 limbs)' : '水生人类（六触肢）'}
                </span>
              </div>
            </div>

            {/* 2. Investigation Protocol Notice */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/30 text-xs text-cyan-200/90 leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-cyan-300 block mb-0.5">
                  {lang === 'en' ? 'INVESTIGATION PROTOCOL:' : '调查守则：'}
                </span>
                {lang === 'en'
                  ? "Carefully inspect the six testimonies below. Ask Lucia precise Yes/No questions to resolve the anomaly of the inverted mountain and the receding sea."
                  : '请仔细审阅以下幸存者露琪亚带回的六条目击证词，向她提出具体真假问题，破解倒悬巨构与海水退去的真相。'}
              </div>
            </div>

            {/* 3. The 6 Testimonies (六条证词) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  {lang === 'en' ? 'The Six Eyewitness Testimonies' : '六条亲历证词'}
                </span>
                <span className="text-[10px] font-mono text-cyan-400/70">I – VI</span>
              </div>

              {TESTIMONIES.map(t => (
                <div
                  key={t.id}
                  className="group relative p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-950/90 border border-slate-800/80 hover:border-cyan-500/50 transition duration-200"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-bold text-sm text-cyan-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                      {lang === 'en' ? t.titleEn : t.titleZh}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-cyan-300/80">
                      {lang === 'en' ? t.tagEn : t.tagZh}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {lang === 'en' ? t.contentEn : t.contentZh}
                  </p>
                </div>
              ))}
            </div>

            {/* 4. Core Mystery Question */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200/90 leading-relaxed">
              <span className="font-semibold text-amber-300 block mb-1">
                {lang === 'en' ? 'CORE MYSTERY QUESTION:' : '核心疑案：'}
              </span>
              {lang === 'en'
                ? "Why is an inverted mountain resting on the waters? Who are the giant deities with four fewer arms? What was the non-solid crimson light that vaporized water and burned Matt? And what does 'the sea level is dropping' truly signify?"
                : '水面上方倒悬的巨山究竟是什么？比我们少四只手的神明是谁？那团瞬间蒸发海水烧焦身体的非固态赤红异物又是什么？而“海平面正在下降”到底揭示了什么宏大真相？'}
            </div>
          </div>
        </div>

        {/* Right Column: Interrogation Chamber & Terminal */}
        <div className={`lg:col-span-7 ${mobileView === 'chat' ? 'flex' : 'hidden lg:flex'} flex-col bg-slate-950/35 rounded-2xl border border-cyan-500/25 shadow-2xl overflow-hidden h-[calc(100vh-190px)] min-h-[480px]`}>
          {/* Witness Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 bg-transparent px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-400/60 flex items-center justify-center text-cyan-300 font-serif font-bold text-sm shadow">
                  L
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-white font-serif">
                    {lang === 'en' ? 'Lucia (Survivor)' : '露琪亚（生还者）'}
                  </h2>
                  <span className="text-[10px] text-cyan-400/80 font-mono px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800/50">
                    {lang === 'en' ? 'FIRST PERSON HOST' : '第一人称主持人'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {lang === 'en'
                    ? 'Replies in single sentences: Yes / No / Unknown / Irrelevant'
                    : '优先单句回答：是 / 不是 / 不知道 / 与调查无关'}
                </p>
              </div>
            </div>

            {/* Quick help badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {lang === 'en' ? 'Interrogation Active' : '审讯连线中'}
            </div>
          </div>

          {/* Chat / Transcript Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'investigator' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {msg.sender === 'investigator'
                      ? (lang === 'en' ? 'You (Investigator)' : '你（调查员）')
                      : (lang === 'en' ? 'Lucia' : '露琪亚')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{msg.timestamp}</span>
                  {msg.sender === 'lucia' && (msg.label || msg.type) && renderBadge(msg.type, msg.label)}
                  {msg.sender === 'lucia' && msg.deducted === false && msg.type !== 'CLUE' && (
                    <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50">
                      {lang === 'en' ? 'Free (no count)' : '不扣提问次数'}
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-md ${
                    msg.sender === 'investigator'
                      ? 'bg-cyan-600 text-white rounded-br-none border border-cyan-400/30'
                      : msg.type === 'CLUE'
                      ? 'bg-amber-950/30 text-amber-100 rounded-bl-none border border-amber-500/50 shadow-amber-950/40'
                      : 'bg-slate-950/85 text-slate-200 rounded-bl-none border border-slate-800/90'
                  }`}
                >
                  {msg.sender === 'lucia' && msg.dialogue ? (
                    <div>{msg.dialogue}</div>
                  ) : msg.sender === 'lucia' && msg.label ? (
                    <div className="text-slate-100">
                      {lang === 'zh'
                        ? msg.label === 'Yes'
                          ? '是。'
                          : msg.label === 'No'
                          ? '不是。'
                          : msg.label === 'Unknown'
                          ? '我不知道。'
                          : '与调查无关。'
                        : msg.label === 'Yes'
                        ? 'Yes.'
                        : msg.label === 'No'
                        ? 'No.'
                        : msg.label === 'Unknown'
                        ? "I don't know."
                        : 'Irrelevant to the investigation.'}
                    </div>
                  ) : (
                    <div>{msg.text}</div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {lang === 'en' ? 'Lucia is recalling...' : '露琪亚正在回忆...'}
                  </span>
                </div>
                <div className="bg-slate-950/85 text-cyan-400 rounded-2xl rounded-bl-none border border-slate-800 px-4 py-2.5 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-300" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Question Input Field */}
          <div className="p-3.5 bg-slate-950/95 border-t border-cyan-900/40">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleAsk();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={e => setInputQuestion(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? "Ask a single yes/no question... (e.g. 'Was the thing Matt touched solid?')"
                    : "提出一个具体的真伪问题……（例如：『马特碰到的东西是固体吗？』）"
                }
                disabled={isLoading || questionsLeft <= 0}
                className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isLoading || questionsLeft <= 0}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Ask' : '提问'}</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* MODAL 1: HINTS */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-white">
                  {lang === 'en' ? 'Investigation Hint' : '破案线索提示'}
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                {lang === 'en' ? `Hint ${hintStep} of ${HINTS.length}` : `线索 ${hintStep} / ${HINTS.length}`}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-5">
              <h4 className="font-semibold text-sm text-amber-300 mb-2">
                {lang === 'en' ? HINTS[hintStep - 1].titleEn : HINTS[hintStep - 1].titleZh}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'en' ? HINTS[hintStep - 1].contentEn : HINTS[hintStep - 1].contentZh}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setHintStep(prev => Math.max(1, prev - 1))}
                disabled={hintStep === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-300"
              >
                {lang === 'en' ? 'Previous Hint' : '上一条提示'}
              </button>

              <button
                onClick={() => setShowHintModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white"
              >
                {lang === 'en' ? 'Close' : '关闭'}
              </button>

              <button
                onClick={() => setHintStep(prev => Math.min(HINTS.length, prev + 1))}
                disabled={hintStep === HINTS.length}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-xs font-bold text-slate-950"
              >
                {lang === 'en' ? 'Next Hint' : '下一条提示'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT DEDUCTION */}
      {showDeductionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Award className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-white">
                  {lang === 'en' ? 'Submit Deduction & Solve the Case' : '提交推理 · 结案判定'}
                </h3>
              </div>
              <button
                onClick={() => setShowDeductionModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 text-xs text-slate-300 leading-relaxed bg-cyan-950/30 p-3 rounded-xl border border-cyan-800/30">
              <span className="font-semibold text-cyan-300 block mb-1">
                {lang === 'en' ? 'KEY QUESTIONS TO EXPLAIN:' : '请在推理中完整说明：'}
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                <li>
                  {lang === 'en'
                    ? "Who are Lucia and you (the investigator)? What kind of civilization?"
                    : "露琪亚和调查员到底是什么生物？属于怎样的文明？"}
                </li>
                <li>
                  {lang === 'en'
                    ? "What is the massive inverted mountain floating above?"
                    : "海面上倒悬的巨构大船是什么？"}
                </li>
                <li>
                  {lang === 'en'
                    ? "Who are the towering 'deities' with four fewer arms?"
                    : "拥有少四只手特征的『神明』是谁？"}
                </li>
                <li>
                  {lang === 'en'
                    ? "What was the unnameable substance that burned Matt?"
                    : "灼烧并杀死马特的不可名状之物是什么？"}
                </li>
                <li>
                  {lang === 'en'
                    ? "Why is 'the sea level dropping' an apocalypse for you?"
                    : "为什么『海平面正在下降』对你们而言是灭顶之灾？"}
                </li>
              </ul>
            </div>

            <textarea
              rows={5}
              value={deductionInput}
              onChange={e => setDeductionInput(e.target.value)}
              placeholder={
                lang === 'en'
                  ? "Describe your full deduction here... (e.g. 'Lucia and the investigator are actually underwater creatures calling themselves humans. The ship is Noah's Ark, and the unnameable thing Matt touched was fire...')"
                  : "在此输入你的完整推理猜想……（例如：『露琪亚和调查员是生活在深海的水下生物，自称人类。海面上的船其实是诺亚方舟，马特碰到的是火，大洪水退去导致海平面下降……』）"
              }
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition mb-4 resize-none"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeductionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                {lang === 'en' ? 'Cancel' : '取消'}
              </button>
              <button
                onClick={handleDeduceSubmit}
                disabled={!deductionInput.trim() || isDeducing}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
              >
                {isDeducing ? (
                  <span>{lang === 'en' ? 'Judging...' : '判定中...'}</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Submit for Evaluation' : '提交结案判定'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CASE EVALUATION / TRUTH REVEAL */}
      {showTruthModal && deductionFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {deductionFeedback.isSolved ? (
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Compass className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    {deductionFeedback.isSolved
                      ? (lang === 'en' ? 'CASE SOLVED · TRUTH UNVEILED' : '成功破案 · 汤底揭晓！')
                      : (lang === 'en' ? 'INCOMPLETE DEDUCTION' : '推理尚不完整')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'en' ? `Evaluation Score: ${deductionFeedback.score} / 100` : `综合得分：${deductionFeedback.score} / 100`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTruthModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {/* Checklist of unlocked truths */}
            {deductionFeedback.unlockedClues && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    deductionFeedback.unlockedClues.underwaterCivilization
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === 'en' ? 'Underwater Civilization' : '水下文明身份（自称人类）'}</span>
                </div>

                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    deductionFeedback.unlockedClues.noahsArk
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <Ship className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === 'en' ? "Noah's Ark Identified" : '巨构为诺亚方舟'}</span>
                </div>

                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    deductionFeedback.unlockedClues.landHumansAsDeities
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <Award className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === 'en' ? 'Deities = Land Humans (2 Arms)' : '神明即陆地人类（少四肢）'}</span>
                </div>

                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    deductionFeedback.unlockedClues.fireIdentified
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <Flame className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === 'en' ? 'Anomaly = Fire' : '不可名状之物为火'}</span>
                </div>
              </div>
            )}

            {/* Judge Feedback */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-4">
              <h4 className="text-xs font-semibold text-cyan-300 mb-1">
                {lang === 'en' ? 'Judge Evaluation:' : '主审官复盘评语：'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{deductionFeedback.feedback}</p>
            </div>

            {/* Canonical Full Truth if Solved or Score >= 50 */}
            {(deductionFeedback.isSolved || deductionFeedback.score >= 50) && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 mb-4">
                <h4 className="font-serif font-bold text-sm text-cyan-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  {lang === 'en' ? FULL_SOUP_TRUTH.titleEn : FULL_SOUP_TRUTH.titleZh}
                </h4>
                <div className="text-xs text-slate-200 leading-relaxed space-y-2 whitespace-pre-line font-sans">
                  {lang === 'en' ? FULL_SOUP_TRUTH.bodyEn : FULL_SOUP_TRUTH.bodyZh}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowTruthModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                {lang === 'en' ? 'Return to Investigation' : '返回调查界面'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RULES / HOW TO PLAY */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="font-serif font-bold text-base text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                {lang === 'en' ? 'Investigation Rules' : '玩法与主持规则'}
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3.5 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-semibold text-cyan-300 mb-1">
                  {lang === 'en' ? '1. Player Objective' : '1. 玩家目标'}
                </h4>
                <p>
                  {lang === 'en'
                    ? "Read the 6 testimonies and interrogate survivor Lucia. Ask one single Yes/No verifiable question per turn. You have 40 question attempts. Click 'Ask for Hint' if stuck, and 'Submit Deduction' once you understand the truth."
                    : '阅读六条证词，向幸存者露琪亚提问。每次问一个可以判断真假的问题（共有40次提问机会）。卡住时可以点「要提示」，有了完整解释就点「提交推理」。'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-semibold text-cyan-300 mb-1">
                  {lang === 'en' ? '2. Lucia Persona & Host Rules' : '2. 露琪亚主持原则'}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>
                    {lang === 'en'
                      ? "Answers in first person as a traumatized survivor."
                      : '以第一人称回答，亲历事件的幸存者视角。'}
                  </li>
                  <li>
                    {lang === 'en'
                      ? "Prefers one sentence: Yes / No / Unknown / Irrelevant."
                      : '优先用一句话回答：是 / 不是 / 不知道 / 与调查无关。'}
                  </li>
                  <li>
                    {lang === 'en'
                      ? "Compound or open questions trigger clarification (no count lost)."
                      : '复合问题或开放式问题会触发澄清，不扣除提问次数。'}
                  </li>
                  <li>
                    {lang === 'en'
                      ? "Lucia calls her own aquatic kind 'humans'. She knows they live underwater on Earth."
                      : '露琪亚称自己的水下种族为「人类」，神明比他们少四只手。'}
                  </li>
                  <li>
                    {lang === 'en'
                      ? "Lucia has never heard of 'fire' and will say she doesn't know the word, but can confirm physical facts (e.g. not a solid)."
                      : '露琪亚没听过「火」这个词，但能确认具体物理属性（例如非固体）。'}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                {lang === 'en' ? 'Got It' : '明白了'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
