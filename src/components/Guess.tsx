import { useRef, useState } from "react";

import { LetterKind } from "@/components/LetterKind.tsx";
import { Input } from "@/components/ui/input.tsx";
import type { WordleAction } from "@/lib/app-reducer.ts";
import { cn } from "@/lib/utils.ts";
import { LogIn } from "lucide-react";

type wordLetter = { letter: string; color: "gray" | "yellow" | "green" | "" };

export function Guess({ dispatch }: { dispatch: React.ActionDispatch<[action: WordleAction]> }) {
	const [word, setWord] = useState<wordLetter[]>([
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
		tempWord[index].letter = value.toLowerCase();
		setWord(tempWord);
		// If a character is entered and it's not the last field, move to next
		if (value.length === 1 && index < inputRefs.current.length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, letter: wordLetter) => {
		// Handle backspace - clear color and letter data
		if (e.key === "Backspace") {
			if (letter.color !== "") {
				dispatch({ type: "CLEAR_POSITION", payload: { letter: letter.letter, position: index } });
				const tempWord = [...word];
				tempWord[index].color = "";
				setWord(tempWord);
			}
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
		const letter = tempWord[index].letter;
		const oldColor = tempWord[index].color;

		// Remove old color from state
		if (oldColor === "green") {
			dispatch({ type: "REMOVE_GREEN_LETTER", payload: { position: index } });
		} else if (oldColor === "yellow") {
			dispatch({ type: "REMOVE_YELLOW_LETTER", payload: { letter, position: index } });
		} else if (oldColor === "gray") {
			dispatch({ type: "REMOVE_GRAY_LETTER", payload: { letter } });
		}

		tempWord[index].color = color;
		switch (color) {
			case "green":
				dispatch({ type: "ADD_GREEN_LETTER", payload: { letter, position: index } });
				break;
			case "yellow":
				dispatch({ type: "ADD_YELLOW_LETTER", payload: { letter, position: index } });
				break;
			case "gray":
				dispatch({ type: "ADD_GRAY_LETTER", payload: { letter } });
		}
		setWord(tempWord);
	};

	return (
		<div className="flex gap-2.5">
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
						className={cn("h-14 w-14 rounded-none text-center text-3xl! font-bold uppercase", {
							"bg-green-500 text-white": word[value].color === "green",
							"bg-yellow-500 text-white": word[value].color === "yellow",
							"bg-gray-500 text-white": word[value].color === "gray",
						})}
						value={word[value].letter}
						onChange={(e) => handleChange(e, value)}
						onKeyDown={(e) => handleKeyDown(e, value, word[value])}
						onPaste={handlePaste}
					/>
					<div className="mb-4 flex justify-between">
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
