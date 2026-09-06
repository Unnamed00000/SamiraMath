export type FeedbackAudioKind =
  | 'correct'
  | 'wrong'
  | 'streak3'
  | 'streak6'
  | 'perfect10';

const AUDIO_BASE =
  'https://raw.githubusercontent.com/Unnamed00000/SamiraMath/main/public/audio';

export const feedbackAudio: Record<FeedbackAudioKind, string> = {
  wrong: `${AUDIO_BASE}/Det%20var%20et%20godt%20fors%C3%B8g!%20Pr%C3%B8v%20%C3%A9n%20gang%20til%20%E2%80%93%20jeg%20ved,%20du%20kan.mp3`,
  perfect10: `${AUDIO_BASE}/Enest%C3%A5ende!%20Ti%20ud%20af%20ti!%20Det%20var%20helt%20fantastisk,%20Samira!.mp3`,
  correct: `${AUDIO_BASE}/Flot%20klaret!%20Det%20var%20helt%20rigtigt.%20Du%20g%C3%B8r%20det%20rigtig%20godt!%201.mp3`,
  streak3: `${AUDIO_BASE}/Imponerende!%20Tre%20rigtige%20i%20tr%C3%A6k!.mp3`,
  streak6: `${AUDIO_BASE}/Suver%C3%A6nt!%20Seks%20rigtige%20i%20tr%C3%A6k%20%E2%80%93%20du%20er%20virkelig%20skarp!.mp3`,
};
