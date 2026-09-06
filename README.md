# SamiMath

Math app for Samira. SamiMath is a small multiplication learning app made with love for Samira.

Primary language: Danish. Extra languages: English and Russian.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Firebase Hosting

The app is configured for Firebase Hosting project `math-for`.

```bash
npm run build
npx firebase-tools deploy --only hosting --project math-for
```

## Adam's Voice Recordings

After uploading the voice files to GitHub, put their raw file URLs in:

```text
src/audio-config.ts
```

Current events:

- `correct` for the praise audio after a correct answer.
- `wrong` for the supportive audio after a wrong answer.
- `streak3` for three correct answers in a row.
- `streak6` for six correct answers in a row.
- `perfect10` for ten correct answers in a row.

Until those URLs are added, the app uses browser speech synthesis as a fallback.

## Main Music

The background music is also configured in `src/audio-config.ts`.

It starts at 20% volume when the music setting is enabled.
