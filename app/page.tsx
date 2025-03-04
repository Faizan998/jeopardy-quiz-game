import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat text-white p-6"
    >
      {/* Dark Overlay for Better Readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* Content Wrapper */}
      <div className="relative z-10 text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-wider drop-shadow-lg animate-pulse">
          Jeopardy Quiz Game
        </h1>
        <p className="text-lg md:text-xl font-medium opacity-90 animate-fade-in">
          Test your knowledge, challenge friends, and climb the leaderboard!
        </p>

        {/* Centered Buttons */}
        <div className=" flex-col space-x-50 mt-4 ">
          <Link href="/signup">
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-lg shadow-lg transition-transform transform hover:scale-110">
              Signup
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg transition-transform transform hover:scale-110">
              Login
            </button>
          </Link>
        </div>

        {/* Animated Features Section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-black bg-opacity-40 rounded-lg shadow-md hover:bg-opacity-60 transition duration-300">
            <h3 className="text-xl font-bold">🏆 Leaderboard</h3>
            <p className="text-sm mt-2 opacity-80">
              Compete with players worldwide and claim the top spot!
            </p>
          </div>
          <div className="p-6 bg-black bg-opacity-40 rounded-lg shadow-md hover:bg-opacity-60 transition duration-300">
            <h3 className="text-xl font-bold">🎯 Multiple Categories</h3>
            <p className="text-sm mt-2 opacity-80">
              Choose from a variety of topics and test your skills!
            </p>
          </div>
          <div className="p-6 bg-black bg-opacity-40 rounded-lg shadow-md hover:bg-opacity-60 transition duration-300">
            <h3 className="text-xl font-bold">🕹️ Play Anytime</h3>
            <p className="text-sm mt-2 opacity-80">
              Enjoy the game anytime, anywhere on any device!
            </p>
          </div>
        </div>

        {/* Fun Animated CTA */}
        <p className="mt-10 text-lg font-semibold animate-bounce">
          Are you ready to play? 🎮
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm opacity-70">
        <p>© 2025 Jeopardy Game. All rights reserved.</p>
      </footer>
    </div>
  );
}
