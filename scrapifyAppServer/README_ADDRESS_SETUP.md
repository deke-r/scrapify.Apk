# User Address Setup Instructions

## Database Setup

### 1. Create the user_address table

Run the following SQL script in your MySQL database:

```sql
-- Create user_address table
CREATE TABLE IF NOT EXISTS user_address (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);
```

You can also run the SQL file directly:
```bash
mysql -u your_username -p your_database_name < db/create_user_address_table.sql
```

## API Endpoints

### 1. Get User Address
- **GET** `/api/scrapify/address`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 
  ```json
  {
    "address": {
      "id": 1,
      "user_id": 1,
      "street": "123 Main Street",
      "area": "Downtown",
      "city": "Delhi",
      "pincode": "110001",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 2. Create/Update User Address
- **POST** `/api/scrapify/address`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "street": "123 Main Street",
    "area": "Downtown",
    "city": "Delhi",
    "pincode": "110001"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Address created/updated successfully",
    "address": {
      "id": 1,
      "user_id": 1,
      "street": "123 Main Street",
      "area": "Downtown",
      "city": "Delhi",
      "pincode": "110001"
    }
  }
  ```

### 3. Update User Address (Alternative)
- **PUT** `/api/scrapify/address`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Same as POST
- **Response**: Same as POST

## Validation Rules

### Backend Validation
- **Street**: Required, minimum 3 characters
- **Area**: Required, minimum 2 characters
- **City**: Required, must be one of the predefined options
- **Pincode**: Required, exactly 6 digits

### Frontend Validation (React Hook Form)
- **Street**: Required, minimum 3 characters
- **Area**: Required, minimum 2 characters
- **City**: Required selection from dropdown
- **Pincode**: Required, 6-digit pattern validation

## City Options
The following cities are available in the dropdown:
- Delhi
- Noida
- Greater Noida
- Gurugram
- Faridabad
- Ghaziabad
- Others

## Features

### 1. Automatic Address Creation/Update
- The POST endpoint automatically creates a new address if none exists
- If an address already exists, it updates the existing record

### 2. Backward Compatibility
- The profile endpoint still returns the address as a combined string
- New `addressData` field contains the structured address information

### 3. Data Integrity
- Foreign key constraint ensures address belongs to valid user
- Cascade delete removes address when user is deleted
- Timestamps track creation and update times

### 4. Security
- All inputs are sanitized using validator.js
- JWT authentication required for all endpoints
- SQL injection protection through parameterized queries

## Error Handling

### Common Error Responses
- **400**: Validation errors (missing fields, invalid format)
- **401**: Unauthorized (missing or invalid token)
- **404**: Address not found (for PUT requests)
- **500**: Server errors

### Error Response Format
```json
{
  "error": "Error message description"
}
```

## Frontend Integration

The frontend automatically:
1. Fetches address data when loading the profile
2. Populates form fields with existing address data
3. Validates input before submission
4. Shows appropriate error messages
5. Handles both creation and update scenarios

## Testing

### Test the API endpoints:

1. **Get Address**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:5000/api/scrapify/address
   ```

2. **Create/Update Address**:
   ```bash
   curl -X POST \
        -H "Authorization: Bearer YOUR_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"street":"123 Main St","area":"Downtown","city":"Delhi","pincode":"110001"}' \
        http://localhost:5000/api/scrapify/address
   ```

## Notes

- The system maintains backward compatibility with existing address strings
- New structured address data is available alongside the legacy format
- All address operations are protected by JWT authentication
- The frontend handles both new and existing address scenarios seamlessly 