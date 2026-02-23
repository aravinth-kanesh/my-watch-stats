# MyWatchStats

Turn your Letterboxd or IMDb export into a visual breakdown of your watch habits. Upload a CSV, get charts. No account, no server, nothing leaves your browser.

## What it shows

- **Films watched** - total count, estimated hours, average rating, years active
- **Watch timeline** - monthly activity as an area chart
- **Ratings breakdown** - bar chart of how you distribute your scores
- **Films by decade** - pie chart of release decades
- **Top genres** - horizontal bar chart (IMDb only)
- **Top directors** - horizontal bar chart (IMDb only)

## How to use it

1. Export your data from Letterboxd or IMDb (see below)
2. Go to the app and drop the CSV onto the upload area
3. Click **Parse CSV**
4. Your stats appear instantly

### Exporting from Letterboxd

1. Go to [letterboxd.com/settings/data](https://letterboxd.com/settings/data)
2. Click **Export your data**
3. Unzip the download and use either `ratings.csv` or `diary.csv`

### Exporting from IMDb

1. Go to 'Your ratings' from the user menu
2. Click **Export**
3. Use the downloaded CSV directly

## Privacy

All processing happens locally in your browser. Your CSV data is never uploaded anywhere.

## Running locally

Requires Node.js (any recent LTS).

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Tech

- [Vite](https://vitejs.dev/) + React
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [PapaParse](https://www.papaparse.com/)
