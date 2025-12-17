export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">
          Cadence
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your engineering management control centre
        </p>
        <div className="flex items-center justify-center gap-4 pt-8">
          <div className="w-16 h-1 bg-primary rounded-full"></div>
          <span className="text-sm text-gray-500 uppercase tracking-wider">
            Building in progress
          </span>
          <div className="w-16 h-1 bg-primary rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
