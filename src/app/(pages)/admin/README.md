# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a comprehensive React component built with Next.js that provides a full-featured administrative interface for managing an auto parts e-commerce platform. It offers real-time analytics, inventory management, customer insights, and operational tools for efficient store management.

## Features

### Core Functionality
- **Multi-tab Interface**: Organized navigation with 11 distinct sections
- **Real-time Updates**: Auto-refresh capability with configurable intervals
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark Theme**: Consistent dark UI optimized for admin workflows

### Dashboard Sections

#### 1. Overview
- Key performance metrics (users, orders, products, revenue)
- Real-time statistics with growth indicators
- Customizable widget visibility

#### 2. Analytics
- Revenue trend analysis with interactive charts
- Customer Lifetime Value (CLV) metrics
- Top customers by spending and order frequency

#### 3. Insights
- **Demand Forecasting**: Moving average-based predictions
- **Churn Risk Analysis**: Customer retention monitoring
- **Actionable Recommendations**: AI-powered business insights

#### 4. Reports
- Profit margin analysis by product and category
- Monthly financial summaries
- CSV/PDF export functionality

#### 5. Inventory
- Stock alerts and low inventory warnings
- Inventory turnover analysis
- Product movement tracking

#### 6. Customer Insights
- Customer segmentation (High Value, Loyal, New, Total)
- CLV visualization with bar charts
- Customer behavior analytics

#### 7. Orders Management
- Order status tracking and updates
- Bulk order operations
- Advanced filtering and search
- Order history and details

#### 8. Products Management
- Product CRUD operations
- Bulk price updates
- Category and stock filtering
- Featured product management

#### 9. Blog Management
- Blog post creation and editing
- Publication status management
- Author and content tracking

#### 10. Comments Management
- Comment moderation and approval
- Bulk comment operations
- Blog-specific comment filtering

#### 11. Users Management
- User role management (Admin/Customer)
- User account overview
- Access control management

## Technical Architecture

### State Management
The component uses React hooks for state management:
- `useState` for local component state
- `useEffect` for lifecycle management and data fetching
- `useCallback` for optimized function references
- `useRouter` for Next.js navigation

### Key State Variables
```typescript
// Core data states
const [users, setUsers] = useState<User[]>([]);
const [orders, setOrders] = useState<Order[]>([]);
const [products, setProducts] = useState<Product[]>([]);

// Analytics data
const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
const [clvData, setClvData] = useState<CLVData[]>([]);
const [monthlySummary, setMonthlySummary] = useState<MonthlyData[]>([]);

// UI states
const [activeTab, setActiveTab] = useState('overview');
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

// Operational states
const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
const [bulkPriceUpdate, setBulkPriceUpdate] = useState({ percentage: 0, type: 'percentage' });
```

### API Integration

The dashboard integrates with multiple API endpoints:

#### Authentication & Profile
- `GET /api/auth/profile` - Admin access verification

#### Data Fetching
- `GET /api/admin/users` - User management data
- `GET /api/admin/orders` - Order management data
- `GET /api/admin/products` - Product inventory data
- `GET /api/admin/blogs` - Blog content data
- `GET /api/admin/comments` - Comment moderation data

#### Analytics Endpoints
- `GET /api/admin/revenue` - Revenue analytics
- `GET /api/admin/clv` - Customer lifetime value
- `GET /api/admin/stock-alerts` - Inventory alerts
- `GET /api/admin/inventory-turnover` - Turnover analysis
- `GET /api/admin/reports` - Financial reports

#### Operational Endpoints
- `PUT /api/orders/{id}` - Order status updates
- `DELETE /api/admin/products/{id}` - Product deletion
- `PUT /api/admin/products/bulk-price-update` - Bulk pricing
- `PUT /api/admin/orders/bulk-status-update` - Bulk order updates

## Component Structure

### Main Functions

#### Data Loading
```typescript
const loadData = async () => {
  // Fetches all dashboard data in parallel
  const [usersRes, ordersRes, productsRes, ...] = await Promise.all([
    fetch('/api/admin/users'),
    fetch('/api/admin/orders'),
    // ... other endpoints
  ]);
};
```

