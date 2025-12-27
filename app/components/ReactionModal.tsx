"use client";

export default function ReactionModal({ onSelect }: any) {
  return (
    <div className="absolute bg-white shadow-lg rounded-full px-3 py-2 flex gap-3 border">
      <button onClick={() => onSelect("like")}>👍</button>
      <button onClick={() => onSelect("love")}>❤️</button>
      <button onClick={() => onSelect("rocket")}>🚀</button>
      <button onClick={() => onSelect("clap")}>👏</button>
    </div>
  );
}
