import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1e1e1e,_#121212)]" />

      {/* Content Wrapper */}
      <div className="relative z-10 text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 animate-fade-in">
          Jeopardy Quiz Game
        </h1>
        <p className="text-lg md:text-xl font-medium opacity-80 animate-slide-in-up">
          Test your knowledge, challenge friends, and climb the leaderboard!
        </p>

        {/* Centered Buttons */}
        <div className="flex space-x-6 mt-6 animate-fade-in">
          <Link href="/signup">
            <button className="px-6 py-3 cursor-pointer bg-blue-500/30 hover:bg-blue-500 text-white font-bold text-lg rounded-lg shadow-lg backdrop-blur-md transition-transform transform hover:scale-110 hover:shadow-blue-500">
              Signup
            </button>
          </Link>
          <Link href="/blog">
            <button className="px-6 py-3 cursor-pointer bg-blue-500/30 hover:bg-blue-500 text-white font-bold text-lg rounded-lg shadow-lg backdrop-blur-md transition-transform transform hover:scale-110 hover:shadow-blue-500">
              Blog
            </button>
          </Link>
          <Link href="/contact">
            <button className="px-6 py-3 cursor-pointer bg-blue-500/30 hover:bg-blue-500 text-white font-bold text-lg rounded-lg shadow-lg backdrop-blur-md transition-transform transform hover:scale-110 hover:shadow-blue-500">
              Contact-Us
            </button>
          </Link>
          <Link href="/login">
            <button className="px-6 py-3 cursor-pointer bg-green-500/30 hover:bg-green-500 text-white font-bold text-lg rounded-lg shadow-lg backdrop-blur-md transition-transform transform hover:scale-110 hover:shadow-green-500">
              Login
            </button>
          </Link>
        </div>

        {/* Animated Features Section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center animate-slide-in-up">
          {["🏆 Leaderboard", "🎯 Multiple Categories", "🕹️ Play Anytime"].map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white/10 rounded-lg shadow-md hover:bg-white/20 transition duration-300 backdrop-blur-lg"
            >
              <h3 className="text-xl font-bold text-white">{feature}</h3>
              <p className="text-sm mt-2 opacity-80">
                {index === 0 && "Compete with players worldwide and claim the top spot!"}
                {index === 1 && "Choose from a variety of topics and test your skills!"}
                {index === 2 && "Enjoy the game anytime, anywhere on any device!"}
              </p>
            </div>
          ))}
        </div>

        {/* Fun Animated CTA */}
        <p className="mt-10 text-lg font-semibold animate-bounce">
          Are you ready to play? 🎮
        </p>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm opacity-70 animate-fade-in">
        <p>© 2025 Jeopardy Game. All rights reserved.</p>
      </footer>
    </div>
  );
}





