#### Authentication Check
```typescript
const checkAdminAccess = async () => {
  // Verifies admin role and redirects if unauthorized
};
```

#### Bulk Operations
- `bulkUpdateProductPrices()` - Applies percentage or fixed price changes
- `bulkUpdateOrderStatus()` - Updates multiple order statuses
- `bulkApproveComments()` - Approves pending comments

#### Analytics Calculations
- `calculateDemandForecast()` - Moving average forecasting
- `calculateChurnRisk()` - Customer churn analysis
- `generateRecommendations()` - Business insights generation

### UI Components

#### Navigation
- Tab-based navigation with icons
- Responsive design for mobile/desktop
- Active tab highlighting

#### Data Tables
- Sortable columns with hover effects
- Responsive table layouts
- Bulk selection capabilities

#### Charts & Visualizations
- Recharts integration for data visualization
- Revenue trend lines
- Customer segmentation bars
- Demand forecasting charts

#### Forms & Controls
- Search and filter inputs
- Bulk operation controls
- Settings panels

## Security Features

### Access Control
- Admin role verification on component mount
- Automatic redirect for unauthorized users
- Role-based UI element visibility

### Data Protection
- Client-side data validation
- Secure API communication
- Local storage for UI preferences

## Performance Optimizations

### Data Fetching
- Parallel API calls using `Promise.all()`
- Efficient data structures (Sets for selections)
- Lazy loading of heavy components

### UI Performance
- Conditional rendering based on active tab
- Optimized re-renders with proper key props
- Debounced search functionality

### Memory Management
- Cleanup of intervals on unmount
- Efficient state updates
- Garbage collection friendly data structures

## Configuration Options

### Auto-refresh Settings
- Configurable refresh intervals (15s - 5min)
- Enable/disable auto-refresh
- Last refresh timestamp display

### Widget Customization
- Show/hide dashboard widgets
- Persistent settings in localStorage
- Real-time widget visibility updates

### Export Options
- CSV export for reports
- PDF export with formatted data
- Automatic file download handling

## Error Handling

### Network Errors
- Graceful API failure handling
- User-friendly error messages
- Retry mechanisms for failed requests

### Data Validation
- Input sanitization
- Type checking with TypeScript
- Boundary condition handling

## Browser Compatibility

- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Dependencies

### Core Dependencies
- `react` - UI framework
- `next/navigation` - Routing
- `lucide-react` - Icon library
- `recharts` - Chart components

### Development Dependencies
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling

## Usage Instructions

### Initial Setup
1. Ensure admin role is assigned to user
2. Navigate to `/admin` route
3. Component automatically loads dashboard data

### Navigation
- Click tabs to switch between sections
- Use search bars for data filtering
- Apply filters using dropdown menus

### Bulk Operations
1. Select items using checkboxes
2. Choose bulk action from controls
3. Confirm operation execution

### Settings Configuration
1. Click "Settings" button
2. Toggle widget visibility
3. Adjust auto-refresh preferences
4. Settings persist automatically

### Exporting Data
1. Navigate to Reports section
2. Click "Export CSV" or "Export PDF"
3. File downloads automatically

## Troubleshooting

### Common Issues

#### Loading Problems
- Check network connectivity
- Verify API endpoints are accessible
- Check browser console for errors

#### Permission Issues
- Ensure user has admin role
- Clear browser cache and cookies
- Check authentication token validity

#### Performance Issues
- Reduce auto-refresh frequency
- Close unused browser tabs
- Check system memory usage

### Debug Information
- Console logs for API responses
- Network tab for request monitoring
- Component state inspection in React DevTools

## Future Enhancements

### Planned Features
- Advanced filtering options
- Custom dashboard layouts
- Real-time notifications
- Advanced analytics algorithms
- Mobile app integration

### Performance Improvements
- Virtualized data tables
- Progressive data loading
- Caching layer implementation
- Service worker integration

## Contributing

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration followed
- Component composition patterns
- Consistent naming conventions

### Testing
- Unit tests for utility functions
- Integration tests for API calls
- E2E tests for critical workflows

## Support

For technical support or feature requests:
- Check component documentation
- Review API endpoint specifications
- Contact development team

---

*Last updated: November 2024*
*Component version: 1.0.0*