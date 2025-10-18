export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
            Next.js
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Your Next.js application with Tailwind CSS is ready!
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105">
            Get Started
          </button>
          <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-6 rounded-lg transition duration-200">
            Learn More
          </button>
        </div>
        
        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/30">
            <h3 className="text-xl font-semibold mb-3">⚡ Fast</h3>
            <p className="text-white/80">Lightning-fast performance with Next.js 13+</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/30">
            <h3 className="text-xl font-semibold mb-3">📱 Responsive</h3>
            <p className="text-white/80">Beautiful designs that work on all devices</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/30">
            <h3 className="text-xl font-semibold mb-3">🚀 Modern</h3>
            <p className="text-white/80">Built with the latest technologies</p>
          </div>
        </div>
      </div>
    </main>
  )
}