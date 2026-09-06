'use client';

import './styles.css';
import type * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eraser,
  Home,
  Info,
  Languages,
  Moon,
  Music,
  RefreshCw,
  Settings,
  Star,
  Target,
  Trash2,
  Trophy,
  User,
  Volume2,
  XCircle,
} from 'lucide-react';
import { feedbackAudio, mainMusic, type FeedbackAudioKind } from './audio-config';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TABLES = Array.from({ length: 10 }, (_, index) => index + 1);
const STORAGE_KEY = 'samimath-progress-v1';
const AVATAR = '/assets/samira-avatar.png';
const APP_VERSION = '1.0.0';
const MAIN_MUSIC_VOLUME = 0.2;

type Language = 'da' | 'en' | 'ru';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'da', label: 'Dansk' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

const TEXT = {
  da: {
    learnEasy: 'Det er let at lære',
    withSamira: 'sammen med Samira!',
    loading: 'Indlæser...',
    hello: 'Hej,',
    samiraHeart: 'Samira! 💜',
    today: 'Hvad skal vi lave i dag?',
    learn: 'Lær',
    multiplicationTable: 'gangetabellen',
    train: 'Træn',
    withChoices: 'med svarmuligheder',
    test: 'Test dig selv',
    noHelp: 'uden hjælp',
    achievements: 'Mine fremskridt',
    yourAchievements: 'dine stjerner',
    home: 'Hjem',
    settings: 'Indstillinger',
    back: 'Tilbage',
    navLabel: 'Hovednavigation',
    of: 'ud af',
    starsAria: 'stjerner',
    chooseTable: 'Vælg tabel',
    youCan: 'Du kan godt!',
    believe: 'Jeg tror på dig! 💜',
    tableTitle: 'Gangetabellen',
    tableOn: 'med',
    trainNow: 'Træn nu',
    nextQuestion: 'Næste spørgsmål',
    wellDone: 'Godt klaret!',
    tryAgain: 'Prøv igen!',
    remember: 'Husk svaret!',
    enterAnswer: 'Skriv svar',
    correctAnswers: 'Rigtige svar',
    mistakes: 'Fejl',
    time: 'Tid',
    retry: 'Prøv igen',
    backHome: 'Til hjem',
    profile: 'Min profil',
    littleStar: 'Lille stjerne 💜',
    stars: 'stjerner',
    tables: 'tabeller',
    correct: 'rigtige',
    smartKids: '“Kloge børn skaber en stor verden!” 💜',
    everythingWorks: 'Det skal nok lykkes! ⭐',
    sound: 'Lyd',
    music: 'Musik',
    darkTheme: 'Mørkt tema',
    language: 'Sprog',
    chooseLanguage: 'Vælg sprog',
    resetProgress: 'Nulstil fremskridt',
    about: 'Om appen',
    resetTitle: 'Vil du nulstille alle fremskridt?',
    resetDescription: 'Stjerner, forsøg og resultater starter forfra.',
    cancel: 'Annuller',
    reset: 'Nulstil',
    madeWithLove: 'Lavet med kærlighed til Samira af hendes far Adam.',
    version: 'Version',
    learned: 'Lært!',
    good: 'Godt',
    learning: 'Jeg lærer',
    notYet: 'Ikke lært endnu',
    perfect: 'Fantastisk! Du kan tabellen! 🌟',
    excellent: 'Du klarede det supergodt! 💜',
    almost: 'Meget godt! Lidt mere øvelse!',
    keepTrying: 'Giv ikke op! Lad os prøve igen! 💪',
    speech: (a: number, b: number, answer: number) =>
      `${spokenNumber('da', a)} gange ${spokenNumber('da', b)} er ${spokenNumber('da', answer)}`,
    speechLang: 'da-DK',
  },
  en: {
    learnEasy: 'Learning is easy',
    withSamira: 'together with Samira!',
    loading: 'Loading...',
    hello: 'Hi,',
    samiraHeart: 'Samira! 💜',
    today: 'What shall we do today?',
    learn: 'Learn',
    multiplicationTable: 'multiplication table',
    train: 'Practice',
    withChoices: 'with answer choices',
    test: 'Test yourself',
    noHelp: 'without hints',
    achievements: 'My progress',
    yourAchievements: 'your achievements',
    home: 'Home',
    settings: 'Settings',
    back: 'Back',
    navLabel: 'Main navigation',
    of: 'out of',
    starsAria: 'stars',
    chooseTable: 'Choose a table',
    youCan: 'You can do it!',
    believe: 'I believe in you! 💜',
    tableTitle: 'Multiplication table',
    tableOn: 'for',
    trainNow: 'Practice now',
    nextQuestion: 'Next question',
    wellDone: 'Well done!',
    tryAgain: 'Try again!',
    remember: 'Remember the answer!',
    enterAnswer: 'Enter answer',
    correctAnswers: 'Correct answers',
    mistakes: 'Mistakes',
    time: 'Time',
    retry: 'Try again',
    backHome: 'Home',
    profile: 'My profile',
    littleStar: 'Little star 💜',
    stars: 'stars',
    tables: 'tables',
    correct: 'correct',
    smartKids: '“Smart children make a big world!” 💜',
    everythingWorks: 'You can do it! ⭐',
    sound: 'Sound',
    music: 'Music',
    darkTheme: 'Dark theme',
    language: 'Language',
    chooseLanguage: 'Choose language',
    resetProgress: 'Reset progress',
    about: 'About',
    resetTitle: 'Reset all progress?',
    resetDescription: 'Stars, attempts, and table results will start over.',
    cancel: 'Cancel',
    reset: 'Reset',
    madeWithLove: 'Made with love for Samira by her father Adam.',
    version: 'Version',
    learned: 'Learned!',
    good: 'Good',
    learning: 'Learning',
    notYet: 'Not learned yet',
    perfect: 'Amazing! You know this table! 🌟',
    excellent: 'You did wonderfully! 💜',
    almost: 'Very good! A little more practice!',
    keepTrying: "Don't give up! Let's try again! 💪",
    speech: (a: number, b: number, answer: number) =>
      `${spokenNumber('en', a)} times ${spokenNumber('en', b)} equals ${spokenNumber('en', answer)}`,
    speechLang: 'en-US',
  },
  ru: {
    learnEasy: 'Учиться легко',
    withSamira: 'вместе с Самирой!',
    loading: 'Загрузка...',
    hello: 'Привет,',
    samiraHeart: 'Самира! 💜',
    today: 'Что будем делать сегодня?',
    learn: 'Учить',
    multiplicationTable: 'таблицу умножения',
    train: 'Тренироваться',
    withChoices: 'с вариантами ответов',
    test: 'Проверить себя',
    noHelp: 'без подсказок',
    achievements: 'Мои успехи',
    yourAchievements: 'твои достижения',
    home: 'Главная',
    settings: 'Настройки',
    back: 'Назад',
    navLabel: 'Главная навигация',
    of: 'из',
    starsAria: 'звезды',
    chooseTable: 'Выбери таблицу',
    youCan: 'Ты сможешь!',
    believe: 'Я в тебя верю! 💜',
    tableTitle: 'Таблица умножения',
    tableOn: 'на',
    trainNow: 'Потренироваться',
    nextQuestion: 'Следующий вопрос',
    wellDone: 'Молодец!',
    tryAgain: 'Попробуй ещё раз!',
    remember: 'Запомни ответ!',
    enterAnswer: 'Введите ответ',
    correctAnswers: 'Правильных ответов',
    mistakes: 'Ошибок',
    time: 'Время',
    retry: 'Попробовать ещё раз',
    backHome: 'На главную',
    profile: 'Мой профиль',
    littleStar: 'Маленькая звёздочка 💜',
    stars: 'звёзд',
    tables: 'таблиц',
    correct: 'правильных',
    smartKids: '«Умные дети делают большой мир!» 💜',
    everythingWorks: 'Всё получится! ⭐',
    sound: 'Звук',
    music: 'Музыка',
    darkTheme: 'Тёмная тема',
    language: 'Язык',
    chooseLanguage: 'Выбери язык',
    resetProgress: 'Сбросить прогресс',
    about: 'О приложении',
    resetTitle: 'Точно сбросить весь прогресс?',
    resetDescription: 'Звёзды, попытки и результаты по таблицам начнутся заново.',
    cancel: 'Отмена',
    reset: 'Сбросить',
    madeWithLove: 'Создано с любовью для Самиры от её отца Адама.',
    version: 'Версия',
    learned: 'Выучено!',
    good: 'Хорошо',
    learning: 'Учусь',
    notYet: 'Ещё не изучено',
    perfect: 'Невероятно! Ты знаешь эту таблицу! 🌟',
    excellent: 'Ты отлично справилась! 💜',
    almost: 'Очень хорошо! Ещё немного практики!',
    keepTrying: 'Не сдавайся! Давай попробуем ещё раз! 💪',
    speech: (a: number, b: number, answer: number) =>
      `${spokenNumber('ru', a)} умножить на ${spokenNumber('ru', b)} равно ${spokenNumber('ru', answer)}`,
    speechLang: 'ru-RU',
  },
} as const;

