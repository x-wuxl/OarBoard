# OarBoard Phase 1 Notes

This phase uses `mokfiness.xml` only as a reverse-engineering sample to confirm endpoint names and payload shapes.

Runtime data flow is direct API access through `src/lib/moke/client.ts` and `src/lib/moke/service.ts`.

Phase 2 adds a Next.js API proxy at `app/api/moke/[...path]/route.ts`.

Covered endpoints:

- `obtainUserSporTotalListByDeviceType`: workout history list
- `obtainSportDataByDay`: grouped workout records for a time slice
- `obtainSportDetailById`: single workout detail
- `obtainUserSporTotalByType`: totals for a time slice
- `obtainHomePageData`: top-level user overview totals

Implemented utilities:

- duration formatting: seconds to `HH:mm:ss`
- distance formatting: meters to `km`
- pace formatting: speed to `mm:ss/500m`
- timestamp formatting: `YYYY-MM-DD HH:mm`
- comma-separated number series parsing for speed and rpm curves
