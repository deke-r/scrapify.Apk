# Booking System Setup

This document provides instructions for setting up the booking system database tables.

## Database Tables Setup

1. **Connect to your MySQL database**
2. **Run the SQL script** to create the necessary tables:

```sql
-- Execute the contents of db/create_booking_tables.sql
```

Or run the following commands directly in your MySQL client:

```sql
-- Create service_bookings table
CREATE TABLE IF NOT EXISTS service_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_id INT NOT NULL,
  service_title VARCHAR(255) NOT NULL,
  selected_items TEXT NOT NULL,
  description TEXT,
  address_id INT,
  status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (address_id) REFERENCES user_addresses(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Create booking_images table
CREATE TABLE IF NOT EXISTS booking_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_id (booking_id)
);

-- Create user_addresses table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  street VARCHAR(255) NOT NULL,
  area VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
```

## Features Added

### 1. Service Booking Flow
- Users can select services and items from the services page
- Redirects to a dedicated booking page for image upload and address management
- Supports multiple image uploads (up to 10 images)
- Address validation and management

### 2. Booking Page Features
- **Image Upload**: Users can upload multiple images of their items
- **Address Management**: 
  - Uses existing address if available
  - Allows adding new address if none exists
  - Address validation with proper error handling
- **Service Summary**: Shows selected service and items
- **Additional Details**: Text area for special requirements

### 3. Backend API
- **POST /book-service**: Handles service booking with image upload
- **Multipart form data**: Supports image uploads
- **Address handling**: Creates new address or uses existing one
- **Email notifications**: Sends confirmation emails to users
- **Database storage**: Stores booking data and image references

### 4. Database Schema
- **service_bookings**: Stores booking information
- **booking_images**: Stores image file references
- **user_addresses**: Stores user address information

## API Endpoints

### POST /book-service
**Authentication**: Required (Bearer token)

**Request Body** (multipart/form-data):
- `serviceId`: Service ID (required)
- `serviceTitle`: Service title (required)
- `selectedItems`: JSON string of selected items (required)
- `description`: Additional description (optional)
- `images`: Array of image files (optional, max 10)
- `street`, `area`, `city`, `pincode`: New address fields (optional)

**Response**:
```json
{
  "success": true,
  "message": "Service booked successfully! You will receive a confirmation email shortly.",
  "bookingId": 123
}
```

## File Structure

```
app/
├── book-service.jsx          # New booking page
└── (tabs)/
    └── services.jsx          # Updated to redirect to booking page

scrapifyAppServer/
├── routes/
│   └── routes.js             # Added booking endpoint
├── db/
│   └── create_booking_tables.sql  # Database setup script
└── uploads/                  # Image storage directory
```

## Usage Flow

1. User selects services and items on the services page
2. Clicks "Book Selected Services"
3. Redirects to booking page
4. User uploads images of their items
5. User adds/confirms pickup address
6. User adds additional details (optional)
7. Submits booking
8. Receives confirmation email
9. Booking is stored in database

## Error Handling

- Validates required fields
- Checks for existing address or requires new address
- Handles image upload errors gracefully
- Provides user-friendly error messages
- Sends confirmation emails with booking details 