# Loan EMI Calculator

A modern, responsive React application for calculating loan EMI (Equated Monthly Installment) and viewing complete repayment schedules.

## Features

- **Real-time EMI Calculation**: Calculate monthly EMI based on principal, interest rate, and tenure
- **Complete Repayment Schedule**: View month-by-month breakdown of payments
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Fallback Calculation**: Works offline with client-side calculations when backend is unavailable
- **Modern UI**: Beautiful gradient design with smooth animations and hover effects
- **Currency Formatting**: Proper Indian Rupee (₹) formatting for all amounts

## Technology Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS 3
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd loan_calc
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Usage

1. **Enter Loan Details**:
   - Principal Amount (in ₹)
   - Annual Interest Rate (in %)
   - Tenure (in months)

2. **Calculate EMI**: Click the "Calculate EMI" button to generate the repayment schedule

3. **View Results**: 
   - Monthly EMI amount
   - Complete repayment schedule table
   - Summary cards showing totals

## API Integration

The application can integrate with a backend API for calculations. If the backend is available at `http://localhost:8080/api/loan/emi`, it will use that. Otherwise, it falls back to client-side calculations.

### Backend API Endpoint

```
GET /api/loan/emi?principal={amount}&annualInterestRate={rate}&tenureMonths={months}
```

### Response Format

```json
[
  {
    "month": 1,
    "emi": 25000,
    "principalComponent": 15000,
    "interestComponent": 10000,
    "remainingPrincipal": 1000000
  }
]
```

## Project Structure

```
loan_calc/
├── src/
│   ├── Pages/
│   │   └── LoanRepaymentTable.jsx    # Main loan calculator component
│   ├── App.jsx                       # Main application component
│   ├── main.jsx                      # Application entry point
│   └── index.css                     # Global styles and Tailwind imports
├── public/                           # Static assets
├── package.json                      # Dependencies and scripts
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
└── vite.config.js                   # Vite build configuration
```

## Customization

### Styling
- Modify `src/index.css` for custom CSS
- Update `tailwind.config.js` for theme customization
- Adjust component classes in JSX files

### Calculations
- Modify the `calculateEMI` function in `LoanRepaymentTable.jsx` for different calculation methods
- Add new loan types or calculation options

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue in the repository.
