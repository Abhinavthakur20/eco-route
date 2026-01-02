# 🌍 Eco-Route – Sustainable Transit Tracker

Eco-Route is a modern web application that helps users plan eco‑friendly journeys by comparing carbon emissions for different transport modes between two locations. It visualizes the route on an interactive map and shows how much CO₂ can be reduced by using public transport instead of a private car.

---

## ✨ Features

- 🔍 **Smart location search** using OpenStreetMap Nominatim (with debounced search and request cancellation).
- 🗺️ **Interactive map** built with Leaflet + React‑Leaflet, including:
  - Live route drawing.
  - Start/destination markers.
  - Mobile‑friendly view and “View Route” experience.
- 🚆 **Transport modes**
  - Private Car (own vehicle).
  - Public Bus (Bus/Metro).
  - Train/Metro (Railway).
- 🌱 **Carbon impact**
  - Total route distance (km).
  - CO₂ emissions for the selected mode.
  - Comparison vs private car.
  - Approximate CO₂ reduction and tree‑equivalent impact.
- 💾 **Local savings tracker**
  - Total CO₂ saved across trips stored in `localStorage`.
- 📱 **Responsive UI**
  - Mobile‑first layout.
  - Bottom sheet‑style sidebar on small screens.
  - Smooth transitions and micro‑animations.

---

## 🛠 Tech Stack

- **Frontend:** React (with Hooks)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + custom utility classes
- **Maps:** Leaflet, React‑Leaflet
- **Routing API:** OSRM public routing service for turn‑by‑turn routes and geometry
- **Geocoding:** Nominatim (OpenStreetMap search API)
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js (recommended 18+)
- npm or yarn
- Git (for cloning and version control)

### Installation

```bash
# Clone the repository
git clone https://github.com/Abhinavthakur20/eco-route.git
cd eco-route

# Install dependencies
npm install




🧪 TODO / Future Enhancements
🔐 User accounts and trip history.

📊 Dashboard for total savings and trends.

🌘 Dark mode.

🌍 Multi‑language support.

📲 PWA support for offline usage.

🌐 Custom OSRM instance or configurable routing backend.

🧾 Export/share trip summary.