type Copy = (typeof TEXT)[Language];

type FeedbackKind = FeedbackAudioKind;

const FEEDBACK_FALLBACK: Record<Language, Record<FeedbackKind, string>> = {
  da: {
    correct: 'Flot klaret. Det var helt rigtigt. Du gør det rigtig godt.',
    wrong: 'Det var et godt forsøg. Prøv en gang til. Jeg ved, du kan.',
    streak3: 'Imponerende. Tre rigtige i træk.',
    streak6: 'Suverænt. Seks rigtige i træk. Du er virkelig skarp.',
    perfect10: 'Enestående. Ti ud af ti. Det var helt fantastisk, Samira.',
  },
  en: {
    correct: 'Well done. That was exactly right. You are doing very well.',
    wrong: 'That was a good try. Try one more time. I know you can do it.',
    streak3: 'Impressive. Three correct in a row.',
    streak6: 'Excellent. Six correct in a row. You are really sharp.',
    perfect10: 'Outstanding. Ten out of ten. That was fantastic, Samira.',
  },
  ru: {
    correct: 'Отлично. Это правильный ответ. У тебя очень хорошо получается.',
    wrong: 'Это была хорошая попытка. Попробуй ещё раз. Я знаю, ты сможешь.',
    streak3: 'Впечатляет. Три правильных ответа подряд.',
    streak6: 'Супер. Шесть правильных ответов подряд. Ты очень внимательная.',
    perfect10: 'Невероятно. Десять из десяти. Это было фантастически, Самира.',
  },
};

let activeFeedbackAudio: HTMLAudioElement | null = null;
let activeMainMusic: HTMLAudioElement | null = null;

function getMainMusicAudio() {
  if (!mainMusic.trim()) return null;
  if (!activeMainMusic) {
    activeMainMusic = new Audio(mainMusic);
    activeMainMusic.loop = true;
  }
  activeMainMusic.volume = MAIN_MUSIC_VOLUME;
  return activeMainMusic;
}

