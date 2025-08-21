import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const LoanRepaymentTable = () => {
    const [loanData, setLoanData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loanParams, setLoanParams] = useState({
        principal: 1017000,
        annualInterestRate: 9.1,
        tenureMonths: 60
    });

    // Add display values state for better input handling
    const [displayValues, setDisplayValues] = useState({
        principal: '1017000',
        annualInterestRate: '9.1',
        tenureMonths: '60'
    });

    // Fallback calculation function when backend is not available
    const calculateEMI = (principal, annualInterestRate, tenureMonths) => {
        const monthlyRate = annualInterestRate / 12 / 100;
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1);

        const schedule = [];
        let remainingPrincipal = principal;

        for (let month = 1; month <= tenureMonths; month++) {
            const interestComponent = remainingPrincipal * monthlyRate;
            const principalComponent = emi - interestComponent;
            remainingPrincipal -= principalComponent;

            schedule.push({
                month,
                emi: Math.round(emi),
                principalComponent: Math.round(principalComponent),
                interestComponent: Math.round(interestComponent),
                remainingPrincipal: Math.max(0, Math.round(remainingPrincipal))
            });
        }

        return schedule;
    };

    const fetchLoanData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { principal, annualInterestRate, tenureMonths } = loanParams;

            // Try to fetch from backend first
            try {
                const response = await fetch(
                    `http://localhost:8080/api/loan/emi?principal=${principal}&annualInterestRate=${annualInterestRate}&tenureMonths=${tenureMonths}`
                );

                if (response.ok) {
                    const data = await response.json();
                    setLoanData(data);
                    return;
                }
            } catch (backendError) {
                console.log('Backend not available, using fallback calculation');
            }

            // Fallback to client-side calculation
            const calculatedData = calculateEMI(principal, annualInterestRate, tenureMonths);
            setLoanData(calculatedData);

        } catch (err) {
            setError(err.message);
            console.error('Error calculating loan data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Set display values to match initial loan params
        setDisplayValues({
            principal: loanParams.principal.toString(),
            annualInterestRate: loanParams.annualInterestRate.toString(),
            tenureMonths: loanParams.tenureMonths.toString()
        });
        fetchLoanData();
    }, []);

    const handleParamChange = (field, value) => {
        // Update display values immediately for better UX
        setDisplayValues(prev => ({
            ...prev,
            [field]: value
        }));

        // Only update loan params if we have a valid number
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue > 0) {
            setLoanParams(prev => ({
                ...prev,
                [field]: numValue
            }));
        }
    };

    const handleRecalculate = () => {
        // Validate all inputs before calculating
        const principal = parseFloat(displayValues.principal);
        const annualInterestRate = parseFloat(displayValues.annualInterestRate);
        const tenureMonths = parseFloat(displayValues.tenureMonths);

        if (isNaN(principal) || principal <= 0) {
            alert('Please enter a valid principal amount');
            return;
        }
        if (isNaN(annualInterestRate) || annualInterestRate <= 0) {
            alert('Please enter a valid interest rate');
            return;
        }
        if (isNaN(tenureMonths) || tenureMonths <= 0) {
            alert('Please enter a valid tenure');
            return;
        }

        // Update loan params with validated values
        setLoanParams({
            principal,
            annualInterestRate,
            tenureMonths
        });

        // Trigger calculation
        fetchLoanData();
    };

    const clearInputs = () => {
        setDisplayValues({
            principal: '',
            annualInterestRate: '',
            tenureMonths: ''
        });
        setLoanData([]);
    };

    const exportToExcel = () => {
        if (loanData.length === 0) {
            alert('No data to export. Please calculate EMI first.');
            return;
        }

        // Prepare data for export
        const exportData = [
            // Header row
            ['Month', 'Principal Component (₹)', 'Interest Component (₹)', 'EMI (₹)', 'Remaining Principal (₹)'],
            // Data rows
            ...loanData.map(row => [
                row.month,
                row.principalComponent,
                row.interestComponent,
                row.emi,
                row.remainingPrincipal
            ]),
            // Empty row for spacing
            [],
            // Summary row
            ['Total Principal', totals.totalPrincipal, '', '', ''],
            ['Total Interest', '', totals.totalInterest, '', ''],
            ['Total Amount', '', '', totals.totalAmount, ''],
            ['Monthly EMI', '', '', loanData[0]?.emi || 0, ''],
            // Loan parameters
            [],
            ['Loan Parameters', '', '', '', ''],
            ['Principal Amount (₹)', loanParams.principal, '', '', ''],
            ['Annual Interest Rate (%)', loanParams.annualInterestRate, '', '', ''],
            ['Tenure (Months)', loanParams.tenureMonths, '', '', '']
        ];

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(exportData);

        // Set column widths
        ws['!cols'] = [
            { width: 15 }, // Month
            { width: 25 }, // Principal Component
            { width: 25 }, // Interest Component
            { width: 20 }, // EMI
            { width: 25 }  // Remaining Principal
        ];

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Loan Repayment Schedule');

        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const filename = `Loan_Repayment_Schedule_${date}.xlsx`;

        // Save the file
        XLSX.writeFile(wb, filename);
    };

    const exportToCSV = () => {
        if (loanData.length === 0) {
            alert('No data to export. Please calculate EMI first.');
            return;
        }

        // Prepare CSV data
        const csvData = [
            // Header row
            ['Month', 'Principal Component (₹)', 'Interest Component (₹)', 'EMI (₹)', 'Remaining Principal (₹)'],
            // Data rows
            ...loanData.map(row => [
                row.month,
                row.principalComponent,
                row.interestComponent,
                row.emi,
                row.remainingPrincipal
            ]),
            // Empty row
            [],
            // Summary
            ['Total Principal', totals.totalPrincipal, '', '', ''],
            ['Total Interest', '', totals.totalInterest, '', ''],
            ['Total Amount', '', '', totals.totalAmount, ''],
            ['Monthly EMI', '', '', loanData[0]?.emi || 0, ''],
            // Loan parameters
            [],
            ['Loan Parameters', '', '', '', ''],
            ['Principal Amount (₹)', loanParams.principal, '', '', ''],
            ['Annual Interest Rate (%)', loanParams.annualInterestRate, '', '', ''],
            ['Tenure (Months)', loanParams.tenureMonths, '', '', '']
        ];

        // Convert to CSV string
        const csvContent = csvData.map(row =>
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        const filename = `Loan_Repayment_Schedule_${date}.csv`;

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const calculateTotals = () => {
        if (loanData.length === 0) return { totalPrincipal: 0, totalInterest: 0, totalAmount: 0 };

        const totalPrincipal = loanData.reduce((sum, row) => sum + row.principalComponent, 0);
        const totalInterest = loanData.reduce((sum, row) => sum + row.interestComponent, 0);
        const totalAmount = totalPrincipal + totalInterest;

        return { totalPrincipal, totalInterest, totalAmount };
    };

    const totals = calculateTotals();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Calculating loan schedule...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Calculating Data</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchLoanData}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Loan EMI Calculator</h1>
                <p className="text-gray-600">Calculate your monthly EMI and view complete repayment schedule</p>
            </div>

            {/* Summary Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Loan Summary</h3>
                    {loanData.length > 0 && (
                        <>
                            <button
                                onClick={exportToExcel}
                                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export to Excel
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Export to CSV
                            </button>
                        </>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Monthly EMI</h4>
                        <p className="text-3xl font-bold text-blue-600">
                            {formatCurrency(loanData[0]?.emi || 0)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Total Principal</h4>
                        <p className="text-3xl font-bold text-green-600">
                            {formatCurrency(totals.totalPrincipal)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Total Interest</h4>
                        <p className="text-3xl font-bold text-red-600">
                            {formatCurrency(totals.totalInterest)}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Total Amount</h4>
                        <p className="text-3xl font-bold text-purple-600">
                            {formatCurrency(totals.totalAmount)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Loan Parameters Input */}
                <div className="bg-white shadow-lg rounded-xl mb-8 p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Loan Parameters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Principal Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={displayValues.principal}
                                onChange={(e) => handleParamChange('principal', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter principal amount"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Annual Interest Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={displayValues.annualInterestRate}
                                onChange={(e) => handleParamChange('annualInterestRate', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter interest rate"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tenure (Months)
                            </label>
                            <input
                                type="number"
                                value={displayValues.tenureMonths}
                                onChange={(e) => handleParamChange('tenureMonths', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Enter tenure"
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <button
                                onClick={handleRecalculate}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Calculate EMI
                            </button>
                            <button
                                onClick={clearInputs}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Repayment Schedule Table */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                    <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
                        <h2 className="text-2xl font-bold text-white">
                            Loan Repayment Schedule
                        </h2>
                        <p className="text-blue-100 mt-2">
                            Monthly breakdown of EMI payments
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Month
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Principal Component
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Interest Component
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        EMI
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remaining Principal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loanData.map((row, index) => (
                                    <tr key={row.month} className={`table-row-hover ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {row.month}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                            {formatCurrency(row.principalComponent)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                                            {formatCurrency(row.interestComponent)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                                            {formatCurrency(row.emi)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                            {formatCurrency(row.remainingPrincipal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanRepaymentTable;