'use client';

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
import { Switch } from '@/components/ui/switch';

const TABLES = Array.from({ length: 10 }, (_, index) => index + 1);
const STORAGE_KEY = 'samimath-progress-v1';
const AVATAR = '/assets/samira-avatar.png';

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
};

type SavedState = {
  tables: Record<number, TableProgress>;
  settings: SettingsState;
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
  value: number | null;
};

type ResultState = {
  mode: Mode;
  table: number | null;
  score: number;
  total: number;
  wrong: number;
  timeSeconds: number;
  answers: AnswerRecord[];
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
  settings: { sound: true, music: true, dark: false },
});

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

  return {
    tables,
    settings: { ...fresh.settings, ...(partial.settings ?? {}) },
  };
}

function starsFromPercent(percent: number) {
  if (percent >= 90) return 3;
  if (percent >= 70) return 2;
  if (percent >= 50) return 1;
  return 0;
}

function statusFromStars(stars: number) {
  if (stars === 3) return 'Выучено!';
  if (stars === 2) return 'Хорошо';
  if (stars === 1) return 'Учусь';
  return 'Ещё не изучено';
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

function messageForScore(score: number, total: number) {
  const percent = Math.round((score / total) * 100);
  if (percent === 100) return 'Невероятно! Ты знаешь эту таблицу! 🌟';
  if (percent >= 80) return 'Ты отлично справилась! 💜';
  if (percent >= 60) return 'Очень хорошо! Ещё немного практики!';
  return 'Не сдавайся! Давай попробуем ещё раз! 💪';
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

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(clampProgress(JSON.parse(raw)));
    } catch {
      setSaved(defaultState());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    document.documentElement.classList.toggle('dark', saved.settings.dark);
  }, [hydrated, saved]);

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
        `${question.a} умножить на ${question.b} равно ${question.answer}`,
      );
      utterance.lang = 'ru-RU';
      window.speechSynthesis.speak(utterance);
    },
    [saved.settings.sound],
  );

  const goBack = () => {
    if (screen === 'learn-table') setScreen('learn-select');
    else if (screen === 'train') setScreen('train-select');
    else setScreen('home');
  };

  const startQuiz = (mode: Mode, table: number | null) => {
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
  };

  const moveNext = (records = answers) => {
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
      { question: currentQuestion, correct, value },
    ];
    setAnswers(nextRecords);
    if (correct) {
      setFeedback('correct');
      return;
    }
    setFeedback('revealed');
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
      return;
    }
    recordTrainingAnswer(false, choice);
  };

  const submitTestAnswer = () => {
    if (!currentQuestion || !testValue) return;
    const numericValue = Number(testValue);
    const nextRecords = [
      ...answers,
      {
        question: currentQuestion,
        correct: numericValue === currentQuestion.answer,
        value: numericValue,
      },
    ];
    setAnswers(nextRecords);
    if (index >= questions.length - 1) finishQuiz(nextRecords, 'test', null);
    else moveNext(nextRecords);
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
        <div className="phone-notch" aria-hidden="true" />
        <div className="samimath-app">
          <Decor />
          {screen !== 'splash' && screen !== 'home' && screen !== 'result' ? (
            <button className="round-back" type="button" onClick={goBack} aria-label="Назад">
              <ChevronLeft size={26} />
            </button>
          ) : null}

          {screen === 'splash' ? (
            <Splash />
          ) : screen === 'home' ? (
            <HomeScreen setScreen={setScreen} startQuiz={startQuiz} />
          ) : screen === 'learn-select' ? (
            <TableSelect
              title="Выбери таблицу"
              onPick={(table) => {
                setSelectedTable(table);
                setScreen('learn-table');
              }}
            />
          ) : screen === 'learn-table' ? (
            <LearnTable
              table={selectedTable}
              speak={speak}
              startQuiz={() => startQuiz('train', selectedTable)}
            />
          ) : screen === 'train-select' ? (
            <TableSelect title="Тренировка" onPick={(table) => startQuiz('train', table)} />
          ) : screen === 'train' ? (
            <TrainingScreen
              question={currentQuestion}
              index={index}
              feedback={feedback}
              chooseAnswer={chooseAnswer}
              moveNext={() => moveNext()}
            />
          ) : screen === 'test' ? (
            <TestScreen
              question={currentQuestion}
              index={index}
              value={testValue}
              setValue={setTestValue}
              submit={submitTestAnswer}
            />
          ) : screen === 'result' && result ? (
            <ResultScreen result={result} retry={retry} home={() => setScreen('home')} />
          ) : screen === 'achievements' ? (
            <AchievementsScreen saved={saved} openProfile={() => setScreen('profile')} />
          ) : screen === 'profile' ? (
            <ProfileScreen
              totalStars={totalStars}
              masteredTables={masteredTables}
              accuracy={accuracy}
            />
          ) : (
            <SettingsScreen saved={saved} setSaved={setSaved} resetProgress={resetProgress} />
          )}

          {screen !== 'splash' && screen !== 'result' ? (
            <BottomNav active={activeTab} setScreen={setScreen} />
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

function Splash() {
  return (
    <section className="screen splash-screen">
      <img className="splash-avatar" src={AVATAR} alt="Самира" />
      <h1 className="logo">
        <span>Sami</span>Math
      </h1>
      <p className="splash-title">
        Учиться легко
        <br />
        вместе с Самирой!
      </p>
      <div className="loading-track">
        <span />
      </div>
      <p className="soft-note">Загрузка...</p>
    </section>
  );
}

function HomeScreen({
  setScreen,
  startQuiz,
}: {
  setScreen: (screen: Screen) => void;
  startQuiz: (mode: Mode, table: number | null) => void;
}) {
  const actions = [
    {
      title: 'Учить',
      subtitle: 'таблицу умножения',
      icon: <BookOpen size={44} />,
      className: 'green',
      action: () => setScreen('learn-select'),
    },
    {
      title: 'Тренироваться',
      subtitle: 'с вариантами ответов',
      icon: <Target size={44} />,
      className: 'blue',
      action: () => setScreen('train-select'),
    },
    {
      title: 'Проверить себя',
      subtitle: 'без подсказок',
      icon: <Trophy size={44} />,
      className: 'orange',
      action: () => startQuiz('test', null),
    },
    {
      title: 'Мои успехи',
      subtitle: 'твои достижения',
      icon: <Star size={44} />,
      className: 'pink',
      action: () => setScreen('achievements'),
    },
  ];

  return (
    <section className="screen home-screen">
      <button className="settings-float" type="button" onClick={() => setScreen('settings')}>
        <Settings size={25} />
      </button>
      <div className="hello">
        <img src={AVATAR} alt="Самира" />
        <div>
          <h2>
            Привет,
            <br />
            Самира! 💜
          </h2>
          <p>Что будем делать сегодня?</p>
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
  title,
  onPick,
}: {
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
          Ты сможешь!
          <br />Я в тебя верю! 💜
        </p>
      </div>
    </section>
  );
}

function LearnTable({
  table,
  speak,
  startQuiz,
}: {
  table: number;
  speak: (question: Question) => void;
  startQuiz: () => void;
}) {
  return (
    <section className="screen with-title learn-screen">
      <h2>
        Таблица умножения
        <br />
        <strong>на {table}</strong>
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
              <button type="button" onClick={() => speak(question)} aria-label="Произнести пример">
                <Volume2 size={22} />
              </button>
            </div>
          );
        })}
      </div>
      <button className="primary-cta" type="button" onClick={startQuiz}>
        Потренироваться
      </button>
    </section>
  );
}

