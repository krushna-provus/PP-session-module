import React from "react";

interface AlertBannersProps {
  error: string;
  successMessage: string;
  discussionNeeded?: boolean;
  isHost?: boolean;
  onGenerateMeet?: () => void;
  meetLink?: string | null;
  generatedLink?: string | null;
  onSendToParticipants?: () => void;
}

export default function AlertBanners({ error, successMessage, discussionNeeded, isHost, onGenerateMeet, meetLink, generatedLink, onSendToParticipants }: AlertBannersProps) {
  return (
    <>
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {discussionNeeded && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
          <div>Discussion is needed — max and min votes differ by more than 4.</div>

          {isHost && (
            <div className="mt-3">
              <button
                onClick={onGenerateMeet}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold mr-3"
              >
                Generate Google Meet
              </button>

              {generatedLink && (
                <>
                  <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline">
                    {generatedLink}
                  </a>
                  <button
                    onClick={onSendToParticipants}
                    className="ml-3 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg font-semibold"
                  >
                    Send to all participants
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* show meeting banner only to participants (not host) */}
      {meetLink && !isHost && (
        <div className="bg-blue-800 border border-blue-600 text-blue-100 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Meeting available</div>
              <a href={meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-200 underline break-all">
                {meetLink}
              </a>
            </div>
            <div>
              <a href={meetLink} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-semibold">
                Join
              </a>
            </div>
          </div>
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
