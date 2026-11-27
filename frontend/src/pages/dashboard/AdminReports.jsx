
import { useState } from "react";

import {
  Users,
  Building2,
  CalendarDays,
  Star,
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertCircle,
  CalendarRange,
  X,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";

import {
  exportUsersReport,
  exportPropertiesReport,
  exportVisitsReport,
  exportReviewsReport,
} from "../../services/api/adminReportApi";

const reportItems = [
  {
    id: "users",
    title: "Users Report",
    description: "Export registered users and their account details.",
    filename: "HomeHunt_Users_Report.xlsx",
    icon: Users,
    exportFunction: exportUsersReport,
  },
  {
    id: "properties",
    title: "Properties Report",
    description: "Export property listings and owner information.",
    filename: "HomeHunt_Properties_Report.xlsx",
    icon: Building2,
    exportFunction: exportPropertiesReport,
  },
  {
    id: "visits",
    title: "Visits Report",
    description: "Export property visit requests and their statuses.",
    filename: "HomeHunt_Visits_Report.xlsx",
    icon: CalendarDays,
    exportFunction: exportVisitsReport,
  },
  {
    id: "reviews",
    title: "Reviews Report",
    description: "Export customer reviews and ratings.",
    filename: "HomeHunt_Reviews_Report.xlsx",
    icon: Star,
    exportFunction: exportReviewsReport,
  },
];

function AdminReports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [downloading, setDownloading] = useState(null);
  const [message, setMessage] = useState(null);

  const invalidDateRange =
    startDate && endDate && startDate > endDate;

  const handleDownload = async (report) => {
    if (invalidDateRange) {
      setMessage({
        type: "error",
        text: "Start date cannot be after end date.",
      });
      return;
    }

    try {
      setDownloading(report.id);
      setMessage(null);

      const params = {};

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const blob = await report.exportFunction(params);

      if (!blob || blob.size === 0) {
        throw new Error("The exported report is empty.");
      }

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = report.filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage({
        type: "success",
        text: `${report.title} downloaded successfully.`,
      });
    } catch (error) {
      let errorMessage = "Failed to download report.";

      if (error.response?.data instanceof Blob) {
        try {
          const errorData = JSON.parse(
            await error.response.data.text()
          );

          errorMessage = errorData.message || errorMessage;
        } catch {
          // Keep the default error message.
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setDownloading(null);
    }
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
    setMessage(null);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Reports & Data Export
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Download and manage HomeHunt platform reports.
          </p>
        </div>

        {/* DATE FILTER */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">
            <CalendarRange size={20} className="text-[#006A4E]" />

            <h2 className="font-semibold text-gray-800">
              Filter Reports by Date
            </h2>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">

            <div className="flex-1">
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setMessage(null);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/20"
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setMessage(null);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/20"
              />
            </div>

            <button
              type="button"
              onClick={clearDates}
              disabled={!startDate && !endDate}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={16} />
              Clear Dates
            </button>

          </div>

          <p className="mt-3 text-xs text-gray-500">
            Leave dates empty to export all records. The filter uses the
            record creation date.
          </p>

          {invalidDateRange && (
            <p className="mt-3 text-sm text-red-600">
              Start date cannot be after end date.
            </p>
          )}
        </div>

        {/* STATUS MESSAGE */}
        {message && (
          <div
            className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}

            {message.text}
          </div>
        )}

        {/* REPORT CARDS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {reportItems.map((report) => {
            const Icon = report.icon;
            const isDownloading = downloading === report.id;

            return (
              <div
                key={report.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">

                  <div className="rounded-lg bg-green-50 p-3">
                    <Icon size={24} className="text-[#006A4E]" />
                  </div>

                  <FileSpreadsheet
                    size={22}
                    className="text-gray-400"
                  />

                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-800">
                  {report.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {report.description}
                </p>

                <button
                  type="button"
                  onClick={() => handleDownload(report)}
                  disabled={!!downloading || !!invalidDateRange}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#006A4E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#00563f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={17} />
                      Download Excel
                    </>
                  )}
                </button>
              </div>
            );
          })}

        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminReports;
