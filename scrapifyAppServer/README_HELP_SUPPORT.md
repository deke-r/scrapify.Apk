# Help & Support Feature Setup

## Overview
The Help & Support feature provides users with an FAQ section and a contact form to reach the support team. The system sends professionally formatted emails to both the support team and the user.

## Environment Variables

Add the following environment variable to your `.env` file:

```env
# Support team email (optional - falls back to MAIL_USER if not set)
SUPPORT_EMAIL=support@yourcompany.com
```

If `SUPPORT_EMAIL` is not set, the system will use `MAIL_USER` as the support email address.

## API Endpoints

### Contact Support
- **POST** `/api/scrapify/contact-support`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Payment Issue",
    "message": "I'm having trouble with my payment..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Support request sent successfully. You will receive a confirmation email shortly."
  }
  ```

## Validation Rules

### Backend Validation
- **Name**: Required, minimum 2 characters
- **Email**: Required, valid email format
- **Subject**: Required, minimum 5 characters
- **Message**: Required, minimum 10 characters

### Frontend Validation
- All fields are required
- Email format validation
- Minimum character requirements for each field

## Email Templates

### Support Team Email
The support team receives a professionally formatted HTML email containing:
- Contact information (name, email, user ID, registered name, phone)
- Issue details (subject and message)
- Reply instructions
- Timestamp

### User Confirmation Email
Users receive a confirmation email containing:
- Thank you message
- Message details
- Alternative contact methods
- Support team signature

## Frontend Features

### FAQ Accordion
- Expandable/collapsible FAQ sections
- 6 pre-defined questions covering common issues
- Smooth animations and intuitive UI

### Contact Options
- Email contact form
- Phone number display
- Live chat availability notice

### Contact Form
- Modal-based form interface
- Real-time validation
- Loading states and success feedback
- Form reset after successful submission

## Security Features

### Input Sanitization
- All inputs are sanitized using validator.js
- Email normalization
- XSS prevention through proper escaping

### Authentication
- Route requires valid JWT token
- User ID extracted from token for email context

## Usage

1. Users can access Help & Support from the Profile tab
2. Browse FAQ section for quick answers
3. Use contact form for specific issues
4. Receive confirmation email with ticket details
5. Support team receives detailed email for follow-up

## Customization

### FAQ Content
Edit the `faqData` array in `app/help-support.jsx` to modify questions and answers.

### Email Templates
Modify the HTML templates in the backend route to customize email appearance.

### Contact Information
Update phone numbers and availability in the frontend contact options.

## Error Handling

- Network errors show user-friendly messages
- Validation errors display specific field requirements
- Email failures are logged but don't break the user experience
- Graceful fallbacks for missing environment variables 