function TrainingScreen({
  question,
  index,
  feedback,
  chooseAnswer,
  moveNext,
}: {
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
      <QuizHeader title="Тренировка" index={index} />
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
              ? 'Молодец!'
              : feedback === 'wrong'
                ? 'Попробуй ещё раз!'
                : 'Запомни ответ!'}
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
          Следующий вопрос
        </button>
      ) : null}
    </section>
  );
}

function TestScreen({
  question,
  index,
  value,
  setValue,
  submit,
}: {
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
      <QuizHeader title="Проверить себя" index={index} />
      <div className="question-card">
        {question.a} × {question.b} = ?
      </div>
      <div className="answer-input">{value || 'Введите ответ'}</div>
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
  result,
  retry,
  home,
}: {
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
        {result.score} из {result.total}
      </h2>
      <div className="result-list">
        <p>
          <CheckCircle2 size={30} />
          Правильных ответов <strong>{result.score}</strong>
        </p>
        <p>
          <XCircle size={30} />
          Ошибок <strong>{result.wrong}</strong>
        </p>
        <p>
          <Clock size={30} />
          Время <strong>{formatTime(result.timeSeconds)}</strong>
        </p>
      </div>
      <div className="result-mentor">
        <img src={AVATAR} alt="Самира" />
        <p>{messageForScore(result.score, result.total)}</p>
      </div>
      <button className="primary-cta" type="button" onClick={retry}>
        <RefreshCw size={20} />
        Попробовать ещё раз
      </button>
      <button className="ghost-cta" type="button" onClick={home}>
        На главную
      </button>
    </section>
  );
}

