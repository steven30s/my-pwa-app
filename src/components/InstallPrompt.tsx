import { cn } from "@/lib/utils";

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export default function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg bg-white p-4 shadow-xl">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <i className="fa-solid fa-download text-xl text-teal-600"></i>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">添加到主屏幕</h3>
          <p className="mt-1 text-sm text-gray-500">
            将此应用安装到您的主屏幕，以便快速访问和使用。
          </p>
          <div className="mt-4 flex space-x-3">
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              稍后
            </button>
            <button
              type="button"
              onClick={onInstall}
              className={cn(
                "rounded-md bg-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700",
                "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              )}
            >
              安装
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}