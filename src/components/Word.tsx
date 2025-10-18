import React, { useRef, useState } from "react";

import { Input } from "@/components/ui/input.tsx";
import { LetterKind } from "@/components/LetterKind.tsx";
import { cn } from "@/lib/utils.ts";
import type { WordleAction } from "@/lib/app-reducer.ts";

export function Word({ dispatch }: { dispatch: React.ActionDispatch<[action: WordleAction]> }) {
	const [word, setWord] = useState([
		{ letter: "", color: "" },
		{ letter: "", color: "" },
		{ letter: "", color: "" },
		{ letter: "", color: "" },
		{ letter: "", color: "" },
	]);
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
		const value = e.currentTarget.value;
		const tempWord = [...word];
		tempWord[index].letter = value;
		setWord(tempWord);
		// If a character is entered and it's not the last field, move to next
		if (value.length === 1 && index < inputRefs.current.length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
		// Handle backspace - move to previous field
		if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
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

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").toUpperCase().split("");

		pastedData.forEach((char: string, index: number) => {
			if (index < inputRefs.current.length && inputRefs.current[index]) {
				inputRefs.current[index].value = char;
			}
		});

		// Focus the last field or the field after the pasted data
		const focusIndex = Math.min(pastedData.length, inputRefs.current.length - 1);
		inputRefs.current[focusIndex]?.focus();
	};

	const handleColorClick = (index: number, color: "green" | "yellow" | "gray") => {
		const tempWord = [...word];
		tempWord[index].color = color;
		switch (color) {
			case "green":
				dispatch({ type: "ADD_GREEN_LETTER", payload: { letter: tempWord[index].letter, position: index } });
				break;
			case "yellow":
				dispatch({ type: "ADD_YELLOW_LETTER", payload: { letter: tempWord[index].letter, position: index } });
				break;
			case "gray":
				dispatch({ type: "ADD_GRAY_LETTER", payload: { letter: tempWord[index].letter } });
		}
		setWord(tempWord);
	};

	return (
		<div className="flex gap-2">
			{[0, 1, 2, 3, 4].map((value) => (
				<div className="flex flex-col gap-2 text-center" key={value}>
					<Input
						// ref={inputRefs.current[value]}
						ref={(el) => {
							inputRefs.current[value] = el;
							return;
						}}
						type="text"
						maxLength={1}
						className={cn("h-13 w-13 rounded-none text-center text-4xl! font-bold uppercase", {
							"bg-green-500": word[value].color === "green",
							"bg-yellow-500": word[value].color === "yellow",
							"bg-gray-300": word[value].color === "gray",
						})}
						value={word[value].letter}
						onChange={(e) => handleChange(e, value)}
						onKeyDown={(e) => handleKeyDown(e, value)}
						onPaste={handlePaste}
					/>
					<div>
						<LetterKind
							variant="green"
							selected={word[value].color === "green"}
							onClick={() => handleColorClick(value, "green")}
						/>
						<LetterKind
							variant="yellow"
							selected={word[value].color === "yellow"}
							onClick={() => handleColorClick(value, "yellow")}
						/>
						<LetterKind
							variant="gray"
							selected={word[value].color === "gray"}
							onClick={() => handleColorClick(value, "gray")}
						/>
					</div>
				</div>
			))}
		</div>
	);
}
