import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-full bg-gray-100 mb-6">
        <FileQuestion className="h-16 w-16 text-gray-400" />
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
      <p className="text-gray-600 max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/">
          <Button leftIcon={<Home className="h-4 w-4" />}>Go Home</Button>
        </Link>
        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
