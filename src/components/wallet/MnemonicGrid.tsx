import React from "react"

interface MnemonicGridProps {
  words: string[]
  mode: "display" | "input"
  inputValues?: string[]
  onInputChange?: (index: number, value: string) => void
  hiddenIndices?: number[]
}

export const MnemonicGrid: React.FC<MnemonicGridProps> = ({
  words,
  mode,
  inputValues = [],
  onInputChange,
  hiddenIndices = [],
}) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {words.map((word, index) => (
        <div
          key={index}
          className={`flex items-center px-3 py-2 rounded-lg text-sm ${mode === "display" ? "bg-slate-100" : "bg-white border border-slate-300"}`}>
          <span className="text-slate-400 mr-2 min-w-[20px]">{index + 1}.</span>
          {mode === "display" ? (
            <span className="text-slate-800 font-medium">{word}</span>
          ) : hiddenIndices.includes(index) ? (
            <input
              type="text"
              value={inputValues[index] || ""}
              onChange={(e) => onInputChange?.(index, e.target.value.toLowerCase())}
              className="flex-1 bg-transparent outline-none text-slate-800 font-medium"
              placeholder="..."
              autoComplete="off"
            />
          ) : (
            <span className="text-slate-800 font-medium">{word}</span>
          )}
        </div>
      ))}
    </div>
  )
}
