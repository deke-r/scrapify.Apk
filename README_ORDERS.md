# Orders System Documentation

## Overview
The orders system allows users to view and track their service bookings with different statuses. Users can see all their orders, filter by status, and view detailed information about each order.

## Features

### Frontend Components

#### 1. Orders Page (`app/(tabs)/orders.jsx`)
- **Location**: Main orders page accessible via tab navigation
- **Features**:
  - Displays all user orders with detailed information
  - Status filtering (All, Pending, Confirmed, In Progress, Completed, Cancelled)
  - Pull-to-refresh functionality
  - Responsive design with cards for each order
  - Shows order images, selected items, description, and address

#### 2. OrderStatusBadge Component (`components/OrderStatusBadge.jsx`)
- **Purpose**: Reusable status indicator component
- **Features**:
  - Different sizes (small, medium, large)
  - Color-coded statuses with appropriate icons
  - Consistent styling across the app

#### 3. OrderSummary Component (`components/OrderSummary.jsx`)
- **Purpose**: Compact order display for use in other parts of the app
- **Features**:
  - Configurable detail level
  - Reusable across different screens
  - Compact design for lists

### Backend API Endpoints

#### 1. GET `/orders`
- **Purpose**: Fetch all orders for the authenticated user
- **Authentication**: Required (JWT token)
- **Response**: 
  ```json
  {
    "success": true,
    "orders": [
      {
        "id": 1,
        "serviceTitle": "Scrap Dealing",
        "selectedItems": [...],
        "description": "Additional details",
        "status": "pending",
        "bookingDate": "2024-01-15",
        "bookingTime": "10:30:00",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "address": {
          "street": "123 Main St",
          "area": "Downtown",
          "city": "City",
          "pincode": "12345"
        },
        "images": ["uploads/image1.jpg", "uploads/image2.jpg"]
      }
    ]
  }
  ```

#### 2. PATCH `/orders/:orderId/status`
- **Purpose**: Update order status (for admin use)
- **Authentication**: Required (JWT token)
- **Body**: `{ "status": "confirmed" }`
- **Valid Statuses**: pending, confirmed, in_progress, completed, cancelled

## Database Schema

### Tables Used

#### 1. `service_bookings`
- Stores main booking information
- Status field with ENUM values
- Links to user and address tables

#### 2. `booking_images`
- Stores uploaded images for each booking
- Links to service_bookings table

#### 3. `user_addresses`
- Stores pickup address information
- Links to users table

## Order Statuses

1. **Pending** (`pending`)
   - Default status for new bookings
   - Orange color (#FF9800)
   - Icon: time-outline

2. **Confirmed** (`confirmed`)
   - Order has been confirmed by admin
   - Blue color (#2196F3)
   - Icon: checkmark-circle-outline

3. **In Progress** (`in_progress`)
   - Service is being performed
   - Purple color (#9C27B0)
   - Icon: construct-outline

4. **Completed** (`completed`)
   - Service has been completed
   - Green color (#4CAF50)
   - Icon: checkmark-done-circle-outline

5. **Cancelled** (`cancelled`)
   - Order has been cancelled
   - Red color (#F44336)
   - Icon: close-circle-outline

## Navigation

### Tab Navigation
- **Icon**: list-outline
- **Position**: Between Services and About tabs
- **Route**: `/(tabs)/orders`

### Home Page Integration
- "My Orders" button routes to orders tab
- Provides quick access to order management

## Usage Examples

### Basic Order Display
```jsx
import OrderSummary from '../components/OrderSummary'

<OrderSummary order={orderData} showDetails={false} />
```

### Status Badge Usage
```jsx
import OrderStatusBadge from '../components/OrderStatusBadge'

<OrderStatusBadge status="pending" size="medium" />
```

### Filtering Orders
```jsx
const [selectedStatus, setSelectedStatus] = useState('all')
const filteredOrders = orders.filter(order => 
  selectedStatus === 'all' || order.status === selectedStatus
)
```

## Styling

### Color Scheme
- **Primary**: #4CAF50 (Green)
- **Secondary**: #a8e6cf (Light Green)
- **Background**: Linear gradient from light green to white
- **Cards**: White with subtle shadows

### Typography
- **Headers**: Bold, 18-24px
- **Body**: Regular, 14-16px
- **Captions**: Small, 11-12px

## Error Handling

### Frontend
- Loading states with activity indicators
- Error alerts for failed API calls
- Empty state handling for no orders
- Pull-to-refresh for data updates

### Backend
- JWT token validation
- Database error handling
- Proper HTTP status codes
- Error logging for debugging

## Future Enhancements

1. **Order Actions**
   - Cancel order functionality
   - Reorder from completed orders
   - Rate and review completed services

2. **Notifications**
   - Push notifications for status changes
   - Email updates for order progress

3. **Admin Features**
   - Bulk status updates
   - Order analytics and reporting
   - Customer communication tools

4. **Order History**
   - Detailed order timeline
   - Service provider information
   - Payment history

## Testing

### Manual Testing Checklist
- [ ] Orders page loads correctly
- [ ] Status filtering works for all statuses
- [ ] Pull-to-refresh updates data
- [ ] Order details display correctly
- [ ] Images load properly
- [ ] Navigation between tabs works
- [ ] Error states handle gracefully

### API Testing
- [ ] Orders endpoint returns correct data
- [ ] Authentication works properly
- [ ] Status update endpoint functions
- [ ] Error responses are appropriate

## Troubleshooting

### Common Issues

1. **Orders not loading**
   - Check JWT token validity
   - Verify API endpoint accessibility
   - Check database connection

2. **Images not displaying**
   - Verify image file paths
   - Check uploads directory permissions
   - Ensure proper URL construction

3. **Status filtering issues**
   - Verify status values in database
   - Check filter logic implementation
   - Ensure state updates properly

### Debug Information
- Check browser console for errors
- Verify API responses in Network tab
- Check server logs for backend issues
- Validate database data integrity 