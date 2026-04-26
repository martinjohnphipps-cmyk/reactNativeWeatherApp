# React Native Weather App

A React Native application built with Expo that displays current weather conditions and forecasts using the [Open-Meteo API](https://open-meteo.com/) — no API key required. The app is hardcoded to the TES Sheffield Office and shows today's weather, a 7-day forecast carousel, and a 24-hour hourly breakdown for any selected day.

---

## Setup Instructions

```bash
cd weather-app
npm install
npx expo start          # start the Expo dev server
npx expo run:android    # build and run on Android
npx expo run:ios        # build and run on iOS
npm run test            # run Jest tests with coverage
```

> **Note:** Tested on Android. The app should be functional on iOS but has not been tested to confirm.

---

## Project Structure

```
weather-app/
├── app/              # Expo Router entry point (index.tsx + _layout.tsx)
├── components/       # UI components: DayCard, DayCarousel, HourlyWeatherList (+ tests)
├── hooks/            # useWeatherHook — fetches and returns parsed weather data
├── utils/            # weatherUtils — data transforms, WMO code helpers
├── types/            # TypeScript interfaces: WeatherData, DailySummary, HourlyEntry, etc.
├── constants/        # WMO code descriptions, unit display mappings
└── assets/           # Images and splash screens
```

Each concern lives in its own folder. Components hold only rendering logic, data fetching is done in the hook, the functions to search the data lives in the util, shared type definitions live in types.

---

## Technical Decisions

**Expo**
Chosen as the starting point because it is the current industry standard for new React Native projects. It handles cross-platform configuration, native build tooling, and the development server out of the box, significantly reducing setup overhead.

**React Native StyleSheet**
Used for all styling as sufficient for this task, equally Nativewind or alternatives could have been used.

**Jest + React Native Testing Library**
Unit and component tests are written with Jest (via the `jest-expo` preset) and React Testing Library. An 80% coverage threshold is enforced on branches, functions, lines, and statements.

**Open-Meteo SDK**
The `openmeteo` npm package's `fetchWeatherApi` function is used inside a custom hook (`useWeatherHook`). This keeps API interaction in one place and means the rest of the app never deals with raw API responses.

**`useState` + props**
State is managed with React's built-in `useState` and passed down as props - data doesn't have to be passed too deeply and the components are all nested instead of across multiple separate pages where state needs to be shared

**Folder structure**
A standard `components/`, `hooks/`, `types/`, `utils/`, `constants/` layout. Each folder has a single clear responsibility, making navigation and onboarding straightforward.

**ESLint + Prettier**
Code style is enforced at tooling level rather than by convention, keeping the codebase consistent and helping with readability

**Expo Router**
The file-based router is included as part of the Expo setup. Only the `index` route is used — the router was not extended further as no additional navigation was required for this scope.

**SafeAreaView**
Applied at the root of the screen to prevent content from overlapping system UI elements such as the status bar, notch, and camera cutout.

**Component breakdown**
The screen is split into `DayCard`, `DayCarousel`, and `HourlyWeatherList`. Each component has a single responsibility, making the codebase easier to read, test, and change independently.

**TypeScript**
Strict typing throughout — no `any` or `unknown` abuse, all function return types are explicit, and prop interfaces are declared for every component.

---

## Scalability Thoughts

- **API access**: the Open-Meteo free tier is suitable for development and small-scale use. Production traffic would require either a commercial Open-Meteo licence or migrating to a paid provider with SLA guarantees. Security considerations around where api keys are stored
- **State management**: `useState` with prop drilling is appropriate here. A more feature-rich app — multiple screens, saved locations, user preferences — would benefit from React Query for server state and Zustand or Context for shared UI state.
- **API response caching**: responses could be cached into storage (e.g. AsyncStorage) or React Query to reduce redundant network calls and support basic offline resilience between refreshes.
- **Component abstraction**: the current components are weather-specific. Extracting generic `Card` and `ScrollList` primitives would improve reuse if the app expanded to cover additional data types or screens.

---

## Monitoring Approach

- **Crash and error reporting**: integrate `@sentry/react-native` to capture unhandled exceptions and JS errors in production, with device and OS context attached automatically.
- **Telemetry**: OpenTelemetry logging of page changes, API calls (duration, success etc.) and failed API calls to power monitoring dashboards, and alerting rules - sending emails and sending off on-call notifications when appropriate (increased error rates - potential that an API key has expired etc.)
- **Performance**: use React Native's built-in Performance Monitor during development. In production, Sentry Performance or Firebase Performance Monitoring provides frame rate and slow-render visibility.
- **Uptime monitoring**: if Open-Meteo were replaced with a commercial API endpoint, a lightweight uptime check (e.g. Checkly or a scheduled ping) would give early warning of provider outages.

---

## What I'd Improve With More Time

- **Hourly detail view**: tap an hourly item to expand it and show additional metrics (UV index, visibility, pressure, etc.)
- **Location search**: a search bar that accepts a place name, resolves it to coordinates via a geocoding API, and passes them into the hook (would be a small extension to take latitude and longitude as props)
- **Weather icons**: icon set mapped from WMO codes (rain, sun, cloud, snow) with day/night variants driven by the `is_day` field returned by the API
- **Theming**: dark mode and light mode themes that respond to the device's system setting
