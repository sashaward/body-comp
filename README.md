# Body Composition Tracker

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
```

The static site is output to the `out/` directory. Serve it with any static file server.

## Deploy to GitHub Pages

1. **Enable GitHub Pages** in your repo: Settings → Pages → Build and deployment → Source: **GitHub Actions**.

2. **Push to `main`** – the workflow deploys automatically, or run it manually from the Actions tab.

3. **Your site** will be live at `https://<username>.github.io/body-comp/`.

Data is stored in your browser’s `localStorage`; nothing is sent to a server. No login required.

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

All body composition data is stored in your browser's localStorage under the key `body-comp-entries`. **There is no data in the codebase**—the app ships completely empty. Each visitor's data stays only in their own browser.

- **Privacy**: Your data never leaves your device
- **No account required**: Start tracking immediately
- **Persistence**: Data survives browser restarts (localStorage)
- **Portability**: Export via CSV from the dashboard
- **Reset**: Use the trash icon in the footer to clear all data and start fresh

**New visitors** always see an empty state. To test as a new user: use the Clear data button (trash icon), or open the site in an incognito/private window.

### Data Format

Each entry contains:
```json
{
  "id": "unique-id",
  "date": "YYYY-MM-DD",
  "bodyWeight": 0,
  "skeletalMuscleMass": 0,
  "bodyFatMass": 0,
  "bodyFatPercentage": 0,
  "createdAt": "ISO8601-timestamp"
}
```

## License

MIT
