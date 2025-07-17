# Lighthouse Metrics Dashboard

A modern web dashboard for monitoring and visualizing performance metrics from Google Lighthouse.

## ✨ Features

* **Real-Time Monitoring**: Track Lighthouse scores, Web Vitals, and accessibility metrics as they update.
* **Google Sheets Integration**: Automatically sync data from Google Sheets containing your Lighthouse reports.
* **Interactive Visualizations**: Explore trends over time with responsive, user-friendly charts.
* **Multi-URL Tracking**: Monitor performance across multiple websites or pages.
* **Dark Mode**: Sleek, modern UI with support for both light and dark themes.
* **Redis Caching**: Smart caching system to optimize performance and reduce API rate limits.

## 🛠 Tech Stack

Built with cutting-edge technologies for performance and maintainability:

* [**Next.js**](https://nextjs.org) – React framework with App Router support
* [**tRPC**](https://trpc.io) – End-to-end type-safe API layer
* [**Drizzle**](https://orm.drizzle.team) – Type-safe ORM for database operations
* [**Tailwind CSS**](https://tailwindcss.com) – Utility-first CSS styling
* [**Shadcn/ui**](https://ui.shadcn.com) – Accessible and elegant UI components
* [**Recharts**](https://recharts.org) – Composable charting library
* [**Redis**](https://redis.io) – Fast in-memory caching
* [**Google Sheets API**](https://developers.google.com/sheets/api) – Seamless data import from Sheets

## 🚀 Getting Started

To run the project locally:

1. Clone the repository
2. Install dependencies: `bun install`
3. Configure your environment variables (see `.env.example`)
4. Set up Google Sheets API credentials
5. Start the development server: `bun dev`