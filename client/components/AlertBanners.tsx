import React from "react";

interface AlertBannersProps {
  error: string;
  successMessage: string;
}

export default function AlertBanners({ error, successMessage }: AlertBannersProps) {
  return (
    <>
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-900 border border-green-600 text-green-100 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
    </>
  );
}
