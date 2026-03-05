# Supply Tracker

## What is this?

Full-stack kitchen inventory tracker built with Next.js, React, and PostgreSQL. It keeps tabs on items across different storage locations — in this case a fridge, freezer, and pantry, which are arguably the three places you most need to know what you've actually got.

Items are grouped by category within each location, and the app gives you a low stock warning when anything drops to or below its par level. Expiry dates are also tracked — items expiring within 7 days show a countdown, and anything already past its date gets flagged as expired. All of this is managed through a clean dark UI with full CRUD, so adding, editing, and removing items is done entirely through the browser without touching the database directly.

## Tech stack

- **Next.js 16** (App Router) with **React 19**
- **PostgreSQL** via the `postgres` npm package
- **Tailwind CSS** for layout, inline styles for component-level design
- **TypeScript** throughout

## Getting started

You'll need Node.js and a running PostgreSQL instance.

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root with your database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

3. Set up the database schema. The app expects three tables — `locations`, `categories`, and `items` — with the following structure:

```sql
CREATE TABLE locations (
  location_id SERIAL PRIMARY KEY,
  location_name TEXT NOT NULL
);

CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  category_name TEXT NOT NULL
);

CREATE TABLE items (
  item_id      SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  quantity     NUMERIC NOT NULL,
  unit         TEXT NOT NULL DEFAULT 'item',
  par_level    NUMERIC,
  location_id  INT NOT NULL REFERENCES locations(location_id),
  category_id  INT REFERENCES categories(category_id),
  purchase_date DATE,
  expiry_date  DATE
);
```

4. Seed your locations and any starting categories directly via SQL, then run the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Features

- **Location sidebar** — switch between Fridge, Freezer, and Pantry; the sidebar collapses if you need the space
- **Category grouping** — items within each location are grouped by category and sorted alphabetically
- **Low stock warnings** — set a par level on any item and it'll be flagged when stock hits that threshold
- **Expiry tracking** — optional expiry date on items; shows a day countdown when within 7 days, and an "Expired" badge past the date
- **Full CRUD** — add, edit, and delete items through modal forms without leaving the page

## API routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/items` | All items, or filtered by `?location_id=` |
| POST | `/api/items` | Create a new item |
| GET | `/api/items/:id` | Single item by ID |
| PATCH | `/api/items/:id` | Update item fields (partial updates supported) |
| DELETE | `/api/items/:id` | Remove an item |
| GET | `/api/locations` | All locations |
| GET | `/api/categories` | All categories |

## Future plans

- Add the ability to create new categories directly from the UI rather than inserting them via SQL
- Same for locations — being able to add them through the browser would make the app much more self-contained
- Shopping list view that surfaces all low-stock items across every location in one place
