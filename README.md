# Dairy Management Web App

## Overview
The Dairy Management Web App is a full-stack application designed to help dairy owners manage their business efficiently. It allows users to track customers, daily milk and ghee deliveries, payments, and generate analytics reports. The app is built using Next.js with a mobile-friendly design and is ready to be a Progressive Web App (PWA).

## Features
- **Customer Management**: Add, edit, and delete customer records.
- **Daily Entry Screen**: Quickly input milk and ghee delivery entries for multiple customers.
- **Transaction Management**: Record payments, advances, and adjustments with various payment modes.
- **Ledger View**: View detailed entries and transactions for each customer along with their running balance.
- **Monthly Billing**: Generate billing summaries for selected months.
- **Analytics Dashboard**: Visualize sales trends, outstanding balances, and top customers with charts and tables.
- **Language Toggle**: Switch between English and Hindi for user interface elements.
- **PWA Features**: Installable on mobile devices with a responsive design.

## Project Structure
```
dairy-management-app
├── app
│   ├── (pages)
│   │   ├── dashboard
│   │   ├── customers
│   │   ├── entries
│   │   ├── ledger
│   │   └── analytics
│   ├── api
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── forms
│   ├── ledger
│   ├── analytics
│   ├── ui
│   └── layout
├── lib
│   ├── supabaseClient.ts
│   ├── db
│   ├── i18n
│   ├── utils
│   └── pwa
├── public
├── prisma
├── styles
├── supabase
├── next.config.mjs
├── package.json
├── tailwind.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Getting Started
1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd dairy-management-app
   ```

2. **Install Dependencies**: 
   ```
   npm install
   ```

3. **Set Up Supabase**: 
   - Create a Supabase project and configure the database schema as defined in `supabase/schema.sql`.
   - Update the Supabase client configuration in `lib/supabaseClient.ts`.

4. **Run the Application**: 
   ```
   npm run dev
   ```

5. **Access the App**: Open your browser and navigate to `http://localhost:3000`.

## Technologies Used
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Context API
- **Deployment**: Vercel (recommended for Next.js apps)

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.