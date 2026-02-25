# Mastery

A mobile game inspired by Robert Greene's *Mastery*. Log your real-world practice sessions, track your progress through the three phases of mastery, and gamify your path to becoming a master of your craft.

---

## The Concept

Greene's book argues that mastery is not a gift — it is the result of deliberate, sustained practice guided by mentors and driven by a clear Life's Task. This app turns that framework into a living system you carry with you.

You log real practice. The app tracks the real journey.

---

## Getting Started

### 1. Choose Your Life's Task

On first launch, you'll complete a three-step onboarding:

1. **Your name** — how you'll be addressed throughout the journey
2. **Your domain** — the broad category of your craft (Music, Coding, Writing, Chess, Martial Arts, Visual Art, Science, Business, Language, or Other)
3. **Your craft** — be specific. Not just "Music" but "Jazz Piano". Not just "Coding" but "Systems Programming". Specificity is the beginning of mastery.

---

## The Three Phases

Your journey moves through three phases, defined by total logged hours:

| Phase | Hours Required | Description |
|-------|---------------|-------------|
| **Apprentice** | 0 – 500h | Submit to reality. Absorb deeply. Ego is the enemy. |
| **Creative-Active** | 500 – 5,000h | Experiment. Find your voice. Combine what you've learned. |
| **Master** | 5,000h+ | Intuition fuses with knowledge. You operate from a different level. |

Your current phase is always visible on the Dashboard and Profile.

---

## Screens

### Today (Dashboard)

Your daily command center.

- **Life's Task** — your craft name and current phase, with a progress bar toward the next phase
- **Daily stats** — minutes logged today, current streak, total sessions
- **Log Practice Session** — the primary action button
- **Recent sessions** — a quick view of your last 3 sessions

### Practice

Your full practice history.

- **Summary** — total hours broken down by session type (Deliberate / Observational / Passive)
- **Filter** — view sessions by type
- **Session cards** — each shows type, date, duration, quality rating, and your notes
- **Delete** — swipe or tap ✕ to remove a session

### Projects

Real-world goals that give your practice direction.

- **Create a project** — name it, describe it, set it as a real thing you're working toward (a performance, a deployed app, a competition, a book)
- **Complete a project** — mark it done to earn XP
- **Stats** — active count, completed count, total XP earned from projects

### Mentors

The people who accelerate your path.

**My Mentors** — add real people in your life:
- Name and domain
- Notes on what you're learning from them
- Bond Level (1–5) — tap the dots to update as the relationship deepens

**Historical** — add masters from Greene's book to your council:
- Leonardo da Vinci, Benjamin Franklin, Charles Darwin, John Coltrane, Bobby Fischer, Temple Grandin, Freddie Roach, Martha Graham
- Study their lives, add them as references, track insights in notes

### Profile

Your full mastery record.

- **Hours logged** — the central number. Everything flows from this.
- **Phase progress bar** — how far to the next phase
- **Streak** — current and longest consecutive day streaks
- **Total XP** — accumulated from sessions and completed projects

#### Attributes

Five stats that reflect different dimensions of mastery. All grow through how you practice:

| Attribute | How It Grows |
|-----------|-------------|
| **Focus** | Average quality rating of your deliberate sessions |
| **Discipline** | Length of your current daily streak (30 days = 100) |
| **Creativity** | Proportion of observational sessions to total sessions |
| **Intuition** | Locked until Creative-Active phase. Grows with total hours beyond 500h. |
| **Social Intelligence** | Number of mentors and depth of your relationships |

#### Keys to Mastery

Insights from the book, unlocked as you accumulate hours. There are 8 keys total, unlocking at:

| Key | Unlocks At |
|-----|-----------|
| Value the Learning | 1h |
| Submit to Reality | 5h |
| Absorb the Master's Power | 10h |
| The Ideal Apprenticeship | 25h |
| Develop Negative Capability | 50h |
| The Creative Breakthrough | 100h |
| Fuse the Intuitive with the Rational | 200h |
| The Tenth Essence | 500h |

---

## Logging a Session

Tap **+ Log Practice Session** from the Dashboard (or **+ Log** from the Practice tab).

**Session Type** — the most important choice:

| Type | What It Means |
|------|--------------|
| **Deliberate** | Focused, intentional practice at the edge of your ability. Hard. Uncomfortable. Most valuable. |
| **Observational** | Studying masters. Watching, reading, analyzing. Builds Creativity. |
| **Passive** | General engagement with your craft. Low intensity. Still counts. |

**Duration** — choose from 15, 30, 45, 60, 90, or 120 minutes.

**Quality (1–5)** — honest self-assessment of the session:

| Rating | Meaning |
|--------|---------|
| 1 | Scattered — hard to focus |
| 2 | Below average — frequent distractions |
| 3 | Average — some good stretches |
| 4 | Good — deep work for most of it |
| 5 | Flow state — complete immersion |

**Notes** — optional. What did you work on? What broke through? What frustrated you?

---

## XP & Progression

XP is earned from:
- **Logging sessions** — `duration × (quality / 5) × 2` per session
- **Completing projects** — each project has an XP reward (100–250 XP)

XP is displayed on your Profile but does not gate progression. Hours do. This reflects Greene's argument that mastery cannot be rushed or gamed — only accumulated.

---

## Data & Privacy

All data is stored locally on your device using SQLite. Nothing is sent to any server. Your practice log is yours.

---

## Development

Built with:
- [Expo](https://expo.dev) (SDK 54) + [expo-router](https://expo.github.io/router)
- React Native 0.81
- TypeScript (strict mode)
- Zustand (state management)
- expo-sqlite (local persistence)
- React Native Reanimated

```bash
git clone https://github.com/bigtesteth/mastery-game.git
cd mastery-game
npm install --legacy-peer-deps
npx expo start
```
