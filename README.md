# Nightlight Tales

Personalized bedtime stories for children, powered by AI.

## Features

- Generate safe, age-appropriate bedtime stories personalized with your child's name
- Choose from 15+ themes like dinosaurs, space, ocean, and fairy tales
- Select reading duration (3, 5, 10, or 15 minutes)
- Age-adapted vocabulary and complexity for children 0-10
- Calming, wind-down language designed to ease children toward sleep
- Distraction-free reading mode optimized for dim bedrooms
- Post-generation safety validation on every story

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key ([get one here](https://console.anthropic.com/))

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nightlight-tales.git
   cd nightlight-tales
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your API key:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router, Edge Runtime)
- [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Claude API](https://docs.anthropic.com/) (Anthropic) for story generation and safety validation
