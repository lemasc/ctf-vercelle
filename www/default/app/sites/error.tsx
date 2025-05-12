"use client";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600">Error</h2>
          <p className="mt-3 text-gray-600">{error.message}</p>
        </div>
      </div>
    </div>
  );
}
