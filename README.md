# 🚜 AgriRent — Smart Equipment Rental for Smarter Farming 🌿

> A modern, full-stack agricultural equipment rental platform connecting local farmers with equipment owners. Available as an **Android & iOS Mobile Application** and a **Web Application**.

---

## 🌟 Key Features

- **🚜 Equipment Marketplace & Catalog**:
  - Browse tractors, seeders, harvesters, rotavators, sprayers, and specialized farm implements.
  - Category filters, real-time search, daily rental pricing, and live availability toggles.
- **👨‍🌾 Verified Farmer & Owner Profiles**:
  - Interactive profile cards showing verified credentials, badges, and contact details.
  - Direct **💬 WhatsApp Chat** integration (`wa.me`) and one-tap **📞 Phone Dialer** (`tel:`).
- **📋 End-to-End Booking Management**:
  - Date range picker with automated daily rental fee calculations.
  - Real-time booking status flow: `Pending` ➔ `Approved` ➔ `Completed` / `Cancelled`.
- **⚙️ Equipment Owner & Admin Controls**:
  - List new machinery, edit equipment specs, toggle availability, and approve/manage booking requests.
  - Admin dashboard for managing catalog items and user permissions.

---

## 📂 Project Structure

```
agri_rent/
├── agri-rent2-main/         # React Native Mobile App (Android & iOS)
│   ├── android/             # Native Android project (Gradle, Kotlin/Java, C++ CMake)
│   ├── src/
│   │   ├── components/      # UserProfileModal, CalendarPicker, BottomTabBar, etc.
│   │   ├── screens/         # HomeScreen, EquipmentDetailsScreen, MyBookingsScreen, etc.
│   │   ├── redux/           # Redux Toolkit slices (auth, equipment, booking)
│   │   └── services/        # API service & network config
│   └── package.json
│
├── web/                     # React 19 + Vite Web Application
│   ├── src/
│   │   ├── components/      # Navbar, UserProfileModal, BookingModal, EquipmentCard, etc.
│   │   ├── pages/           # HomePage, MyBookingsPage, AddEquipmentPage, AdminDashboardPage
│   │   ├── context/         # AuthContext with persistent user session
│   │   └── services/        # Axios API client & User directory
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Web Application (`web/`)

```bash
cd web
npm install
npm run dev
```
The web application will launch at `http://localhost:5173`.

### 2. Android Mobile Application (`agri-rent2-main/`)

Ensure you have Android SDK 34 and JDK 17 configured:

```bash
cd agri-rent2-main
npm install

# Start Metro Bundler
npx react-native start

# Deploy to connected Android device or emulator
npm run android
```

---

## 🛠️ Tech Stack

- **Mobile**: React Native 0.76+, React Navigation, Redux Toolkit, Safe Area Context, Vector Icons.
- **Web**: React 19, Vite, TypeScript, Lucide Icons, Vanilla CSS Design System.
- **Backend**: Node.js, Express, MongoDB REST API (Hosted on Render).

---

## 📄 License

MIT License © 2026 AgriRent
