import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
const STORAGE_KEY = "memory_match_best";

const EMOJIS = [
  "🐶", "🐱", "🐭", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸",
  "🐵", "🐔", "🐧", "🐦", "🦆", "🐤"
];
// Shuffle helper
function shuffle(array) {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const MOCK_LEADERBOARD = [
  { name: "Aarav", moves: 14 },
  { name: "Isha", moves: 16 },
  { name: "Liam", moves: 18 },
  { name: "Mia", moves: 20 },
  { name: "Zara", moves: 22 },
];

export default function MemoryMatchGame() {
  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(null);
  const [phase, setPhase] = useState("menu"); // menu | playing | paused | win
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);
  const [itfirst,setfirst]=useState(false);

  // Load best
  useEffect(() => {
    const b = Number(localStorage.getItem(STORAGE_KEY));
    if (!Number.isNaN(b) && b > 0) setBest(b);
  }, []);
  const Handle=(ele)=>{
    console.log(ele)
  }
  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const initGame = () => {
    const chosen = shuffle(EMOJIS).slice(0, 8); 
    const doubled = shuffle([...chosen, ...chosen]);
    setDeck(doubled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setPhase("playing");
  };

  const pauseToggle = () => {
    if (phase === "playing") {
      setPhase("paused");
      clearInterval(timerRef.current);
    } else if (phase === "paused") {
      setPhase("playing");
    }
  };

  const handleFlip = (i) => {
    if (flipped.includes(i) || matched.includes(i) || flipped.length === 2) return;
    const newFlipped = [...flipped, i];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (deck[a] === deck[b]) {
        setMatched((m) => [...m, a, b]);
        setFlipped([]);
        if (matched.length + 2 === deck.length) {
          // win!
          setPhase("win");
          clearInterval(timerRef.current);
          if (!best || moves + 1 < best) {
            setBest(moves + 1);
            localStorage.setItem(STORAGE_KEY, String(moves + 1));
          }
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Memory <span className="text-pink-400">Match</span></h1>
          <div className="flex gap-2 text-sm">
            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">Moves <b>{moves}</b></div>
            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">Best <b>{best ?? "-"}</b></div>
            <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">Time <b>{time}s</b></div>
            <button onClick={pauseToggle} disabled={phase === "menu" || phase === "win"} className="px-3 py-1 rounded-xl bg-indigo-800 hover:bg-indigo-700 border border-white/10">
              {phase === "paused" ? "Resume" : "Pause"}
            </button>
          </div>
        </div>

        <div className="relative aspect-[4/3] bg-indigo-950/40 border border-white/10 rounded-2xl p-3 grid grid-cols-4 gap-3 shadow-xl" style={{zIndex:"9999"}}>
          {/* Menu / overlays */}
          <AnimatePresence>
            {phase !== "playing" && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-md">
                {phase === "menu" && (
                  <button onClick={initGame} className="px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-400 text-slate-900 font-semibold shadow-lg shadow-pink-500/30">Start Game</button>
                )}
                {phase === "paused" && (
                  <button onClick={pauseToggle} className="px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-400 text-slate-900 font-semibold shadow-lg shadow-pink-500/30">Resume</button>
                )}
                {phase === "win" && (
                  <div className="text-center">
                    <p className="text-2xl font-bold mb-2">You Win! 🎉</p>
                    <p className="mb-4">Moves: {moves}, Time: {time}s</p>
                    <button onClick={initGame} className="px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-400 text-slate-900 font-semibold shadow-lg shadow-pink-500/30">Play Again</button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence> 

          {/* Cards */}
          {deck.map((emoji, i) => {
            const isFlipped = flipped.includes(i) || matched.includes(i);
            return (
              <motion.button
                key={i}
                onClick={() => handleFlip(i)}
                whileTap={{scale:0.95}}
                className="relative aspect-square w-full rounded-xl focus:outline-none"
                style={{zIndex:'-1'}}
              >
                <motion.div animate={{rotateY: isFlipped ? 180 : 0}} transition={{duration:0.4}} className="w-full h-full [transform-style:preserve-3d]">
                  {/* Front */}
                  <div className="absolute inset-0 flex items-center justify-center text-3xl bg-pink-500/80 rounded-xl border border-white/10" >
                  
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 flex items-center justify-center text-3xl bg-pink-500/80 rounded-xl border border-white/10 emoji" style={{visibility: isFlipped ? "visible" : "hidden"}}>
                    {emoji}
                  </div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        {/* Leaderboard stub */}
        <div className="mt-5 p-4 rounded-2xl border border-white/10 bg-white/5">
          <h4 className="font-semibold mb-2">Mock Leaderboard</h4>
          <ul className="space-y-1">
            {MOCK_LEADERBOARD.sort((a,b)=>a.moves-b.moves).slice(0,5).map((row, i) => (
              <li key={row.name} className="flex items-center justify-between text-sm">
                <span>{i+1}. {row.name}</span>
                <span>{row.moves} moves</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-300 mt-2 opacity-80">(Stubbed JSON; connect to backend later.)</p>
        </div>
      </div>
    </div>
  );
}
