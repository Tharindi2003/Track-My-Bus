# Track My Bus 🚌

**A real-time school bus tracking mobile app for parents, drivers and school administrators.**

Built with React Native, Expo and Firebase as the final project for CS6P05NM (London Metropolitan University, delivered at NEXT Campus).

<!-- Add a banner or 2-3 screenshots here, e.g.
<p align="center">
  <img src="docs/screenshots/parent-tracking.png" width="220" />
  <img src="docs/screenshots/driver-home.png" width="220" />
  <img src="docs/screenshots/admin-dashboard.png" width="220" />
</p>
-->

## Overview

Once a school bus leaves the pick-up point, parents usually have no idea where it is, and schools have no simple way to manage driver accounts centrally. Track My Bus solves this using only the smartphones that parents, drivers and staff already own, with no dedicated GPS hardware and no commercial fleet-platform costs.

## Features

### Parent
- Self-register and log in
- Search and select a bus by driver name, bus number or location
- Live bus position on a map (OpenStreetMap tiles), updated without refreshing
- Estimated arrival time at school and last-updated time
- Latest trip event banner (e.g. "Bus departed from school")
- Rate the driver, manage profile and password

### Driver
- Log in with admin-issued credentials (no self-registration)
- Start / stop live location sharing with a single tap
- Log trip events (Arrived School, Departed School, Arrived Home) after a confirmation step
- Edit profile, change password, confirmed logout

### Admin
- Create, view, edit and delete Driver and Admin accounts
- View registered Parents
- Dashboard with summary statistics
- Protected **Super Admin** account that can never be deleted (enforced in the UI and in code)

## Tech stack

| Concern | Choice |
|---|---|
| Mobile framework | React Native + Expo (JavaScript) |
| Database | Firebase Realtime Database |
| Authentication | Firebase Identity Toolkit REST API |
| Maps | react-native-maps with OpenStreetMap tiles (`UrlTile`) |
| Location | Expo Location API |
| Navigation | React Navigation (tabs + nested stacks) |

## Architecture

A simple three-layer design:

1. **Presentation layer**: React Native screens grouped by role (Parent, Driver, Admin)
2. **Service layer**: `authService`, `driverService`, `adminService`, `trackingService`; the only code that reads or writes Firebase
3. **Firebase Realtime Database**: `users`, `bus_drivers`, `liveLocations`, `events`

Firebase Authentication UIDs are used as keys across nodes, so a driver's account, profile and live position can be joined on the client. After login, the `role` field on `users/{uid}` decides which navigator is mounted, so an account can only reach its own screens.

## Project structure

```
src/
├── screens/      # Screens grouped by role (Parent, Driver, Admin)
├── services/     # Firebase access (auth, driver, admin, tracking)
└── navigation/   # React Navigation configuration
app.json          # Expo configuration
```

## Getting started

### Prerequisites
- Node.js (LTS) and npm
- Expo Go on your phone (or an iOS simulator / Android emulator)
- A Firebase project with **Authentication (Email/Password)** and **Realtime Database** enabled
- For Android: a Google Maps SDK for Android API key (react-native-maps needs it even when using OpenStreetMap tiles)

### Installation

```bash
git clone https://github.com/<your-username>/track-my-bus.git
cd track-my-bus
npm install
```

### Configuration

1. Copy the example config and fill in your own Firebase values:
   ```bash
   cp .env.example .env
   ```
2. Add your Google Maps API key to the Android section of `app.json` (do not commit a real key).
3. Create the first Super Admin manually in the Firebase Console: add an Authentication user, then write a matching `users/{uid}` record with `role: "ADMIN"` and the Super Admin flag.

### Run

```bash
npx expo start
```

Scan the QR code with Expo Go. Note that native config changes (such as the Android Maps key) require a rebuild, not just a reload.

## Testing

Testing was manual and continuous, using the Firebase Console and direct REST calls as an independent source of truth.

- **23 test cases** across Parent, Driver and Admin roles, **all passed**
- Requirements traceability matrix covering all 18 functional requirements
- Four defects found, fixed and retested:
  - Blank map on Android (native Google Maps SDK key required)
  - Writes silently failing due to locked default Firebase rules
  - `DataSnapshot.forEach()` returning only one record (callback implicitly returned a truthy value)
  - Dashboard tiles navigating to the wrong nested screen

## Known limitations

- ⚠️ Firebase security rules are **permissive (development only)** and must be replaced with per-user rules before real use
- Some error handling only logs to the console
- No automated tests yet
- Tested mainly on iOS; Android verified on a single device
- ETA is a simple coordinate-based estimate, not route-based

## Roadmap

- [ ] Restrictive, per-user Firebase security rules
- [ ] Push notifications for trip events
- [ ] Automated tests for the service layer
- [ ] User-facing error messages
- [ ] Route-based ETA

## Privacy note

This app handles children's location data. Only the current position is stored (not a history). A real deployment should comply with applicable data-protection law (e.g. Sri Lanka's Personal Data Protection Act, No. 9 of 2022), obtain parental consent and define a data-retention policy.

## Author

**K. Tharindi Sheran Perera** (TSK0059)
Supervisor: Prof. Ruvan Abeysekara

## License

MIT, see [LICENSE](LICENSE). *(Choose the license you prefer when creating the repo.)*
