
import { Bell, Menu, Search } from "lucide-react";

function DashboardHeader({ role, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="font-semibold capitalize text-gray-900">
            {role} Dashboard
          </h2>
          <p className="hidden text-xs text-gray-500 sm:block">
            Welcome back! Here's your overview.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 md:flex">
          <Search size={17} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-36 bg-transparent text-sm outline-none"
          />
        </div>

        <button className="relative rounded-lg p-2 hover:bg-gray-100">
          <Bell size={21} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <img
          src="https://ui-avatars.com/api/?name=HomeHunt+User&background=2563eb&color=fff"
          alt="User avatar"
          className="h-10 w-10 rounded-full"
        />
      </div>
    </header>
  );
}

export default DashboardHeader;
