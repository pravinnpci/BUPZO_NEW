# BUPZO Application Testing Guide

This guide provides instructions for testing the BUPZO application to ensure all features are working correctly.

## Prerequisites

1. Ensure Docker is installed and running
2. All services are up and running:
   ```bash
   docker compose up -d
   ```

## Testing Steps

### 1. Frontend Testing

#### Home Page
1. Open the application in your browser: `http://localhost:3003`
2. Verify the Hero Carousel is working:
   - Check that images are displayed correctly
   - Verify navigation arrows work
   - Verify dots navigation works
   - Check that the carousel automatically advances
3. Verify the "New Arrivals" section:
   - Check that products are displayed in a grid
   - Verify product cards show correct information
4. Verify the "Categories" section:
   - Check that all category cards are displayed
   - Verify hover effects work
   - Check that clicking a category card shows the appropriate page

#### Login Page
1. Navigate to: `http://localhost:3003/login`
2. Test the login flow:
   - Enter a phone number (e.g., `+919876543210`)
   - Check the privacy policy checkbox
   - Click "Get OTP"
   - Verify the OTP input field appears
   - Enter an OTP and click "Verify OTP"
   - Verify successful login redirects to the home page

### 2. Backend API Testing

#### Products API
1. Test the products endpoint:
   ```bash
   curl http://localhost:8003/products
   ```
2. Verify the response contains:
   - Array of products
   - Each product has id, name, description, price, image_url, is_combo

#### Order Creation
1. Test creating an order:
   ```bash
   curl -X POST http://localhost:8003/orders \
   -H "Content-Type: application/json" \
   -d '{
     "user_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
     "seller_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
     "order_items": [
       {
         "product_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
         "quantity": 1,
         "price": 450.00
       }
     ],
     "total_amount": 450.00,
     "order_source": "WEB",
     "payment_gateway": "Razorpay"
   }'
   ```
2. Verify the response contains:
   - Success status
   - Order ID
   - Success message

### 3. MCP Server Testing

#### Get Orders
1. Test getting orders:
   ```bash
   curl -X POST http://localhost:3004 \
   -H "Content-Type: application/json" \
   -d '{
     "tool": "get_bupzo_orders",
     "args": {
       "user_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04"
     }
   }'
   ```
2. Verify the response contains:
   - Array of orders
   - Each order has order items

#### Create Order
1. Test creating an order via MCP:
   ```bash
   curl -X POST http://localhost:3004 \
   -H "Content-Type: application/json" \
   -d '{
     "tool": "create_order",
     "args": {
       "user_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
       "seller_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
       "order_items": [
         {
           "product_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
           "quantity": 1,
           "price": 450.00
         }
       ],
       "total_amount": 450.00,
       "order_source": "WEB",
       "payment_gateway": "Razorpay"
     }
   }'
   ```
2. Verify the response contains:
   - Success status
   - Order ID
   - Success message

### 4. Database Verification

1. Check that the order was created in the database:
   ```bash
   docker exec -it bupzo_db psql -U bupzo_user -d bupzo_db -c "SELECT COUNT(*) FROM orders;"
   ```
2. Check that the order items were created:
   ```bash
   docker exec -it bupzo_db psql -U bupzo_user -d bupzo_db -c "SELECT COUNT(*) FROM order_items;"
   ```
3. Check that product stock was updated:
   ```bash
   docker exec -it bupzo_db psql -U bupzo_user -d bupzo_db -c "SELECT stock_quantity FROM products WHERE id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';"
   ```

### 5. UI/UX Verification

1. Verify the Mauve Serenity color palette is applied:
   - Check background colors
   - Check text colors
   - Check button colors
2. Verify dark/light mode toggle works:
   - Check the toggle switch in the header
   - Verify all elements switch between light and dark themes
3. Verify responsive design:
   - Resize the browser window
   - Check that the layout adapts to different screen sizes
   - Verify mobile responsiveness

### 6. Error Handling

1. Test error scenarios:
   - Enter invalid phone number in login
   - Enter invalid OTP
   - Try to create an order with insufficient stock
   - Try to create an order with invalid product IDs
2. Verify error messages are displayed appropriately

### 7. Integration Testing

1. Test the complete flow:
   - Login as a customer
   - Browse products
   - Add a product to cart (simulated)
   - Place an order
   - Verify order appears in the database
   - Verify product stock is updated

## Test Data

### Sample User IDs
- Customer: `b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04`
- Seller: `c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01`

### Sample Product IDs
- Halwa: `d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01`
- Dry Fruits: `d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02`
- Toys: `d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03`

## Troubleshooting

1. If services fail to start:
   ```bash
   docker compose down --remove-orphans
   docker compose up -d
   ```

2. If database issues occur:
   ```bash
   docker compose down -v
   docker compose up -d db
   ```

3. To check service logs:
   ```bash
   docker logs bupzo_backend
   docker logs bupzo_mcp
   docker logs bupzo_frontend
   ```

4. To access the database:
   ```bash
   docker exec -it bupzo_db psql -U bupzo_user -d bupzo_db
   ```

## Known Issues

1. The OTP verification is currently a placeholder and doesn't send actual OTPs
2. The payment gateway integration is not fully implemented
3. The shipping partner integration is not fully implemented

## Next Steps

1. Implement actual OTP verification using Firebase or WhatsApp API
2. Complete payment gateway integration
3. Implement shipping partner integration
4. Add more comprehensive testing for edge cases
5. Implement user role-based access control
6. Add more detailed error handling and logging