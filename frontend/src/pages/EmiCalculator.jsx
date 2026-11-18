
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  Home,
  IndianRupee,
  Percent,
  CalendarDays,
  Wallet,
  RotateCcw,
} from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function EMICalculator() {
  const [propertyPrice, setPropertyPrice] = useState(5000000);
  const [downPayment, setDownPayment] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);

  const results = useMemo(() => {
    const loanAmount = Math.max(0, propertyPrice - downPayment);
    const monthlyRate = interestRate / 12 / 100;
    const months = loanTenure * 12;

    let emi = 0;

    if (loanAmount > 0 && months > 0) {
      if (monthlyRate === 0) {
        emi = loanAmount / months;
      } else {
        const factor = Math.pow(1 + monthlyRate, months);

        emi =
          (loanAmount * monthlyRate * factor) /
          (factor - 1);
      }
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanAmount;

    return {
      loanAmount,
      emi,
      totalPayment,
      totalInterest: Math.max(0, totalInterest),
    };
  }, [propertyPrice, downPayment, interestRate, loanTenure]);

  const principalPercentage =
    results.totalPayment > 0
      ? (results.loanAmount / results.totalPayment) * 100
      : 0;

  const interestPercentage = 100 - principalPercentage;

  const resetCalculator = () => {
    setPropertyPrice(5000000);
    setDownPayment(1000000);
    setInterestRate(8.5);
    setLoanTenure(20);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-sm text-gray-500 hover:text-blue-600">
            Home / EMI Calculator
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Calculator size={25} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Home Loan EMI Calculator
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Calculate your monthly home loan payment.
              </p>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-2">

          {/* Input Section */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Loan Details
              </h2>

              <button
                onClick={resetCalculator}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>

            {/* Property Price */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Home size={18} className="text-blue-600" />
                  Property Price
                </label>

                <span className="font-bold text-gray-900">
                  {formatCurrency(propertyPrice)}
                </span>
              </div>

              <input
                type="range"
                min="1000000"
                max="50000000"
                step="100000"
                value={propertyPrice}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPropertyPrice(value);
                  setDownPayment((previous) =>
                    Math.min(previous, value)
                  );
                }}
                className="w-full accent-blue-600"
              />

              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>₹10 Lac</span>
                <span>₹5 Crore</span>
              </div>
            </div>

            {/* Down Payment */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Wallet size={18} className="text-blue-600" />
                  Down Payment
                </label>

                <span className="font-bold text-gray-900">
                  {formatCurrency(downPayment)}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max={propertyPrice}
                step="50000"
                value={downPayment}
                onChange={(e) =>
                  setDownPayment(Number(e.target.value))
                }
                className="w-full accent-blue-600"
              />

              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>₹0</span>
                <span>{formatCurrency(propertyPrice)}</span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Down payment:{" "}
                {propertyPrice > 0
                  ? ((downPayment / propertyPrice) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>

            {/* Interest Rate */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Percent size={18} className="text-blue-600" />
                  Interest Rate
                </label>

                <span className="font-bold text-gray-900">
                  {interestRate.toFixed(2)}%
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={interestRate}
                onChange={(e) =>
                  setInterestRate(Number(e.target.value))
                }
                className="w-full accent-blue-600"
              />

              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>1%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Loan Tenure */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CalendarDays size={18} className="text-blue-600" />
                  Loan Tenure
                </label>

                <span className="font-bold text-gray-900">
                  {loanTenure} Years
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={loanTenure}
                onChange={(e) =>
                  setLoanTenure(Number(e.target.value))
                }
                className="w-full accent-blue-600"
              />

              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>1 Year</span>
                <span>30 Years</span>
              </div>
            </div>

            {/* Loan Amount */}
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-gray-600">
                Your Loan Amount
              </p>

              <h3 className="mt-1 text-2xl font-bold text-blue-700">
                {formatCurrency(results.loanAmount)}
              </h3>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">

            {/* Monthly EMI */}
            <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm sm:p-8">
              <p className="text-sm font-medium text-blue-100">
                Your Monthly EMI
              </p>

              <h2 className="mt-3 text-4xl font-bold">
                {formatCurrency(results.emi)}
              </h2>

              <p className="mt-3 text-sm text-blue-100">
                Estimated monthly payment for {loanTenure} years
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Principal Amount
                </p>
                <h3 className="mt-2 text-xl font-bold text-gray-900">
                  {formatCurrency(results.loanAmount)}
                </h3>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Total Interest
                </p>
                <h3 className="mt-2 text-xl font-bold text-orange-600">
                  {formatCurrency(results.totalInterest)}
                </h3>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:col-span-2">
                <p className="text-sm text-gray-500">
                  Total Payment
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  {formatCurrency(results.totalPayment)}
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Principal + Interest over the entire loan tenure
                </p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-lg font-bold text-gray-900">
                Payment Breakdown
              </h3>

              <div className="mb-4 flex h-4 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="bg-blue-600 transition-all"
                  style={{ width: `${principalPercentage}%` }}
                />
                <div
                  className="bg-orange-400 transition-all"
                  style={{ width: `${interestPercentage}%` }}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-600" />
                    <span className="text-sm text-gray-600">
                      Principal Amount
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.loanAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-orange-400" />
                    <span className="text-sm text-gray-600">
                      Interest Amount
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(results.totalInterest)}
                  </span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs leading-5 text-gray-400">
              This calculator provides an estimate based on the values
              entered. Actual EMI may vary depending on lender terms,
              processing fees, insurance, taxes, and applicable interest
              rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
