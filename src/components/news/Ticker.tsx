import React from "react";

const stories = [
  {
    id: 1,
    title: "Welcome to Panel Profits!",
    source: "System",
    timestamp: Date.now(),
  },
  {
    id: 2,
    title: "This ticker is running on dum-dum data.",
    source: "Test Feed",
    timestamp: Date.now() - 60000,
  },
  {
    id: 3,
    title: "Swap this out when you find your real storyCache.",
    source: "System",
    timestamp: Date.now() - 120000,
  },
];

export const Ticker = () => {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="overflow-hidden w-full bg-black text-white border-y border-gray-700">
      {visible && (
        <div
          className="flex gap-10 animate-ticker whitespace-nowrap"
          style={{ animationDuration: `${stories.length * 4}s` }}
        >
          {stories.map((story) => (
            <div key={story.id} className="inline-block px-4 py-2 font-mono text-sm">
              📰 {story.title} — {story.source} — ⏱ {new Date(story.timestamp).toLocaleTimeString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
