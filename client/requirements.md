## Packages
recharts | For visualizing score breakdowns and analytics data
framer-motion | For smooth animations of progress bars and page transitions
lucide-react | Already in base, but ensuring for icons
clsx | For conditional class names
tailwind-merge | For merging tailwind classes

## Notes
- The API uses `zod` schemas shared from `@shared/routes`.
- Frontend expects `api/analyze` to return a comprehensive report object.
- Score gauges will use SVG circles or Recharts radial charts.
