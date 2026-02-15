"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-md animate-fadeInUp rounded-2xl bg-white p-8 text-center shadow-2xl">

        {/* 404 */}
        <h1 className="animate-pulse text-7xl font-extrabold text-indigo-600">
          404
        </h1>

        {/* Text */}
        <p className="mt-2 text-lg font-medium text-gray-700">
          Oops! Page Not Found
        </p>

        <p className="mt-1 text-sm text-gray-500">
          The page you are looking for doesn’t exist.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex justify-center gap-4">

          {/* Back */}
          <button
            onClick={goBack}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-lg active:scale-95"
          >
            ⬅ Go Back
          </button>

          {/* Home */}
          <Link
            href="/"
            className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-600 hover:shadow-lg active:scale-95"
          >
            🏠 Home
          </Link>

        </div>
      </div>
    </div>
  );
}
