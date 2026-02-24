import { useReducer, useState } from "react";

import { Guess } from "@/components/Guess.tsx";
import { PossibleWords } from "@/components/PossibleWords.tsx";
import { Button } from "@/components/ui/button.tsx";
import { initialState, wordleReducer } from "@/lib/app-reducer.ts";

import "./App.css";

function App() {
	const [state, dispatch] = useReducer(wordleReducer, initialState);
	const [resetKey, setResetKey] = useState(0);

	const handleReset = () => {
		dispatch({ type: "RESET" });
		setResetKey((prev) => prev + 1);
	};

	return (
		<>
			<div className="flex flex-col gap-8 md:flex-row">
				<div>
					<Guess dispatch={dispatch} key={`0-word-${resetKey}`} />
					<Guess dispatch={dispatch} key={`1-word-${resetKey}`} />
					<Guess dispatch={dispatch} key={`2-word-${resetKey}`} />
					<Guess dispatch={dispatch} key={`3-word-${resetKey}`} />
					<Guess dispatch={dispatch} key={`4-word-${resetKey}`} />
				</div>

				<PossibleWords wordleState={state} />
			</div>
			<Button className="mt-4" variant="destructive" onClick={handleReset}>
				Reset
			</Button>
		</>
	);
}

export default App;
