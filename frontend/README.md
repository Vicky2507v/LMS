# Library Management System — Modern SaaS Angular Frontend

A modern, responsive, high-performance Single Page Application (SPA) built with Angular 21, TypeScript, Bootstrap 5, and Chart.js, designed to integrate with the Spring Boot backend (`http://localhost:8585`).

---

## 🚀 Key Features

- **Executive SaaS Dashboard**:
  - Real-time statistics: Total Books, Registered Members, Total Borrow Logs, Currently Issued, Returned Books, Overdue Records, and Available Copies.
  - Interactive Chart.js visualizations for Circulation Status (Issued vs. Returned vs. Overdue) and Catalog Category breakdown.
  - Recent circulation activity log with 1-click return actions and days overdue highlighting.
- **Book Management**:
  - Full catalog view with responsive table, progress bars showing copies availability, and stock badges (In Stock, Low Stock, Out of Stock).
  - Search by title, search by author, and filter by genre/category.
  - Client-side sorting and configurable pagination.
  - Add and Edit modal forms with cross-field validation (`availableCopies <= totalCopies`, `totalCopies >= 1`).
  - Delete book with confirmation modal.
- **Member Management**:
  - Member registry with search by name, email, or 10-digit phone number.
  - Add and Edit member modals with strict validation matching the backend rules.
  - Detailed Member Borrowing History drawer with loan metrics and direct return action.
  - Delete member with integrity protection confirmation.
- **Issue Book**:
  - Clean circulation workflow to issue available books to registered members.
  - Validates stock availability in real-time and prevents issuing when out of stock.
  - Displays loan terms (automatic 14-day due date managed by Spring Boot).
- **Return Book**:
  - Dedicated active loans management with search and filter for overdue vs. on-schedule.
  - 1-click Return Book action with confirmation dialog.
  - Updates inventory and returned date through backend APIs.
- **Borrowing History**:
  - Server-side pagination and sorting directly integrated with Spring Data Page endpoint:
    `/borrow/history?page=0&size=5&sortBy=issueDate&direction=desc`
  - Filter tabs for All Records, Currently Issued, Returned, and Overdue.
  - Direct search by Member ID or Book ID.
- **Overdue Books**:
  - Delinquent loans monitoring calling `/borrow/getOverdueBooks`.
  - Calculates days overdue with urgency chips.
  - Pre-filled email reminder generator (`mailto:`) and telephone dialer (`tel:`).
- **Enterprise UI/UX & Responsive Layout**:
  - Collapsible sidebar that converts into a touch-friendly mobile drawer on screens < 992px.
  - Responsive tables with horizontal scroll containers.
  - Custom floating toast notification system.
  - Consistent SaaS design palette (Navy, Slate, Indigo, Emerald, Amber, Crimson).

---

## 🛠️ Technology Stack

- **Framework**: Angular 21 (Standalone Components, Signals, Reactive Forms)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Bootstrap 5.3 + Bootstrap Icons
- **Charts**: Chart.js 4
- **State & Reactivity**: RxJS 7 + Angular Signals
- **HTTP Client**: Centralized Angular Services with HttpInterceptors

---

## 📁 Project Architecture

