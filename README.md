# Gravel Maps

A cross-platform (Android + iOS) mapping app for discovering gravel and unpaved roads in Colorado. Built with Expo, MapLibre, and public data from USFS, BLM, and OpenStreetMap.

## Prerequisites

- Node.js 20+
- For the data pipeline: `brew install tippecanoe gdal osmium-tool`
- For mobile: Xcode (iOS) or Android Studio (Android)

## Getting Started

```bash
# Install dependencies
npm install

# Start the Expo dev server
cd app
npx expo start
```

## Project Structure

- `app/` — Expo React Native app (MapLibre map, file-based routing)
- `pipeline/` — Data pipeline (fetches, normalizes, and tiles gravel road data)

## Data Pipeline

```bash
cd pipeline
npm install

# Run full pipeline (all sources)
npm run pipeline

# Run single source
npm run pipeline:usfs
```

## Testing

```bash
# App tests
cd app && npm test

# Pipeline tests
cd pipeline && npm test
```
