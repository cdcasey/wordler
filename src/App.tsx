import { useReducer, useState } from "react";

import { Guess } from "@/components/Guess.tsx";
import "./App.css";
import { Button } from "@/components/ui/button.tsx";

import { PossibleWords } from "@/components/PossibleWords.tsx";
import { initialState, wordleReducer } from "@/lib/app-reducer.ts";

function App() {
	const [state, dispatch] = useReducer(wordleReducer, initialState);
	const [resetKey, setResetKey] = useState(0);

	const handleReset = () => {
		dispatch({ type: "RESET" });
		setResetKey((prev) => prev + 1);
	};

	return (
		<>
			<div className="flex gap-4">
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