function AchievementsScreen({
  saved,
  openProfile,
}: {
  saved: SavedState;
  openProfile: () => void;
}) {
  return (
    <section className="screen with-title achievements-screen">
      <h2>Мои успехи</h2>
      <button className="profile-link" type="button" onClick={openProfile}>
        <User size={22} />
        Мой профиль
        <ChevronRight size={22} />
      </button>
      <div className="achievement-list">
        {TABLES.map((table) => {
          const progress = saved.tables[table];
          return (
            <div className="achievement-row" key={table}>
              <b>×{table}</b>
              <span aria-label={`${progress.stars} звезды`}>
                {'★'.repeat(progress.stars)}
                {'☆'.repeat(3 - progress.stars)}
              </span>
              <em className={`status status-${progress.stars}`}>
                {statusFromStars(progress.stars)}
              </em>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProfileScreen({
  totalStars,
  masteredTables,
  accuracy,
}: {
  totalStars: number;
  masteredTables: number;
  accuracy: number;
}) {
  return (
    <section className="screen with-title profile-screen">
      <h2>Мой профиль</h2>
      <div className="profile-card">
        <div className="avatar-ring">
          <span>👑</span>
          <img src={AVATAR} alt="Самира" />
        </div>
        <h3>Самира</h3>
        <p>Маленькая звёздочка 💜</p>
      </div>
      <div className="stats-grid">
        <div>
          <Star size={34} />
          <strong>{totalStars}</strong>
          <span>звёзд</span>
        </div>
        <div>
          <Trophy size={34} />
          <strong>{masteredTables}</strong>
          <span>таблиц</span>
        </div>
        <div>
          <Target size={34} />
          <strong>{accuracy}%</strong>
          <span>верных</span>
        </div>
      </div>
      <blockquote>«Умные дети делают большой мир!» 💜</blockquote>
      <div className="small-mentor">
        <img src={AVATAR} alt="" />
        <span>Всё получится! ⭐</span>
      </div>
    </section>
  );
}

function SettingsScreen({
  saved,
  setSaved,
  resetProgress,
}: {
  saved: SavedState;
  setSaved: React.Dispatch<React.SetStateAction<SavedState>>;
  resetProgress: () => void;
}) {
  const updateSetting = (key: keyof SettingsState, value: boolean) => {
    setSaved((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
    }));
  };

  return (
    <section className="screen with-title settings-screen">
      <h2>Настройки</h2>
      <div className="setting-list">
        <SettingRow
          icon={<Volume2 />}
          label="Звук"
          checked={saved.settings.sound}
          onCheckedChange={(value) => updateSetting('sound', value)}
        />
        <SettingRow
          icon={<Music />}
          label="Музыка"
          checked={saved.settings.music}
          onCheckedChange={(value) => updateSetting('music', value)}
        />
        <SettingRow
          icon={<Moon />}
          label="Тёмная тема"
          checked={saved.settings.dark}
          onCheckedChange={(value) => updateSetting('dark', value)}
        />
      </div>

      <div className="setting-list">
        <AlertDialog>
          <AlertDialogTrigger className="plain-row danger">
            <Trash2 size={25} />
            <span>Сбросить прогресс</span>
            <ChevronRight size={22} />
          </AlertDialogTrigger>
          <AlertDialogContent className="samimath-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Точно сбросить весь прогресс?</AlertDialogTitle>
              <AlertDialogDescription>
                Звёзды, попытки и результаты по таблицам начнутся заново.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={resetProgress}>Сбросить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="plain-row">
          <Info size={25} />
          <span>О приложении</span>
          <ChevronRight size={22} />
        </div>
      </div>

      <div className="about-card">
        <span>💗</span>
        <div>
          <strong>SamiMath</strong>
          <p>Создано с любовью для Самиры! 💜</p>
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
    <label className="setting-row">
      <span className="setting-icon">{icon}</span>
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

function BottomNav({
  active,
  setScreen,
}: {
  active: string;
  setScreen: (screen: Screen) => void;
}) {
  const items = [
    { id: 'home', label: 'Главная', icon: <Home size={26} />, screen: 'home' as Screen },
    {
      id: 'achievements',
      label: 'Достижения',
      icon: <BarChart3 size={26} />,
      screen: 'achievements' as Screen,
    },
    {
      id: 'settings',
      label: 'Настройки',
      icon: <Settings size={26} />,
      screen: 'settings' as Screen,
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Главная навигация">
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
