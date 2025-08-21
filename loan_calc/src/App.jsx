import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoanRepaymentTable from './Pages/LoanRepaymentTable'

function App() {
  return (
    <div className="loan-calculator">
      <Router>
        <Routes>
          <Route path="/" element={<LoanRepaymentTable />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
