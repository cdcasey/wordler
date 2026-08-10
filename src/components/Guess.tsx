import { useRef } from "react";

import { LetterKind } from "@/components/LetterKind.tsx";
import { Input } from "@/components/ui/input.tsx";
import type { GridLetter, WordleAction } from "@/lib/app-reducer.ts";
import { WORD_LENGTH } from "@/lib/app-reducer.ts";
import { cn } from "@/lib/utils.ts";

interface GuessProps {
	row: GridLetter[];
	rowIndex: number;
	dispatch: React.ActionDispatch<[action: WordleAction]>;
}

export function Guess({ row, rowIndex, dispatch }: GuessProps) {
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
		const value = e.currentTarget.value;
		dispatch({ type: "SET_LETTER", payload: { row: rowIndex, position: index, letter: value } });
		// If a character is entered and it's not the last field, move to next
		if (value.length === 1 && index < inputRefs.current.length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, letter: GridLetter) => {
		// Handle backspace - clear color and letter data
		if (e.key === "Backspace" && !letter.letter && index > 0) {
			dispatch({ type: "CLEAR_POSITION", payload: { row: rowIndex, position: index - 1 } });
			inputRefs.current[index - 1]?.focus();
		}

		// Handle arrow keys for navigation
		if (e.key === "ArrowLeft" && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
		if (e.key === "ArrowRight" && index < inputRefs.current.length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData("text").replace(/[^a-z]/gi, "").split("");

		pasted.slice(0, WORD_LENGTH - index).forEach((char, offset) => {
			dispatch({ type: "SET_LETTER", payload: { row: rowIndex, position: index + offset, letter: char } });
		});

		// Focus the last field or the field after the pasted data
		const focusIndex = Math.min(index + pasted.length, WORD_LENGTH - 1);
		inputRefs.current[focusIndex]?.focus();
	};

	const handleColorClick = (index: number, color: "green" | "yellow" | "gray") => {
		dispatch({ type: "SET_COLOR", payload: { row: rowIndex, position: index, color } });
	};

	return (
		<div className="flex gap-2.5">
			{row.map((cell, value) => (
				<div className="flex flex-col gap-2 text-center" key={value}>
					<Input
						ref={(el) => {
							inputRefs.current[value] = el;
							return;
						}}
						type="text"
						maxLength={1}
						className={cn("h-14 w-14 rounded-none border-gray-300 text-center text-3xl! font-bold uppercase", {
							"bg-green-500 text-white": cell.color === "green",
							"bg-yellow-500 text-white": cell.color === "yellow",
							"bg-gray-500 text-white": cell.color === "gray",
						})}
						value={cell.letter}
						onChange={(e) => handleChange(e, value)}
						onKeyDown={(e) => handleKeyDown(e, value, cell)}
						onPaste={(e) => handlePaste(e, value)}
					/>
					<div className="mb-4 flex justify-between">
						<LetterKind
							variant="green"
							selected={cell.color === "green"}
							onClick={() => handleColorClick(value, "green")}
						/>
						<LetterKind
							variant="yellow"
							selected={cell.color === "yellow"}
							onClick={() => handleColorClick(value, "yellow")}
						/>
						<LetterKind
							variant="gray"
							selected={cell.color === "gray"}
							onClick={() => handleColorClick(value, "gray")}
						/>
					</div>
				</div>
			))}
		</div>
	);
}
