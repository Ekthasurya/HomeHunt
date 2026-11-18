
import { Link } from "react-router-dom";
import { Home, ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex relative bg-slate-950 items-center justify-center p-12 overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 to-slate-950/80" />

        <div className="relative z-10 max-w-lg text-white">

          <Link to="/" className="inline-flex items-center gap-3 mb-16">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Home size={25} />
            </div>

            <span className="text-3xl font-bold">
              Home<span className="text-blue-400">Hunt</span>
            </span>
          </Link>

          <h1 className="text-5xl font-bold leading-tight">
            Find a place where your next chapter begins.
          </h1>

          <p className="text-slate-300 text-lg leading-8 mt-6">
            Discover properties, connect with trusted agents
            and make your next move with confidence.
          </p>

          <div className="flex items-center gap-3 mt-10 text-blue-200">
            <ShieldCheck size={22} />
            <span>Discover your home with confidence</span>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col min-h-screen">

        <div className="lg:hidden p-5 border-b border-slate-100">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Home size={21} />
            </div>

            <span className="text-2xl font-bold text-slate-900">
              Home<span className="text-blue-600">Hunt</span>
            </span>
          </Link>
        </div>

        <main className="flex-1 flex items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        <footer className="text-center text-xs text-slate-400 py-5">
          © {new Date().getFullYear()} HomeHunt. All rights reserved.
        </footer>

      </div>
    </div>
  );
}
