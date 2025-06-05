# Flourish Wizard

A modern web application for managing client information, applications, campaigns, and offers.

## Technology Stack

- Next.js 14
- React 18
- Modern CSS with CSS Modules
- Vercel Deployment

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/pages` - Next.js pages and routing
- `/components` - Reusable React components
- `/styles` - Global styles and CSS modules
- `/public` - Static assets
- `/api` - API routes

## Development

This project uses:
- ESLint for code linting
- Prettier for code formatting
- Next.js for server-side rendering and API routes

## Deployment

The application is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy your application

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_API_URL=your_api_url
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

ISC 