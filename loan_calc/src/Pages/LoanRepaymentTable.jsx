import React, { useState, useEffect } from 'react';

const LoanRepaymentTable = () => {
    const [loanData, setLoanData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loanParams, setLoanParams] = useState({
        principal: 1017000,
        annualInterestRate: 9.1,
        tenureMonths: 60
    });

    const fetchLoanData = async () => {
        try {
            setLoading(true);
            setError(null);

            const { principal, annualInterestRate, tenureMonths } = loanParams;
            const response = await fetch(
                `http://localhost:8080/api/loan/emi?principal=${principal}&annualInterestRate=${annualInterestRate}&tenureMonths=${tenureMonths}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setLoanData(data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching loan data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoanData();
    }, []);

    const handleParamChange = (field, value) => {
        setLoanParams(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    const handleRecalculate = () => {
        fetchLoanData();
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading loan data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-red-50 p-8 rounded-lg shadow-lg max-w-md w-full">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
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
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Summary Cards */}
            <div className="bg-gray-50 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Loan Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-sm font-medium text-gray-500">Monthly EMI</h4>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(loanData[0]?.emi || 0)}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-sm font-medium text-gray-500">Total Principal</h4>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(totals.totalPrincipal)}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-sm font-medium text-gray-500">Total Interest</h4>
                        <p className="text-2xl font-bold text-red-600">
                            {formatCurrency(totals.totalInterest)}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                        <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(totals.totalAmount)}
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Loan Parameters Input */}
                <div className="bg-white shadow-lg rounded-lg mb-6 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Loan Parameters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-red-500 mb-1">
                                Principal Amount (₹)
                            </label>
                            <input
                                type="number"
                                value={loanParams.principal}
                                onChange={(e) => handleParamChange('principal', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Annual Interest Rate (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={loanParams.annualInterestRate}
                                onChange={(e) => handleParamChange('annualInterestRate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tenure (Months)
                            </label>
                            <input
                                type="number"
                                value={loanParams.tenureMonths}
                                onChange={(e) => handleParamChange('tenureMonths', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleRecalculate}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                Calculate EMI
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                        <h1 className="text-2xl font-bold text-white">
                            Loan Repayment Schedule
                        </h1>
                        <p className="text-blue-100 mt-1">
                            Monthly breakdown of EMI payments
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Month
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Principal Component
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Interest Component
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        EMI
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remaining Principal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-blue divide-y divide-gray-200">
                                {loanData.map((row, index) => (
                                    <tr key={row.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
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