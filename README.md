# Performance Lab - Body Composition Tracker

A minimalist, performance-driven body composition dashboard for tracking body weight, skeletal muscle mass, body fat mass, and body fat percentage. All data is stored locally on your device.

## Features

- **Local Storage** - All data stays on your device, no account required
- **Metric Cards** - Real-time display of current values with delta comparisons
- **Interactive Chart** - Multi-line visualization with toggleable metrics and time range filters
- **Log Weigh-ins** - Simple modal form for recording new entries
- **Delta Calculations** - Automatic comparison with previous entries

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Charts**: Recharts
- **Storage**: Browser localStorage

## Getting Started

### Prerequisites

- Node.js 18+

### Install and Run

```bash
# Clone the repository
git clone <repo-url>
cd body-comp

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── icons/              # SVG icon components
│   ├── BiometricChart.tsx  # Recharts line chart
│   ├── Dashboard.tsx       # Main dashboard component
│   ├── Header.tsx          # App header
│   ├── MetricCard.tsx      # Stat card component
│   └── WeighInModal.tsx    # New entry modal
└── lib/
    └── storage.ts          # LocalStorage utilities
```

## Data Storage

All body composition data is stored in your browser's localStorage under the key `body-comp-entries`. This means:

- **Privacy**: Your data never leaves your device
- **No account required**: Start tracking immediately
- **Persistence**: Data survives browser restarts
- **Portability**: Export by copying localStorage data

### Data Format

Each entry contains:
```json
{
  "id": "unique-id",
  "date": "2024-02-16",
  "bodyWeight": 81.8,
  "skeletalMuscleMass": 37.1,
  "bodyFatMass": 15.3,
  "bodyFatPercentage": 18.7,
  "createdAt": "2024-02-16T10:30:00.000Z"
}
```

## Deployment

### Static Export

This app can be deployed as a static site:

```bash
npm run build
```

Deploy the `.next` folder to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

## License

MIT