```
frontend/src/
├── app/
│   ├── core/
│   │   ├── interceptors/
│   │   │   └── error.interceptor.ts      # Global HTTP error handling and toast alerts
│   │   ├── models/
│   │   │   ├── book.model.ts             # Book interface matching backend entity
│   │   │   ├── member.model.ts           # Member interface matching backend entity
│   │   │   ├── borrow-record.model.ts    # BorrowRecord interface & BorrowStatus type
│   │   │   ├── page.model.ts             # Spring Data Page<T> interface
│   │   │   └── dashboard.model.ts        # Dashboard statistics & chart data models
│   │   └── services/
│   │       ├── book.service.ts           # Book REST endpoints
│   │       ├── member.service.ts         # Member REST endpoints
│   │       ├── borrow-record.service.ts  # Circulation & Borrowing history endpoints
│   │       ├── dashboard.service.ts      # Aggregation & metrics service
│   │       └── notification.service.ts   # Signal-based toast notifications
│   ├── shared/
│   │   ├── components/
│   │   │   ├── confirm-modal/            # Reusable confirmation dialogs
│   │   │   ├── empty-state/              # Reusable empty state view
│   │   │   ├── loading-spinner/          # Reusable loading indicator
│   │   │   ├── pagination/               # Reusable pagination controls
│   │   │   ├── status-badge/             # Status and availability chips
│   │   │   └── toast-notification/       # Toast notification renderer
│   │   └── pipes/
│   │       └── days-overdue.pipe.ts      # Days overdue calculator pipe
│   ├── features/
│   │   ├── dashboard/                    # Executive dashboard & charts
│   │   ├── books/                        # Book listing, search, add/edit modals
│   │   ├── members/                      # Member listing, add/edit, history modal
│   │   ├── issue-book/                   # Circulation issue book workflow
│   │   ├── return-book/                  # Circulation return book workflow
│   │   ├── borrowing-history/            # Server-paginated audit trail & ID search
│   │   └── overdue-books/                # Overdue loans & borrower notifications
│   ├── layout/
│   │   ├── navbar/                       # Top header, route title & quick actions
│   │   ├── sidebar/                      # Collapsible navigation drawer
│   │   └── main-layout/                  # Shell wrapping navigation & router-outlet
│   ├── app.config.ts                     # Application providers (Router, HttpClient)
│   ├── app.routes.ts                     # Lazy-loaded feature routes
│   └── app.ts                            # Root standalone component
├── environments/
│   ├── environment.ts                    # Production config (apiBaseUrl: http://localhost:8585)
│   └── environment.development.ts        # Dev config
├── proxy.conf.json                       # Angular CLI reverse proxy for dev
└── angular.json
```

---

## 🔌 Backend API Integration Map

| Feature | HTTP Method | Endpoint | Description |
|---|---|---|---|
| **Books** | `GET` | `/getBooks` | Retrieve all books |
| | `GET` | `/getBooksByTitle/{title}` | Search books by title |
| | `GET` | `/getBooksByAuthor/{author}` | Filter books by author |
| | `GET` | `/getBooksByCategory/{category}` | Filter books by category |
| | `POST` | `/books` | Add a new book |
| | `PUT` | `/updateById/{id}` | Update book details |
| | `DELETE` | `/deleteById/{id}` | Delete book by ID |
| **Members** | `GET` | `/getAllMember` | Retrieve all members |
| | `GET` | `/getMemberById/{id}` | Get member by ID |
| | `GET` | `/getMemberByName/{name}` | Search members by name |
| | `GET` | `/getMemberByEmail/{email}` | Search members by email |
| | `GET` | `/getMemberByPhone/{phone}` | Search members by phone |
| | `POST` | `/addMember` | Register a new member |
| | `PATCH` | `/updateMemberById/{id}` | Update member details |
| | `DELETE` | `/deleteByMemberId/{id}` | Delete member by ID |
| **Borrow Records** | `POST` | `/borrow/issueBook?memberId={id}&bookId={id}` | Issue a book to a member |
| | `POST` | `/borrow/returnBook/{id}` | Return an issued book |
| | `GET` | `/borrow/allBorrowRecords` | Retrieve all borrow records |
| | `GET` | `/borrow/getBorrowRecordsByMember/{memberId}` | Get records for a specific member |
| | `GET` | `/borrow/getBorrowRecordsByBook/{bookId}` | Get records for a specific book |
| | `GET` | `/borrow/getCurrentlyIssuedBook` | Get active issued loans |
| | `GET` | `/borrow/getCurrentlyReturnedBook` | Get completed returned loans |
| | `GET` | `/borrow/getOverdueBooks` | Get overdue active loans |
| | `GET` | `/borrow/history?page={page}&size={size}&sortBy={sort}&direction={dir}` | Server-side paginated & sorted history |

---

## 🏃 Getting Started

### 1. Prerequisites
- Node.js: `v18+` (Tested on `v22.13.0`)
- npm: `v9+` (Tested on `10.9.2`)
- Spring Boot Backend running on `http://localhost:8585`

### 2. Run the Development Server
From the `frontend` directory:

```bash
npm start
```
Or to run with the built-in Angular CLI reverse-proxy (to forward API calls to `:8585`):
```bash
npm run start:proxy
```
Then open your browser at:
```
http://localhost:4200
```

### 3. Production Build
To create an optimized production build:
```bash
npm run build
```
Compiled assets will be output to `frontend/dist/frontend`.
