import SubmitButton from "../components/SubmitButton";



export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0f1a] to-black flex items-center justify-center px-4">
      
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.15),_transparent_60%)]"></div>

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-indigo-500/30 bg-black/70 backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
        
        {/* Title */}
        <h1 className="text-center text-2xl font-extrabold tracking-wider text-indigo-400">
          SYSTEM ACCESS
        </h1>
        <p className="mt-1 text-center text-xs text-indigo-300/70">
          Only the worthy may proceed
        </p>

        {/* Form */}
        <form className="mt-8 space-y-5">
          <div>
            <label className="block text-xs text-indigo-300 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your name, hunter"
              className="w-full rounded-lg bg-[#0b0f1a] border border-indigo-500/30 px-4 py-3 text-sm text-indigo-200 placeholder-indigo-400/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-indigo-300 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg bg-[#0b0f1a] border border-indigo-500/30 px-4 py-3 text-sm text-indigo-200 placeholder-indigo-400/40 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Button */}
            <SubmitButton>Enter Dungeon</SubmitButton>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] text-indigo-400/50">
          The System is watching you.
        </p>
      </div>
    </div>
  );
}

