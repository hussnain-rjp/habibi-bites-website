# Product Requirements - Habibi Bites

This document defines the functional and non-functional requirements for the **Habibi Bites** storefront and ordering web application.

---

## 1. Functional Requirements (FR)

### Home Page
- **FR1.1:** Present a premium, themed hero splash highlighting the fast-food and traditional kitchen startup.
- **FR1.2:** Outline key value propositions (Fast delivery, traditional recipes, stone-baked pizzas) in a clean feature grid.
- **FR1.3:** Highlight selected best-selling deals with direct click-to-add shortcuts.
- **FR1.4:** Incorporate navigation hooks in the header to jump between storefront modules.

### Menu Page
- **FR2.1:** Group the items into logical sections: Pizza, Burgers (including wraps and sandwiches), Desi (karahi and broast), Starters, and Pastas.
- **FR2.2:** Align the layout to mirror Cheezious/KFC visual rules: sidebar navigation for active scroll jumping, large category details pane on the left, and item detail lists on the right.
- **FR2.3:** List product items with their corresponding recipe ingredients and size options.
- **FR2.4:** Display a customization popup modal for pizzas, supporting size selector pricing, extra toppings fees, and dipping sauces.

### Promotional Deals
- **FR3.1:** Display the 18 promotional flyer combo deals with stylized deal card borders and price banners.
- **FR3.2:** Provide a single-click action to add combo deals directly to the cart.

### Checkout & Cart Process
- **FR4.1:** Render a dynamic floating sidebar basket drawer accessible on all pages, enabling clients to increment, decrement, and clear items.
- **FR4.2:** Aggregate cart items, quantity counts, subtotal sums, and display the final bill on the checkout screen.
- **FR4.3:** Collect buyer coordinates: Name, phone, and delivery address.
- **FR4.4:** Process order inputs on confirmation, creating a unique transaction ID (`HB-XXXX`), clearing the basket, and redirecting the buyer to the tracking screen.
- **FR4.5:** Default transactions to "Cash on Delivery" (COD) or "Pay on Pickup".

### Order Tracker
- **FR5.1:** Allow looking up active orders using a phone number search or a unique Order ID.
- **FR5.2:** Present a live horizontal visual pipeline detailing active order stages:
  `Order Received` ➔ `In Queue` ➔ `Cooking` ➔ `Packing` ➔ `Out for Delivery` ➔ `Delivered`
- **FR5.3:** Automatically capture status transitions in real time through event broadcasting without requiring full-page rebuilds.

### Admin Dashboard Portal
- **FR6.1:** Secure administrative operations behind a login prompt (default demo credentials: `admin` / `habibibites123`).
- **FR6.2:** Show high-level dashboard KPIs: Total Revenue, Total Orders, Active Orders, and Completed Deliveries.
- **FR6.3:** Present an active orders data feed table displaying date, items, cost, and customer info.
- **FR6.4:** Provide a status action dropdown for each row, enabling admins to advance order stages instantly.

---

## 2. Non-Functional Requirements (NFR)

- **NFR1 (Responsive Design):** The storefront must adjust fluidly to mobile screen sizes, as the majority of orders are placed via mobile devices.
- **NFR2 (Visual Branding):** The visual theme must match the restaurant's flyer branding: obsidian black, glowing orange-red brand colors, and yellow highlights.
- **NFR3 (Self-Contained Portability):** The frontend must run out-of-the-box via local `file://` double-click execution or standard GitHub Pages hosting, without requiring a database backend or local server setup.
- **NFR4 (Performance & Load):** Visual elements, styles, and layout icons should load instantly on slow mobile connections.

---

## 3. Data Requirements

- **Local Storage Schema:** Persistent data (order feeds, login sessions, user reviews) is stored entirely in the client's browser local storage, with PubSub event hooks for cross-tab updates.
