"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import type content from "@/data/studio.json";
import Icon from "./icon";

type Introduction = typeof content.introduction;
type Stories = typeof content.heroStories;

function subscribeMotion(callback: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
}

function readMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, readMotion, () => true);
}

function TypedText({
  text,
  running,
  immediate,
  delay = 0,
  speed = 32,
  onComplete,
}: {
  text: string;
  running: boolean;
  immediate: boolean;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}) {
  const characters = useMemo(() => {
    const segmenter = new Intl.Segmenter("vi", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }, [text]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (running && !immediate && count === characters.length) onComplete?.();
  }, [characters.length, count, immediate, onComplete, running]);

  useEffect(() => {
    if (!running || immediate) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCount((current) => {
          if (current + 1 >= characters.length) clearInterval(interval);
          return Math.min(current + 1, characters.length);
        });
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [characters.length, delay, immediate, running, speed]);

  return (
    <span className="typed-text">
      <span className="sr-only">{text}</span>
      <span className="typed-reserve" aria-hidden="true">{text}</span>
      <span className="typed-visible" aria-hidden="true">
        {immediate ? text : characters.slice(0, count).join("")}
        {!immediate && running && count < characters.length && (
          <span className="typing-caret" />
        )}
      </span>
    </span>
  );
}

function GrowthIllustration({ variant }: { variant: string }) {
  return (
    <svg className={`growth-illustration growth-${variant}`} viewBox="0 0 240 130" fill="none" aria-hidden="true">
      <path className="growth-route" d="M9 105C50 105 34 54 81 68S128 105 153 56 197 49 226 13" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" />
      <circle className="growth-orbit" cx="153" cy="56" r="22" stroke="currentColor" strokeOpacity=".3" />
      <circle cx="153" cy="56" r="13" fill="currentColor" fillOpacity=".07" />
      <circle className="growth-dot" cx="153" cy="56" r="4" fill="currentColor" />
      <path d="m216 13 11-1-1 11M42 100h12V86H42v14Zm22 0h12V76H64v24Zm22 0h12V64H86v36Z" stroke="currentColor" strokeWidth="1.5" />
      <rect x="106" y="11" width="31" height="23" rx="5" fill="#f6f8f0" stroke="currentColor" strokeOpacity=".5" />
      <path d="m115 22 5 5 9-10M192 88v12m-6-6h12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function WelcomeIntro({
  introduction,
  onComplete,
}: {
  introduction: Introduction;
  onComplete: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const [questionComplete, setQuestionComplete] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const complete = useCallback(() => {
    clearTimeout(exitTimer.current);
    clearTimeout(holdTimer.current);
    dialogRef.current?.close();
    onComplete();
  }, [onComplete]);

  const dismiss = useCallback(() => {
    clearTimeout(holdTimer.current);
    setLeaving(true);
    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(complete, introduction.timing.exitMs);
  }, [complete, introduction.timing.exitMs]);

  const finishQuestion = useCallback(() => setQuestionComplete(true), []);
  const finishTyping = useCallback(() => setTypingComplete(true), []);

  useEffect(() => {
    if (!typingComplete) return;
    holdTimer.current = setTimeout(dismiss, introduction.timing.holdMs);
    return () => clearTimeout(holdTimer.current);
  }, [dismiss, introduction.timing.holdMs, typingComplete]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || window.location.hash) {
      onComplete();
      return;
    }
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onPreferenceChange = () => { if (preference.matches) complete(); };
    preference.addEventListener("change", onPreferenceChange);
    return () => {
      clearTimeout(holdTimer.current);
      clearTimeout(exitTimer.current);
      document.body.style.overflow = overflow;
      preference.removeEventListener("change", onPreferenceChange);
      dialog.close();
    };
  }, [complete, dismiss, onComplete]);

  return (
    <dialog
      ref={dialogRef}
      className={`welcome-intro ${leaving ? "intro-leaving" : ""}`}
      data-typed={typingComplete}
      style={{ "--intro-hold": `${introduction.timing.holdMs}ms`, "--intro-exit": `${introduction.timing.exitMs}ms` } as CSSProperties}
      aria-labelledby="welcome-title"
      aria-describedby="welcome-answer"
      onCancel={(event) => { event.preventDefault(); dismiss(); }}
    >
      <div className="intro-top"><span className="intro-brand">h<span>.</span></span><span>HRANK STUDIO / MỘT KHỞI ĐẦU MỚI</span></div>
      <div className="intro-body">
        <div className="intro-motif"><GrowthIllustration variant="intro" /></div>
        <p className="eyebrow">{introduction.eyebrow}</p>
        <h2 id="welcome-title">
          <TypedText text={introduction.question} running={!reducedMotion} immediate={reducedMotion} speed={introduction.timing.characterMs} onComplete={finishQuestion} />
          <span className="intro-accent"><TypedText text={introduction.accent} running={questionComplete && !reducedMotion} immediate={reducedMotion} speed={introduction.timing.characterMs} onComplete={finishTyping} /></span>
        </h2>
        <p id="welcome-answer" className="intro-answer">{introduction.answer}</p>
      </div>
      <div className="intro-bottom"><span>{introduction.signature}</span><button type="button" onClick={dismiss}>Khám phá HRank <Icon name="right" size={18} /></button></div>
      <div className="intro-progress" aria-hidden="true"><span /></div>
    </dialog>
  );
}