async function playMainMusic() {
  const audio = getMainMusicAudio();
  if (!audio) return false;

  try {
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

function pauseMainMusic() {
  activeMainMusic?.pause();
}

function stopFeedbackAudio() {
  window.speechSynthesis?.cancel();
  if (!activeFeedbackAudio) return;
  activeFeedbackAudio.pause();
  activeFeedbackAudio.currentTime = 0;
  activeFeedbackAudio = null;
}

function spokenNumber(language: Language, value: number) {
  if (language === 'en') return englishNumber(value);
  if (language === 'ru') return russianNumber(value);
  return danishNumber(value);
}

function danishNumber(value: number) {
  const small: Record<number, string> = {
    0: 'nul',
    1: 'en',
    2: 'to',
    3: 'tre',
    4: 'fire',
    5: 'fem',
    6: 'seks',
    7: 'syv',
    8: 'otte',
    9: 'ni',
    10: 'ti',
    11: 'elleve',
    12: 'tolv',
    13: 'tretten',
    14: 'fjorten',
    15: 'femten',
    16: 'seksten',
    17: 'sytten',
    18: 'atten',
    19: 'nitten',
  };
  const tens: Record<number, string> = {
    20: 'tyve',
    30: 'tredive',
    40: 'fyrre',
    50: 'halvtreds',
    60: 'tres',
    70: 'halvfjerds',
    80: 'firs',
    90: 'halvfems',
  };
  if (value in small) return small[value];
  if (value === 100) return 'hundrede';
  const ones = value % 10;
  const ten = value - ones;
  return ones ? `${small[ones]}og${tens[ten]}` : tens[ten];
}

function englishNumber(value: number) {
  const small: Record<number, string> = {
    0: 'zero',
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    10: 'ten',
    11: 'eleven',
    12: 'twelve',
    13: 'thirteen',
    14: 'fourteen',
    15: 'fifteen',
    16: 'sixteen',
    17: 'seventeen',
    18: 'eighteen',
    19: 'nineteen',
  };
  const tens: Record<number, string> = {
    20: 'twenty',
    30: 'thirty',
    40: 'forty',
    50: 'fifty',
    60: 'sixty',
    70: 'seventy',
    80: 'eighty',
    90: 'ninety',
  };
  if (value in small) return small[value];
  if (value === 100) return 'one hundred';
  const ones = value % 10;
  const ten = value - ones;
  return ones ? `${tens[ten]} ${small[ones]}` : tens[ten];
}

function russianNumber(value: number) {
  const small: Record<number, string> = {
    0: 'ноль',
    1: 'один',
    2: 'два',
    3: 'три',
    4: 'четыре',
    5: 'пять',
    6: 'шесть',
    7: 'семь',
    8: 'восемь',
    9: 'девять',
    10: 'десять',
    11: 'одиннадцать',
    12: 'двенадцать',
    13: 'тринадцать',
    14: 'четырнадцать',
    15: 'пятнадцать',
    16: 'шестнадцать',
    17: 'семнадцать',
    18: 'восемнадцать',
    19: 'девятнадцать',
  };
  const tens: Record<number, string> = {
    20: 'двадцать',
    30: 'тридцать',
    40: 'сорок',
    50: 'пятьдесят',
    60: 'шестьдесят',
    70: 'семьдесят',
    80: 'восемьдесят',
    90: 'девяносто',
  };
  if (value in small) return small[value];
  if (value === 100) return 'сто';
  const ones = value % 10;
  const ten = value - ones;
  return ones ? `${tens[ten]} ${small[ones]}` : tens[ten];
}

function playFallbackFeedback(kind: FeedbackKind, language: Language) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const copy = TEXT[language];
  const utterance = new SpeechSynthesisUtterance(FEEDBACK_FALLBACK[language][kind]);
  utterance.lang = copy.speechLang;
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function playFeedback(kind: FeedbackKind, settings: SettingsState) {
  if (!settings.sound) return;

  const url = feedbackAudio[kind].trim();
  if (!url) {
    playFallbackFeedback(kind, settings.language);
    return;
  }

  window.speechSynthesis?.cancel();
  activeFeedbackAudio?.pause();
  activeFeedbackAudio = null;
  const audio = new Audio(url);
  activeFeedbackAudio = audio;
  audio.addEventListener('ended', () => {
    if (activeFeedbackAudio === audio) activeFeedbackAudio = null;
  });
  audio.play().catch(() => {
    if (activeFeedbackAudio === audio) activeFeedbackAudio = null;
    playFallbackFeedback(kind, settings.language);
  });
}

type Screen =
  | 'splash'
  | 'home'
  | 'learn-select'
  | 'learn-table'
  | 'train-select'
  | 'train'
  | 'test'
  | 'result'
  | 'achievements'
  | 'profile'
  | 'settings';

type Mode = 'train' | 'test';

type TableProgress = {
  bestPercent: number;
  stars: number;
  attempts: number;
  correct: number;
  wrong: number;
};

type SettingsState = {
  sound: boolean;
  music: boolean;
  dark: boolean;
  language: Language;
};

type SavedState = {
  tables: Record<number, TableProgress>;
  settings: SettingsState;
  session: AppSession | null;
};

type Question = {
  id: string;
  a: number;
  b: number;
  answer: number;
  choices: number[];
};

type AnswerRecord = {
  question: Question;
  correct: boolean;
  firstTry?: boolean;
  value: number | null;
};

function getCorrectStreak(records: AnswerRecord[]) {
  let streak = 0;
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const record = records[index];
    if (!record.correct || record.firstTry === false) break;
    streak += 1;
  }
  return streak;
}

function correctFeedbackFor(records: AnswerRecord[]): FeedbackKind {
  const streak = getCorrectStreak(records);
  if (streak === 6) return 'streak6';
  if (streak === 3) return 'streak3';
  return 'correct';
}

type ResultState = {
  mode: Mode;
  table: number | null;
  score: number;
  total: number;
  wrong: number;
  timeSeconds: number;
  answers: AnswerRecord[];
};

type AppSession = {
  screen: Exclude<Screen, 'splash'>;
  selectedTable: number;
  questions: Question[];
  answers: AnswerRecord[];
  index: number;
  feedback: 'correct' | 'wrong' | 'revealed' | null;
  activeMode: Mode;
  wrongTries: number;
  testValue: string;
  startedAt: number;
  result: ResultState | null;
};

const defaultTableProgress = (): TableProgress => ({
  bestPercent: 0,
  stars: 0,
  attempts: 0,
  correct: 0,
  wrong: 0,
});

const defaultState = (): SavedState => ({
  tables: Object.fromEntries(
    TABLES.map((table) => [table, defaultTableProgress()]),
  ) as Record<number, TableProgress>,
  settings: { sound: true, music: true, dark: false, language: 'da' },
  session: null,
});

const RESTORABLE_SCREENS: AppSession['screen'][] = [
  'home',
  'learn-select',
  'learn-table',
  'train-select',
  'train',
  'test',
  'result',
  'achievements',
  'profile',
  'settings',
];

function clampProgress(input: unknown): SavedState {
  const fresh = defaultState();
  if (!input || typeof input !== 'object') return fresh;

  const partial = input as Partial<SavedState>;
  const tables = { ...fresh.tables };
  for (const table of TABLES) {
    const item = partial.tables?.[table];
    if (item) {
      tables[table] = {
        bestPercent: Number(item.bestPercent) || 0,
        stars: Number(item.stars) || 0,
        attempts: Number(item.attempts) || 0,
        correct: Number(item.correct) || 0,
        wrong: Number(item.wrong) || 0,
      };
    }
  }

  const session =
    partial.session &&
    RESTORABLE_SCREENS.includes(partial.session.screen as AppSession['screen'])
      ? {
          screen: partial.session.screen as AppSession['screen'],
          selectedTable: TABLES.includes(Number(partial.session.selectedTable))
            ? Number(partial.session.selectedTable)
            : 4,
          questions: Array.isArray(partial.session.questions)
            ? partial.session.questions
            : [],
          answers: Array.isArray(partial.session.answers)
            ? partial.session.answers
            : [],
          index: Math.max(0, Number(partial.session.index) || 0),
          feedback:
            partial.session.feedback === 'correct' ||
            partial.session.feedback === 'wrong' ||
            partial.session.feedback === 'revealed'
              ? partial.session.feedback
              : null,
          activeMode: partial.session.activeMode === 'test' ? 'test' : 'train',
          wrongTries: Number(partial.session.wrongTries) || 0,
          testValue: String(partial.session.testValue ?? ''),
          startedAt: Number(partial.session.startedAt) || Date.now(),
          result: partial.session.result ?? null,
        }
      : null;

  return {
    tables,
    settings: {
      ...fresh.settings,
      ...(partial.settings ?? {}),
      language: LANGUAGES.some(
        (language) => language.code === partial.settings?.language,
      )
        ? partial.settings.language
        : fresh.settings.language,
    },
    session,
  };
}

function starsFromPercent(percent: number) {
  if (percent >= 90) return 3;
  if (percent >= 70) return 2;
  if (percent >= 50) return 1;
  return 0;
}

function statusFromStars(stars: number, copy: Copy) {
  if (stars === 3) return copy.learned;
  if (stars === 2) return copy.good;
  if (stars === 1) return copy.learning;
  return copy.notYet;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeChoices(answer: number, a: number, b: number) {
  const nearby = [
    answer - a,
    answer + a,
    answer - b,
    answer + b,
    answer - 2,
    answer + 2,
    answer - 5,
    answer + 5,
    answer + 10,
  ].filter((value) => value > 0 && value !== answer);

  const choices = new Set<number>([answer]);
  for (const value of shuffle(nearby)) {
    choices.add(value);
    if (choices.size === 4) break;
  }
  while (choices.size < 4) choices.add(Math.max(1, answer + choices.size * 3));
  return shuffle([...choices]);
}

function makeQuestions(mode: Mode, table: number | null) {
  const pairs =
    mode === 'train' && table
      ? TABLES.map((b) => [table, b])
      : shuffle(
          TABLES.flatMap((a) => TABLES.map((b) => [a, b] as [number, number])),
        ).slice(0, 10);

  return shuffle(pairs).slice(0, 10).map(([a, b], index) => ({
    id: `${mode}-${a}-${b}-${index}-${Date.now()}`,
    a,
    b,
    answer: a * b,
    choices: makeChoices(a * b, a, b),
  }));
}

function messageForScore(score: number, total: number, copy: Copy) {
  const percent = Math.round((score / total) * 100);
  if (percent === 100) return copy.perfect;
  if (percent >= 80) return copy.excellent;
  if (percent >= 60) return copy.almost;
  return copy.keepTrying;
}

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedTable, setSelectedTable] = useState(4);
  const [saved, setSaved] = useState<SavedState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'revealed' | null>(
    null,
  );
  const [activeMode, setActiveMode] = useState<Mode>('train');
  const [wrongTries, setWrongTries] = useState(0);
  const [testValue, setTestValue] = useState('');
  const [startedAt, setStartedAt] = useState(Date.now());
  const [result, setResult] = useState<ResultState | null>(null);
  const copy = TEXT[saved.settings.language];
  const currentSession = useMemo<AppSession | null>(() => {
    if (screen === 'splash') return null;
    return {
      screen,
      selectedTable,
      questions,
      answers,
      index,
      feedback,
      activeMode,
      wrongTries,
      testValue,
      startedAt,
      result,
    };
  }, [
    activeMode,
    answers,
    feedback,
    index,
    questions,
    result,
    screen,
    selectedTable,
    startedAt,
    testValue,
    wrongTries,
  ]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const nextSaved = clampProgress(JSON.parse(raw));
        setSaved(nextSaved);

        const session = nextSaved.session;
        if (session) {
          const restoredQuestions = session.questions.slice(0, 10);
          const restoredIndex = Math.min(
            session.index,
            Math.max(0, restoredQuestions.length - 1),
          );
          let restoredScreen: Screen = session.screen;

          if (
            (session.screen === 'train' || session.screen === 'test') &&
            !restoredQuestions.length
          ) {
            restoredScreen = session.screen === 'train' ? 'train-select' : 'home';
          }
          if (session.screen === 'result' && !session.result) restoredScreen = 'home';

          setSelectedTable(session.selectedTable);
          setQuestions(restoredQuestions);
          setAnswers(session.answers);
          setIndex(restoredIndex);
          setFeedback(session.feedback);
          setActiveMode(session.activeMode);
          setWrongTries(session.wrongTries);
          setTestValue(session.testValue);
          setStartedAt(session.startedAt);
          setResult(session.result);
          setScreen(restoredScreen);
        }
      }
    } catch {
      setSaved(defaultState());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...saved, session: currentSession }),
    );
    document.documentElement.classList.toggle('dark', saved.settings.dark);
    document.documentElement.lang = saved.settings.language;
  }, [currentSession, hydrated, saved]);

  useEffect(() => {
    if (!hydrated) return;
    if (!saved.settings.music) {
      pauseMainMusic();
      return;
    }

    let cancelled = false;
    const resumeMusic = () => {
      playMainMusic().then((started) => {
        if (!cancelled && started) removeResumeListeners();
      });
    };
    const removeResumeListeners = () => {
      document.removeEventListener('click', resumeMusic);
      document.removeEventListener('keydown', resumeMusic);
      document.removeEventListener('pointerdown', resumeMusic);
      document.removeEventListener('touchstart', resumeMusic);
    };

    resumeMusic();
    document.addEventListener('click', resumeMusic);
    document.addEventListener('keydown', resumeMusic);
    document.addEventListener('pointerdown', resumeMusic);
    document.addEventListener('touchstart', resumeMusic, { passive: true });

    return () => {
      cancelled = true;
      removeResumeListeners();
    };
  }, [hydrated, saved.settings.music]);

  useEffect(() => {
    if (screen !== 'splash') return;
    const timer = window.setTimeout(() => setScreen('home'), 1700);
    return () => window.clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    const context =
      typeof document === 'undefined'
        ? undefined
        : (
            document as Document & {
              modelContext?: {
                registerTool?: (
                  tool: unknown,
                  options?: { signal?: AbortSignal },
                ) => void | Promise<void>;
              };
            }
          ).modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    const register = async () => {
      await context.registerTool?.(
        {
          name: 'start_samimath_training',
          title: 'Start SamiMath training',
          description:
            'Open a visible SamiMath training round for a multiplication table from 1 to 10.',
          inputSchema: {
            type: 'object',
            properties: {
              table: { type: 'number', minimum: 1, maximum: 10 },
            },
            required: ['table'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute: (input: unknown) => {
            const table =
              typeof input === 'object' && input && 'table' in input
                ? Number((input as { table: unknown }).table)
                : NaN;
            if (!Number.isInteger(table) || table < 1 || table > 10) {
              throw new Error('table must be a number from 1 to 10');
            }
            startQuiz('train', table);
            return { status: 'started', mode: 'train', table };
          },
        },
        { signal: lifecycle.signal },
      );
    };

    register().catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const totalStars = useMemo(
    () => TABLES.reduce((sum, table) => sum + saved.tables[table].stars, 0),
    [saved.tables],
  );
  const masteredTables = useMemo(
    () => TABLES.filter((table) => saved.tables[table].stars === 3).length,
    [saved.tables],
  );
  const accuracy = useMemo(() => {
    const correct = TABLES.reduce((sum, table) => sum + saved.tables[table].correct, 0);
    const wrong = TABLES.reduce((sum, table) => sum + saved.tables[table].wrong, 0);
    const total = correct + wrong;
    return total ? Math.round((correct / total) * 100) : 0;
  }, [saved.tables]);

  const currentQuestion = questions[index];

  const speak = useCallback(
    (question: Question) => {
      if (!saved.settings.sound || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        copy.speech(question.a, question.b, question.answer),
      );
      utterance.lang = copy.speechLang;
      window.speechSynthesis.speak(utterance);
    },
    [copy, saved.settings.sound],
  );

  const goBack = () => {
    stopFeedbackAudio();
    if (screen === 'learn-table') setScreen('learn-select');
    else if (screen === 'train') setScreen('train-select');
    else setScreen('home');
  };

  const startQuiz = (mode: Mode, table: number | null) => {
    stopFeedbackAudio();
    const nextQuestions = makeQuestions(mode, table);
    setActiveMode(mode);
    setQuestions(nextQuestions);
    setAnswers([]);
    setIndex(0);
    setFeedback(null);
    setWrongTries(0);
    setTestValue('');
    setStartedAt(Date.now());
    setResult(null);
    if (table) setSelectedTable(table);
    setScreen(mode === 'train' ? 'train' : 'test');
  };

  const saveResult = (nextResult: ResultState) => {
    setSaved((current) => {
      const next = { ...current, tables: { ...current.tables } };
      for (const table of TABLES) {
        const tableAnswers = nextResult.answers.filter(
          (answer) => answer.question.a === table,
        );
        if (!tableAnswers.length) continue;
        const correct = tableAnswers.filter((answer) => answer.correct).length;
        const wrong = tableAnswers.length - correct;
        const percent = Math.round((correct / tableAnswers.length) * 100);
        const previous = next.tables[table] ?? defaultTableProgress();
        const bestPercent = Math.max(previous.bestPercent, percent);
        next.tables[table] = {
          bestPercent,
          stars: starsFromPercent(bestPercent),
          attempts: previous.attempts + 1,
          correct: previous.correct + correct,
          wrong: previous.wrong + wrong,
        };
      }
      return next;
    });
  };

  const finishQuiz = (records: AnswerRecord[], mode: Mode, table: number | null) => {
    const score = records.filter((record) => record.correct).length;
    const nextResult: ResultState = {
      mode,
      table,
      score,
      total: records.length,
      wrong: records.length - score,
      timeSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      answers: records,
    };
    setResult(nextResult);
    saveResult(nextResult);
    setFeedback(null);
    setScreen('result');
    if (score === records.length && records.length === 10) {
      playFeedback('perfect10', saved.settings);
    }
  };

  const moveNext = (records = answers, stopAudio = true) => {
    if (stopAudio) stopFeedbackAudio();
    if (index >= questions.length - 1) {
      finishQuiz(records, activeMode, activeMode === 'train' ? selectedTable : null);
      return;
    }
    setIndex((current) => current + 1);
    setFeedback(null);
    setWrongTries(0);
    setTestValue('');
  };

  const recordTrainingAnswer = (correct: boolean, value: number) => {
    if (!currentQuestion) return;
    const nextRecords = [
      ...answers,
      {
        question: currentQuestion,
        correct,
        firstTry: correct && wrongTries === 0,
        value,
      },
    ];
    setAnswers(nextRecords);
    if (correct) {
      setFeedback('correct');
      playFeedback(correctFeedbackFor(nextRecords), saved.settings);
      return;
    }
    setFeedback('revealed');
    playFeedback('wrong', saved.settings);
  };

  const chooseAnswer = (choice: number) => {
    if (!currentQuestion || feedback === 'correct' || feedback === 'revealed') return;
    if (choice === currentQuestion.answer) {
      recordTrainingAnswer(true, choice);
      return;
    }
    if (wrongTries === 0) {
      setWrongTries(1);
      setFeedback('wrong');
      playFeedback('wrong', saved.settings);
      return;
    }
    recordTrainingAnswer(false, choice);
  };

  const submitTestAnswer = () => {
    if (!currentQuestion || !testValue) return;
    const numericValue = Number(testValue);
    const correct = numericValue === currentQuestion.answer;
    const nextRecords = [
      ...answers,
      {
        question: currentQuestion,
        correct,
        firstTry: correct,
        value: numericValue,
      },
    ];
    const finishedPerfectRound =
      index >= questions.length - 1 &&
      nextRecords.length === 10 &&
      nextRecords.every((record) => record.correct);

    if (!finishedPerfectRound) {
      playFeedback(correct ? correctFeedbackFor(nextRecords) : 'wrong', saved.settings);
    }
    setAnswers(nextRecords);
    if (index >= questions.length - 1) finishQuiz(nextRecords, 'test', null);
    else moveNext(nextRecords, false);
  };

  const resetProgress = () => {
    setSaved(defaultState());
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const retry = () => {
    if (!result) return;
    startQuiz(result.mode, result.mode === 'train' ? result.table : null);
  };

  const activeTab = screen === 'achievements' || screen === 'profile' ? 'achievements' : screen;

  return (
    <main className="samimath-root">
      <div className="phone-shell">
        <div className="samimath-app">
          <Decor />
          {screen !== 'splash' && screen !== 'home' && screen !== 'result' ? (
            <button className="round-back" type="button" onClick={goBack} aria-label={copy.back}>
              <ChevronLeft size={26} />
            </button>
          ) : null}

          {screen === 'splash' ? (
            <Splash copy={copy} />
          ) : screen === 'home' ? (
            <HomeScreen copy={copy} setScreen={setScreen} startQuiz={startQuiz} />
          ) : screen === 'learn-select' ? (
            <TableSelect
              copy={copy}
              title={copy.chooseTable}
              onPick={(table) => {
                setSelectedTable(table);
                setScreen('learn-table');
              }}
            />
          ) : screen === 'learn-table' ? (
            <LearnTable
              copy={copy}
              table={selectedTable}
              speak={speak}
              startQuiz={() => startQuiz('train', selectedTable)}
            />
          ) : screen === 'train-select' ? (
            <TableSelect copy={copy} title={copy.train} onPick={(table) => startQuiz('train', table)} />
          ) : screen === 'train' ? (
            <TrainingScreen
              copy={copy}
              question={currentQuestion}
              index={index}
              feedback={feedback}
              chooseAnswer={chooseAnswer}
              moveNext={() => moveNext()}
            />
          ) : screen === 'test' ? (
            <TestScreen
              copy={copy}
              question={currentQuestion}
              index={index}
              value={testValue}
              setValue={setTestValue}
              submit={submitTestAnswer}
            />
          ) : screen === 'result' && result ? (
            <ResultScreen copy={copy} result={result} retry={retry} home={() => setScreen('home')} />
          ) : screen === 'achievements' ? (
            <AchievementsScreen copy={copy} saved={saved} openProfile={() => setScreen('profile')} />
          ) : screen === 'profile' ? (
            <ProfileScreen
              copy={copy}
              totalStars={totalStars}
              masteredTables={masteredTables}
              accuracy={accuracy}
            />
          ) : (
            <SettingsScreen copy={copy} saved={saved} setSaved={setSaved} resetProgress={resetProgress} />
          )}

          {screen !== 'splash' && screen !== 'result' ? (
            <BottomNav copy={copy} active={activeTab} setScreen={setScreen} />
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Decor() {
  return (
    <>
      <span className="cloud cloud-a" />
      <span className="cloud cloud-b" />
      <span className="spark star-a">⭐</span>
      <span className="spark star-b">⭐</span>
      <span className="spark heart-a">💗</span>
      <span className="spark heart-b">💜</span>
      <div className="hills" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="flower flower-a">✿</span>
      <span className="flower flower-b">✿</span>
    </>
  );
}

function Splash({ copy }: { copy: Copy }) {
  return (
    <section className="screen splash-screen">
      <img className="splash-avatar" src={AVATAR} alt="Самира" />
      <h1 className="logo">
        <span>Sami</span>Math
      </h1>
      <p className="splash-title">
        {copy.learnEasy}
        <br />
        {copy.withSamira}
      </p>
      <div className="loading-track">
        <span />
      </div>
      <p className="soft-note">{copy.loading}</p>
    </section>
  );
}

function HomeScreen({
  copy,
  setScreen,
  startQuiz,
}: {
  copy: Copy;
  setScreen: (screen: Screen) => void;
  startQuiz: (mode: Mode, table: number | null) => void;
}) {
  const actions = [
    {
      title: copy.learn,
      subtitle: copy.multiplicationTable,
      icon: <BookOpen size={44} />,
      className: 'green',
      action: () => setScreen('learn-select'),
    },
    {
      title: copy.train,
      subtitle: copy.withChoices,
      icon: <Target size={44} />,
      className: 'blue',
      action: () => setScreen('train-select'),
    },
    {
      title: copy.test,
      subtitle: copy.noHelp,
      icon: <Trophy size={44} />,
      className: 'orange',
      action: () => startQuiz('test', null),
    },
    {
      title: copy.achievements,
      subtitle: copy.yourAchievements,
      icon: <Star size={44} />,
      className: 'pink',
      action: () => setScreen('achievements'),
    },
  ];

  return (
    <section className="screen home-screen">
      <div className="hello">
        <img src={AVATAR} alt="Самира" />
        <div>
          <h2>
            {copy.hello}
            <br />
            {copy.samiraHeart}
          </h2>
          <p>{copy.today}</p>
        </div>
      </div>
      <div className="action-list">
        {actions.map((item) => (
          <button
            className={`big-action ${item.className}`}
            key={item.title}
            type="button"
            onClick={item.action}
          >
            <span className="action-icon">{item.icon}</span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
            </span>
            <ChevronRight size={28} />
          </button>
        ))}
      </div>
    </section>
  );
}

function TableSelect({
  copy,
  title,
  onPick,
}: {
  copy: Copy;
  title: string;
  onPick: (table: number) => void;
}) {
  const colors = ['pink', 'yellow', 'cyan', 'green', 'purple', 'orange'];
  return (
    <section className="screen with-title">
      <h2>{title}</h2>
      <div className="table-grid">
        {TABLES.map((table, index) => (
          <button
            type="button"
            className={`table-tile ${colors[index % colors.length]}`}
            key={table}
            onClick={() => onPick(table)}
          >
            ×{table}
          </button>
        ))}
      </div>
      <div className="mentor-row">
        <img src={AVATAR} alt="Самира" />
        <p>
          {copy.youCan}
          <br />
          {copy.believe}
        </p>
      </div>
    </section>
  );
}

function LearnTable({
  copy,
  table,
  speak,
  startQuiz,
}: {
  copy: Copy;
  table: number;
  speak: (question: Question) => void;
  startQuiz: () => void;
}) {
  return (
    <section className="screen with-title learn-screen">
      <h2>
        {copy.tableTitle}
        <br />
        <strong>{copy.tableOn} {table}</strong>
      </h2>
      <div className="learn-list">
        {TABLES.map((b) => {
          const question = {
            id: `learn-${table}-${b}`,
            a: table,
            b,
            answer: table * b,
            choices: [],
          };
          return (
            <div className="learn-row" key={b}>
              <span>
                {table} × {b}
              </span>
              <b>=</b>
              <strong>{table * b}</strong>
              <button type="button" onClick={() => speak(question)} aria-label={copy.sound}>
                <Volume2 size={22} />
              </button>
            </div>
          );
        })}
      </div>
      <button className="primary-cta" type="button" onClick={startQuiz}>
        {copy.trainNow}
      </button>
    </section>
  );
}

function TrainingScreen({
  copy,
  question,
  index,
  feedback,
  chooseAnswer,
  moveNext,
}: {
  copy: Copy;
  question?: Question;
  index: number;
  feedback: 'correct' | 'wrong' | 'revealed' | null;
  chooseAnswer: (choice: number) => void;
  moveNext: () => void;
}) {
  if (!question) return null;
  const answered = feedback === 'correct' || feedback === 'revealed';

  return (
    <section className="screen quiz-screen">
      <QuizHeader title={copy.train} index={index} />
      <div className="question-card">
        {question.a} × {question.b} = ?
      </div>
      <div className="choice-grid">
        {question.choices.map((choice) => (
          <button
            type="button"
            key={choice}
            className={
              answered && choice === question.answer
                ? 'choice correct-choice'
                : 'choice'
            }
            onClick={() => chooseAnswer(choice)}
            disabled={answered}
          >
            {choice}
          </button>
        ))}
      </div>
      {feedback ? (
        <div className={`feedback ${feedback}`}>
          {feedback === 'correct' ? (
            <CheckCircle2 size={48} />
          ) : feedback === 'wrong' ? (
            <XCircle size={48} />
          ) : (
            <Info size={48} />
          )}
          <strong>
            {feedback === 'correct'
              ? copy.wellDone
              : feedback === 'wrong'
                ? copy.tryAgain
                : copy.remember}
          </strong>
          {feedback !== 'wrong' ? (
            <span>
              {question.a} × {question.b} = {question.answer}
            </span>
          ) : null}
        </div>
      ) : null}
      {answered ? (
        <button className="primary-cta" type="button" onClick={moveNext}>
          {copy.nextQuestion}
        </button>
      ) : null}
    </section>
  );
}

function TestScreen({
  copy,
  question,
  index,
  value,
  setValue,
  submit,
}: {
  copy: Copy;
  question?: Question;
  index: number;
  value: string;
  setValue: (value: string) => void;
  submit: () => void;
}) {
  if (!question) return null;
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'ok'];

  return (
    <section className="screen quiz-screen">
      <QuizHeader title={copy.test} index={index} />
      <div className="question-card">
        {question.a} × {question.b} = ?
      </div>
      <div className="answer-input">{value || copy.enterAnswer}</div>
      <div className="keypad">
        {keys.map((key) => (
          <button
            type="button"
            key={key}
            className={key === 'ok' ? 'ok-key' : ''}
            onClick={() => {
              if (key === 'back') setValue(value.slice(0, -1));
              else if (key === 'ok') submit();
              else if (value.length < 3) setValue(value + key);
            }}
          >
            {key === 'back' ? <Eraser size={28} /> : key === 'ok' ? 'OK' : key}
          </button>
        ))}
      </div>
    </section>
  );
}

function QuizHeader({ title, index }: { title: string; index: number }) {
  return (
    <header className="quiz-header">
      <h2>{title}</h2>
      <div className="progress-line">
        <span>
          <i style={{ width: `${((index + 1) / 10) * 100}%` }} />
        </span>
        <strong>{index + 1} / 10</strong>
      </div>
    </header>
  );
}

function ResultScreen({
  copy,
  result,
  retry,
  home,
}: {
  copy: Copy;
  result: ResultState;
  retry: () => void;
  home: () => void;
}) {
  const highScore = result.score >= 8;
  return (
    <section className={`screen result-screen ${highScore ? 'celebrate' : ''}`}>
      <span className="confetti">✦ ✿ ★ ✦ ★ ✿</span>
      <Trophy className="cup" size={72} />
      <h2>
        {result.score} {copy.of} {result.total}
      </h2>
      <div className="result-list">
        <p>
          <CheckCircle2 size={30} />
          {copy.correctAnswers} <strong>{result.score}</strong>
        </p>
        <p>
          <XCircle size={30} />
          {copy.mistakes} <strong>{result.wrong}</strong>
        </p>
        <p>
          <Clock size={30} />
          {copy.time} <strong>{formatTime(result.timeSeconds)}</strong>
        </p>
      </div>
      <div className="result-mentor">
        <img src={AVATAR} alt="Самира" />
        <p>{messageForScore(result.score, result.total, copy)}</p>
      </div>
      <button className="primary-cta" type="button" onClick={retry}>
        <RefreshCw size={20} />
        {copy.retry}
      </button>
      <button className="ghost-cta" type="button" onClick={home}>
        {copy.backHome}
      </button>
    </section>
  );
}

function AchievementsScreen({
  copy,
  saved,
  openProfile,
}: {
  copy: Copy;
  saved: SavedState;
  openProfile: () => void;
}) {
  return (
    <section className="screen with-title achievements-screen">
      <h2>{copy.achievements}</h2>
      <button className="profile-link" type="button" onClick={openProfile}>
        <User size={22} />
        {copy.profile}
        <ChevronRight size={22} />
      </button>
      <div className="achievement-list">
        {TABLES.map((table) => {
          const progress = saved.tables[table];
          return (
            <div className="achievement-row" key={table}>
              <b>×{table}</b>
              <span aria-label={`${progress.stars} ${copy.starsAria}`}>
                {'★'.repeat(progress.stars)}
                {'☆'.repeat(3 - progress.stars)}
              </span>
              <em className={`status status-${progress.stars}`}>
                {statusFromStars(progress.stars, copy)}
              </em>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProfileScreen({
  copy,
  totalStars,
  masteredTables,
  accuracy,
}: {
  copy: Copy;
  totalStars: number;
  masteredTables: number;
  accuracy: number;
}) {
  return (
    <section className="screen with-title profile-screen">
      <h2>{copy.profile}</h2>
      <div className="profile-card">
        <div className="avatar-ring">
          <span>👑</span>
          <img src={AVATAR} alt="Самира" />
        </div>
        <h3>Самира</h3>
        <p>{copy.littleStar}</p>
      </div>
      <div className="stats-grid">
        <div>
          <Star size={34} />
          <strong>{totalStars}</strong>
          <span>{copy.stars}</span>
        </div>
        <div>
          <Trophy size={34} />
          <strong>{masteredTables}</strong>
          <span>{copy.tables}</span>
        </div>
        <div>
          <Target size={34} />
          <strong>{accuracy}%</strong>
          <span>{copy.correct}</span>
        </div>
      </div>
      <blockquote>{copy.smartKids}</blockquote>
      <div className="small-mentor">
        <img src={AVATAR} alt="" />
        <span>{copy.everythingWorks}</span>
      </div>
    </section>
  );
}

function SettingsScreen({
  copy,
  saved,
  setSaved,
  resetProgress,
}: {
  copy: Copy;
  saved: SavedState;
  setSaved: React.Dispatch<React.SetStateAction<SavedState>>;
  resetProgress: () => void;
}) {
  const [languageOpen, setLanguageOpen] = useState(false);

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => {
    setSaved((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
    }));
  };

  return (
    <section className="screen with-title settings-screen">
      <h2>{copy.settings}</h2>
      <div className="setting-list">
        <SettingRow
          icon={<Volume2 />}
          label={copy.sound}
          checked={saved.settings.sound}
          onCheckedChange={(value) => updateSetting('sound', value)}
        />
        <SettingRow
          icon={<Music />}
          label={copy.music}
          checked={saved.settings.music}
          onCheckedChange={(value) => updateSetting('music', value)}
        />
        <SettingRow
          icon={<Moon />}
          label={copy.darkTheme}
          checked={saved.settings.dark}
          onCheckedChange={(value) => updateSetting('dark', value)}
        />
        <LanguagePicker
          label={copy.language}
          title={copy.chooseLanguage}
          value={saved.settings.language}
          open={languageOpen}
          setOpen={setLanguageOpen}
          onChange={(value) => {
            updateSetting('language', value);
            setLanguageOpen(false);
          }}
        />
      </div>

      <div className="setting-list">
        <AlertDialog>
          <AlertDialogTrigger className="plain-row danger">
            <Trash2 size={25} />
            <span>{copy.resetProgress}</span>
            <ChevronRight size={22} />
          </AlertDialogTrigger>
          <AlertDialogContent className="samimath-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>{copy.resetTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {copy.resetDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={resetProgress}>{copy.reset}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="plain-row">
          <Info size={25} />
          <span>{copy.about}</span>
          <ChevronRight size={22} />
        </div>
      </div>

      <div className="about-card">
        <span>💗</span>
        <div>
          <strong>SamiMath</strong>
          <p>{copy.madeWithLove}</p>
          <small>{copy.version} {APP_VERSION}</small>
        </div>
      </div>
    </section>
  );
}

function SettingRow({
  icon,
  label,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <label className="setting-row slider-row">
      <span className="setting-icon">{icon}</span>
      <span>{label}</span>
      <input
        type="range"
        min="0"
        max="1"
        step="1"
        value={checked ? 1 : 0}
        aria-label={label}
        onChange={(event) => onCheckedChange(event.target.value === '1')}
      />
    </label>
  );
}

function LanguagePicker({
  label,
  title,
  value,
  open,
  setOpen,
  onChange,
}: {
  label: string;
  title: string;
  value: Language;
  open: boolean;
  setOpen: (value: boolean) => void;
  onChange: (value: Language) => void;
}) {
  const selectedLanguage = LANGUAGES.find((language) => language.code === value);

  return (
    <>
      <button
        className="language-button"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <Languages size={25} />
        <span>{label}</span>
        <strong>{selectedLanguage?.label}</strong>
      </button>
      {open ? (
        <div
          className="language-picker-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className="language-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-picker-title"
          >
            <h3 id="language-picker-title">{title}</h3>
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                className={`language-choice ${language.code === value ? 'active' : ''}`}
                type="button"
                onClick={() => onChange(language.code)}
              >
                <span>{language.label}</span>
                {language.code === value ? <CheckCircle2 size={22} /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function BottomNav({
  copy,
  active,
  setScreen,
}: {
  copy: Copy;
  active: string;
  setScreen: (screen: Screen) => void;
}) {
  const items = [
    { id: 'home', label: copy.home, icon: <Home size={26} />, screen: 'home' as Screen },
    {
      id: 'achievements',
      label: copy.achievements,
      icon: <BarChart3 size={26} />,
      screen: 'achievements' as Screen,
    },
    {
      id: 'settings',
      label: copy.settings,
      icon: <Settings size={26} />,
      screen: 'settings' as Screen,
    },
  ];

  return (
    <nav className="bottom-nav" aria-label={copy.navLabel}>
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          className={active === item.id ? 'active' : ''}
          onClick={() => setScreen(item.screen)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
