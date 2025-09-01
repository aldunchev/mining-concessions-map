# Mining Concessions Map - Claude Code Project

## Project Overview
This is a modern Next.js application built to display mining concessions in Bulgaria with precise coordinates and detailed information. The project was created using Claude Code with Google Maps integration.

## Architecture & Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React** with hooks for state management

### Map Integration
- **Google Maps JavaScript API**
- **@react-google-maps/api** for React components
- **@googlemaps/markerclusterer** for performance optimization

### Key Features
- Interactive map with 338+ mining deposits
- Real-time filtering and search
- Marker clustering for performance
- Responsive design for all devices
- Statistics dashboard

## Development Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Recommended Development Workflow
1. Start dev server: `npm run dev`
2. Make changes to components
3. Test functionality in browser
4. Run linting: `npm run lint`
5. Build and test: `npm run build`

## Environment Variables
Copy `.env.local.example` to `.env.local` and add your Google Maps API key:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Data Structure
The application uses `public/mining_deposits.json` containing:
- 338 mining concession records
- GPS coordinates (lat/lng)
- Deposit information (name, company, mineral type, status)
- Confidence levels for coordinate accuracy

## Component Structure

### Map Components (`/components/Map/`)
- `GoogleMap.tsx` - Main map component with markers and clustering
- Handles marker rendering, info windows, and clustering

### Filter Components (`/components/Filters/`)
- `FilterPanel.tsx` - Main filtering interface
- Search functionality
- Category-based filtering (region, mineral type, status)

### UI Components (`/components/UI/`)
- `Statistics.tsx` - Dashboard showing deposit statistics
- Real-time data calculations

## Performance Optimizations
- Dynamic imports for Google Maps (SSR prevention)
- Marker clustering for large datasets
- Memoized filtering functions
- Efficient re-renders with React hooks

## Known Issues & Solutions

### Google Maps Clustering Error
**Issue**: `Cannot read properties of undefined (reading 'GridAlgorithm')`
**Solution**: Use default MarkerClusterer configuration instead of custom algorithm

### Data Quality Issues
- Some deposits have identical coordinates (causing cluster of 2 at same location)
- 7 deposits have `null` coordinates (coordinate_confidence: "none")
- These will be resolved when coordinates are manually updated with precise values

## Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Add environment variable: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. Deploy automatically on push to main

### Manual Deployment
```bash
npm run build
npm start
```

## File Structure
```
├── app/
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main page with map and filters
│   └── globals.css        # Global styles
├── components/
│   ├── Map/
│   │   └── GoogleMap.tsx  # Google Maps integration
│   ├── Filters/
│   │   └── FilterPanel.tsx # Search and filtering
│   └── UI/
│       └── Statistics.tsx # Data statistics
├── lib/
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Helper functions
└── public/
    ├── mining_deposits.json # Mining data
    └── ...               # Static assets
```

## Future Enhancements
- Export functionality (CSV, PDF)
- Advanced map layers (terrain, satellite toggles)
- Deposit details modal with more information
- Print-friendly views
- Mobile app version
- Administrative panel for data management

## Google Maps API Requirements
- Maps JavaScript API enabled
- API key with proper restrictions
- Optional: Places API for enhanced search

## Development Notes
- Uses Bulgarian language for UI text
- Responsive design with mobile-first approach
- Accessibility considerations (keyboard navigation, screen readers)
- SEO optimized with proper metadata