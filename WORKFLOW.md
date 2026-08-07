# Development & Operations Workflows

This document outlines the operational order workflow and developers' code protocols for the **Habibi Bites** platform.

---

## 1. Order Status Workflow

The application operates a progressive state machine to trace orders from cart checkout to delivery:

```mermaid
stateDiagram-cross-tab
    [*] --> Received : Buyer places order on Checkout
    Received --> Queue : Admin assigns order to prep queue
    Queue --> Cooking : Kitchen staff starts preparation
    Cooking --> Packing : Food is loaded into heat-insulated bags
    Packing --> OutForDelivery : Rider departs with order
    OutForDelivery --> Delivered : Rider marks as delivered (Revenue recorded)
    Delivered --> [*]
```

### Real-Time Cross-Tab Sync Mechanism
1. **Mutation Trigger:** The admin transitions the order state using the dropdown on the dashboard in tab A.
2. **Database Mutation (`js/db.js`):** The new state is written to browser `localStorage` and a local window `storage_changed` event is dispatched.
3. **Cross-Tab Event Dispatching:** The browser automatically broadcasts a standard `storage` event to all other tabs on the same origin (e.g. Tab B - Customer Order Tracker).
4. **Client UI Redraw:** The tracking page catches the event trigger, queries the updated order details from `localStorage`, and instantly updates the visual timeline.

---

## 2. Developer & Git Gitflow Guidelines

### Directory Structure
```
Habibi-Bites/
│
├── css/
│   └── style.css          # Master stylesheet (Design tokens & layout variables)
│
├── js/
│   ├── menu-data.js       # Static food catalog & flyer combo deals data
│   ├── db.js              # Database access wrapper & PubSub events controller
│   ├── cart.js            # Add/Remove quantities, price customization logic
│   └── main.js            # Layout injectors (Navbar, Footer, Sliding Cart Drawer)
│
├── index.html             # Homepage
├── menu.html              # Custom ordering list
├── deals.html             # Combo cards grid
├── checkout.html          # Details form
├── tracker.html           # Live progress tracking
├── reviews.html           # Feedback dashboard
├── admin.html             # Administration panel
│
└── assets/                # Photo and vector assets (to be added)
```

### Development Rules
- **Keep it Vanilla:** Keep logic written in clean, modern vanilla ES6 JavaScript to ensure compatibility and ease of deployment.
- **Maintain Design System Tokens:** Always style new elements using the predefined CSS custom properties in `css/style.css` (e.g. `--primary`, `--accent`, `--bg-dark`).
- **Data Integrity:** Do not mutate `window.HABIBI_MENU` directly at runtime; manage cart state using `window.HABIBI_CART` methods.

### Git workflow
1. Create a descriptive feature branch: `feature/custom-toppings-refactor`.
2. Commit small, logical changes with clear commit messages: `git commit -m "feat: add double zinger option select dialog"`.
3. Push to GitHub and review via Pull Request before merging to `main`.
