# Habibi Bites Ordering Platform 🍔🔥 (React + Supabase Edition)

Welcome to **Habibi Bites**, a front-end ordering web application for a fast food restaurant startup in Gujranwala, Pakistan. Powered by **React**, **Vite**, **SOLID Principles**, and **Supabase**.

---

## 🚀 Key Features

1. **Enterprise React Single Page Application (SPA)**: Single entry point with high-performance component rendering and zero full-page reloads.
2. **Cheezious/KFC-Inspired Menu**: Split-screen layout featuring sticky category navigation sidebar and real food item photography.
3. **Pizza Customization System**: Interactive React modal supporting size variations (*Small, Regular, Large, XL*), extra toppings, and signature sauce add-ons with dynamic price calculation.
4. **18 Combo Flyer Deals**: Card grid representing the 18 promotional combos with full food images and instant add-to-basket shortcuts.
5. **Slide-Out Shopping Basket**: Floating React cart drawer with quantity modifiers and LocalStorage persistence.
6. **Dual-Mode Data Repository (SOLID & OOP)**: Implements the Repository Pattern with Dependency Inversion (`IRepository`), supporting automatic switching between cloud **Supabase PostgreSQL** and **LocalStorage fallback**.
7. **Real-Time Cross-Device Order Tracker**: Live WebSockets timeline synchronizing instantly when status is updated on any device worldwide.
8. **Admin Control Portal**: Protected dashboard featuring Supabase Auth JWT security, sales KPIs (*total revenue, active cooks, completions*), review approvals, delivery settings toggles, and thermal invoice printing.

---

## 🛠️ Tech Stack & Architecture

- **UI Framework**: React 18 + Vite
- **Data Access & Security**: Supabase Client (PostgreSQL, Auth JWT, Realtime WebSockets)
- **Styling**: Vanilla CSS3 Design Tokens & Glassmorphism
- **Design Patterns**: Repository Pattern, Singleton Pattern, Factory Pattern, Strategy Pattern, Observer Pattern

---

## 📂 Project Directory Structure

```
Habibi-Bites/
├── index.html               # SPA Mount Root
├── package.json             # React & Vite Dependencies
├── vite.config.js           # Vite Configuration
├── supabase_schema.sql      # Supabase Cloud Database Schema & Triggers
├── assets/                  # High-resolution real food photography & logo
├── css/                     # Design tokens & master styling system
└── src/                     # Enterprise React Architecture
    ├── core/                # Domain Logic, Contracts, Factories & Strategies
    ├── infrastructure/      # Supabase Singleton & Repositories
    └── presentation/        # React Components, Contexts, Hooks & Pages
```

---

## 🏁 Getting Started

```bash
# 1. Install Dependencies
npm install

# 2. Run Development Server
npm run dev

# 3. Build for Production
npm run build
```
