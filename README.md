# Abisphere Kitchen Management System

A comprehensive kitchen management system built for Abisphere Kitchen in Hosur, Tamil Nadu. This system helps manage inventory, orders, staff, suppliers, and kitchen operations efficiently.

## Features

### 🏠 Dashboard
- Role-based dashboards for different staff types
- Real-time statistics and analytics
- Low stock alerts and notifications

### 📦 Inventory Management
- Track stock levels with min/max thresholds
- Stock movement tracking (in/out operations)
- Supplier management and categorization
- Expiry date tracking

### 👨‍🍳 Kitchen Operations
- Recipe management with ingredient tracking
- Order queue management
- Bulk cooking preparation
- Kitchen staff dashboard

### 🛒 Order Management
- Customer order tracking
- Order status updates (pending → cooking → delivery → delivered)
- Staff assignment for orders
- Customer management and history

### 👥 Staff Management
- Role-based access control (Admin, Kitchen Staff, Inventory Manager, Delivery Staff)
- Staff profiles and contact information
- Payroll management

### 🚚 Delivery Tracking
- Delivery partner assignment
- Real-time delivery status
- Customer communication tools

### 📊 Reports & Analytics
- Sales reports and trends
- Inventory analytics
- Performance metrics
- Export functionality

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Supabase** for database management
- **JWT** authentication
- **bcryptjs** for password hashing

### Development Tools
- **Vite** for development server
- **ESLint** for code linting
- **TypeScript** for type safety

## Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- Supabase account (optional, for hosted database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gabriel-kitchen-management
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start the development server:
```bash
npm run dev
```

6. Start the API server (in another terminal):
```bash
npm run dev:api
```

### Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Database Schema

The system uses the following main tables:
- `suppliers` - Supplier information and contact details
- `inventory_items` - Stock items with quantities and thresholds
- `recipes` - Menu items with ingredients and instructions
- `orders` - Customer orders and delivery information
- `customers` - Customer profiles and order history
- `staff_members` - Employee information and roles
- `stock_movements` - Inventory movement tracking
- `purchase_orders` - Supplier order management

## User Roles

### Administrator
- Full system access
- Staff management
- Reports and analytics
- System settings

### Kitchen Staff
- Order management
- Recipe access
- Inventory usage tracking
- Kitchen dashboard

### Inventory Manager
- Inventory management
- Stock movements
- Supplier management
- Purchase orders

### Delivery Staff
- Delivery tracking
- Order status updates
- Customer communication

## Demo Accounts

The system comes with pre-configured demo accounts:

| Role | Email | Username | Password |
|------|-------|----------|----------|
| Admin | admin@abispherekitchen.com | admin | password123 |
| Kitchen Staff | ravi@abispherekitchen.com | ravi.kumar | password123 |
| Inventory Manager | priya@abispherekitchen.com | priya.sharma | password123 |
| Delivery Staff | suresh@abispherekitchen.com | suresh.babu | password123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Staff
- `GET /api/staff` - Get all staff members
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software for Abisphere Kitchen, Hosur, Tamil Nadu.

## Support

For support and questions, contact the development team or system administrator.

---

**Abisphere Kitchen Management System** - Streamlining kitchen operations in Hosur, Tamil Nadu 🍽️