export function HeroStories({ stories, ready }: { stories: Stories; ready: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const playing = ready && !paused && !hovered && !focused && !reducedMotion && inView && pageVisible;
  const story = stories[index];

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .2 });
    if (cardRef.current) observer.observe(cardRef.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % stories.length), 8500);
    return () => clearInterval(timer);
  }, [playing, stories.length, index]);

  function selectStory(next: number) {
    setIndex((next + stories.length) % stories.length);
    setPaused(true);
  }

  return (
    <div
      ref={cardRef}
      className="hero-card storytelling-card"
      role="region"
      aria-roledescription="carousel"
      aria-label="Giải pháp HRank dành cho doanh nghiệp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <div className="story-topline"><span className="story-kicker"><span className="live-dot" /> HRANK CÙNG BẠN GIẢI QUYẾT</span><span className="story-counter">0{index + 1} <span>/ 0{stories.length}</span></span></div>
      <div className="story-content" key={story.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} / ${stories.length}: ${story.label}`}>
        <div className="story-service"><Icon name={story.icon} size={15} />{story.label}</div>
        <h1>
          <TypedText text={story.headline} running={playing} immediate={reducedMotion || paused} />
          <span className="story-accent"><TypedText text={story.accent} running={playing} immediate={reducedMotion || paused} delay={750} /></span>
        </h1>
        <p className="story-description">{story.description}</p>
      </div>
      <div className="hero-actions"><a id="hero-primary-action" className="button button-primary" href="#impact">Xem điều gì thay đổi<Icon name="arrow" size={17} /></a><a className="text-link" href="#services">{story.label}<Icon name="right" size={16} /></a></div>
      <div className="story-controls"><div className="story-pagination" role="group" aria-label="Chọn nội dung giải pháp">{stories.map((item, position) => <button key={item.id} type="button" aria-label={`Xem ${item.label}`} aria-pressed={index === position} onClick={() => selectStory(position)}><span className={index === position ? "story-dot active" : "story-dot"} /></button>)}</div><span className="story-control-label">{paused || reducedMotion ? "Khám phá theo cách của bạn" : "Từng giải pháp, một lời giải"}</span><div className="story-navigation"><button type="button" onClick={() => selectStory(index - 1)} aria-label="Giải pháp trước"><Icon name="right" size={14} /></button><button type="button" aria-label={paused ? "Tiếp tục chuyển giải pháp tự động" : "Tạm dừng chuyển giải pháp tự động"} aria-pressed={paused} disabled={reducedMotion} onClick={() => setPaused(!paused)}>{paused ? <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="m7 4 9 6-9 6V4Z" fill="currentColor" /></svg> : <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M7 5v10M13 5v10" stroke="currentColor" strokeWidth="2" /></svg>}</button><button type="button" onClick={() => selectStory(index + 1)} aria-label="Giải pháp tiếp theo"><Icon name="right" size={14} /></button></div></div>
      <div className="story-progress" key={`progress-${story.id}`} data-playing={playing} aria-hidden="true"><span /></div>
    </div>
  );
}
