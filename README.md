# WanderStay — Multi-Step Resort & Luxury Tour Booking Engine

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://wanderstay-booking.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/debgourab/wanderstay-booking)
[![Bootstrap 5.3](https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![jQuery 3.7](https://img.shields.io/badge/jQuery-3.7.1-0769AD?style=for-the-badge&logo=jquery&logoColor=white)](https://jquery.com/)
[![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**WanderStay** is a responsive, production-ready **Multi-Step Resort & Tour Booking Engine** built with **HTML5, CSS3, Bootstrap 5.3, jQuery 3.7, and Vanilla JavaScript (ES6+)**. It replaces overwhelming single-page checkout forms with a guided 4-step hospitality reservation wizard featuring real-time date-range pricing, room suite upgrades, curated tour add-ons, promotional coupon validation, and downloadable e-ticket receipts persisted in `localStorage`.

🔗 **Live Deployment (Vercel):** [https://wanderstay-booking.vercel.app](https://wanderstay-booking.vercel.app)  
📂 **GitHub Repository:** [https://github.com/debgourab/wanderstay-booking](https://github.com/debgourab/wanderstay-booking)

---

## 🎯 Why This Project Stands Out (Recruiter Highlights)

- **Stateful 4-Step Wizard Architecture:** Built with clean ES6+ state management (`BookingState`) and jQuery step transitions (`.fadeIn()`, `.fadeOut()`, `.slideDown()`, `.slideUp()`), blocking progression until current step inputs pass date and regex validation.
- **Real-Time Dynamic Pricing Engine:** Automatically calculates stay duration (nights), room tier multipliers (*Deluxe*, *Premier Villa*, *Presidential Pool Suite*), extra-guest supplements, per-night vs. flat-fee tour add-ons, promo discounts (`WANDER20`, `FIRST50`, `FESTIVE15`), and 12% hospitality GST.
- **Interactive Media & Lightbox Gallery:** Includes a full-screen Bootstrap 5 Hero Carousel, category-filtered destination cards (*Beach*, *Mountain*, *Heritage*, *Wildlife*), and a custom jQuery Lightbox modal with 1-click wizard pre-selection.
- **Persistent Reservations & E-Ticket Export:** Saves confirmed bookings in browser `localStorage` and generates downloadable `.txt` e-ticket vouchers using the HTML5 `Blob` API.

---

## 🛠️ Tech Stack & Tools Used

| Category | Technologies |
| :--- | :--- |
| **Markup & Styling** | HTML5 (Semantic), CSS3 (Custom Variables, Card Zoom Transitions, Sticky Layout) |
| **UI Framework & Icons** | Bootstrap 5.3.3 (Carousel, Progress Bar, Floating Labels, Accordion, Modals, Toasts), Bootstrap Icons 1.11.3 |
| **Scripting & DOM** | JavaScript (ES6+ Arrow Functions, Template Literals, Array Methods), jQuery 3.7.1 |
| **Browser APIs & Storage** | `localStorage` State Persistence, `Intl.NumberFormat` (`₹ INR` / `$ USD`), HTML5 `Blob` E-Ticket Download |
| **Version Control & Hosting** | Git, GitHub, Vercel |

---

## ✨ Key Functional Features

1. **Guided 4-Step Booking Wizard with Live Progress Bar**
   - **Step 1 (Destination & Dates):** Choose from 6 signature Indian resorts (Goa, Manali, Udaipur, Kerala, Darjeeling, Sundarbans), select Check-In/Check-Out dates with automatic night calculation, and configure Adults, Children, and Rooms.
   - **Step 2 (Suite Upgrades & Curated Tours):** Upgrade accommodation tiers and toggle hospitality add-ons (*Airport Chauffeur Transfer*, *All-Inclusive Gourmet Dining*, *Guided Heritage Expedition*, *Couple's Ayurvedic Spa*).
   - **Step 3 (Guest Info & Regex Validation):** Floating-label form validating full name, email regex, 10-digit phone number, arrival window, and cancellation policy agreement.
   - **Step 4 (Itinerary Review & Promo Engine):** Itemized summary card, 1-click coupon chips (`WANDER20`, `FIRST50`, `FESTIVE15`), and payment preference selection.
2. **Sticky Live Price Summary Sidebar**
   - Updates instantaneously on every click or date change without page reloads.
3. **Multi-Currency (`₹ INR` / `$ USD`) & Persistent Dark/Light Mode**
   - Seamlessly converts all resort rates, add-ons, and saved e-tickets between Indian Rupees and US Dollars.
4. **"My Bookings" Drawer & Printable E-Ticket Generator**
   - View or cancel past reservations stored in `localStorage` or download a formatted `.txt` e-ticket voucher.

---

## 📁 Project Folder Structure

```text
wanderstay-booking-engine/
├── index.html              # Semantic HTML5, Hero Carousel, 4-Step Wizard, Gallery, Accordion & Modals
├── assets/
│   ├── css/
│   │   └── style.css       # Custom CSS3 variables, stepper pills, selectable cards & gallery hover zoom
│   └── js/
│       ├── data.js         # ES6 dataset for resorts, room suite tiers, tour add-ons & promo coupons
│       └── app.js          # ES6 pricing engine, wizard validation, jQuery DOM transitions & localStorage
├── .gitignore              # Standard Git ignore rules
├── push-22-commits.sh      # Automated script to generate 22 meaningful Git commits & push to GitHub
└── README.md               # Recruiter-friendly project documentation
```

---

## 🚀 Getting Started (Run Locally)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/debgourab/wanderstay-booking.git
   cd wanderstay-booking
   ```
2. **Launch in Browser / VS Code:**
   - Open the folder in **VS Code** and launch `index.html` with **Live Server**, or double-click `index.html` to open directly in any modern browser.

---

## 👨‍💻 Author

**Deb Gourab Biswas**  
*Full Stack & Frontend Web Developer* — Kolkata, West Bengal, India

- 🌐 **Portfolio:** [https://debgourab-biswas-portfolio.vercel.app](https://debgourab-biswas-portfolio.vercel.app)
- 💻 **GitHub:** [@debgourab](https://github.com/debgourab)
- 🔗 **LinkedIn:** [linkedin.com/in/debg](https://www.linkedin.com/in/debg)
- 🧠 **LeetCode:** [leetcode.com/u/debgourab](https://leetcode.com/u/debgourab)
- 📧 **Email:** [debgourabbiswas@gmail.com](mailto:debgourabbiswas@gmail.com)

---

*If you found this project well-crafted, feel free to ⭐ star the repository!*
