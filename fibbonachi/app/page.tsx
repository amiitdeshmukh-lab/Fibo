"use client"
import React, { useEffect,useState, ChangeEvent, FormEvent} from "react";

export default function Home() {
  // State for input value
  const [index, setIndex] = useState<string>("");
  const [seenIndexes, setSeenIndexes] = useState<{ number: number }[]>([]);
  const [allValues, setAllValues] = useState<{ [key: string]: number }>({});

  // Fetch seen indexes and calculated values from backend on mount
  useEffect(() => {
    fetchSeenIndexes();
    fetchValues();
  }, []);

  // Fetch all seen indexes from backend
  async function fetchSeenIndexes() {
    const res = await fetch("/api/values/all");
    const data = await res.json();
    setSeenIndexes(data);
  }

  // Fetch all calculated values from backend
  async function fetchValues() {
    const res = await fetch("/api/values/current");
    const data = await res.json();
    setAllValues(data);
  }

  // Handle form submission
  const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Submit the index to backend
    await fetch("/api/values", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
    setIndex(""); // Clear input
    // Refresh data after submit
    fetchSeenIndexes();
    fetchValues();
  };

  function renderSeenIndexes() {
    return seenIndexes.map(({ number }) => number).join(', ');
  }

  function renderValues() {
    const entries = [];
    for (let key in allValues) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {allValues[key]}
        </div>
      );
    }
    return entries;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 font-sans">
      <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-10 w-full max-w-md flex flex-col items-center border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-100">Fibonacci Calculator</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 pb-16">
          <label htmlFor="fib-index" className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">Enter your index</label>
          <input
            id="fib-index"
            type="number"
            min="0"
            placeholder="e.g. 5"
            className="py-3 px-4 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-zinc-800 dark:text-zinc-100 transition"
            value={index}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setIndex(e.target.value)}
          />
          <button
            type="submit"
            className="mt-2 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-md hover:from-blue-600 hover:to-purple-600 transition"
          >
            Calculate
          </button>
        </form>

        <h3 className="text-zinc-700 dark:text-zinc-300 text-xl font-medium w-full">Indices I have seen: </h3>
        {renderSeenIndexes()}
        <h3 className="text-zinc-700 dark:text-zinc-300 text-xl font-medium w-full">Calculated Values: </h3>
        {renderValues()}
      </div>
    </div>
  );
}
