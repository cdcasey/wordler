import { useEffect, useReducer } from "react";

import { Guess } from "@/components/Guess.tsx";
import { PossibleWords } from "@/components/PossibleWords.tsx";
import { Button } from "@/components/ui/button.tsx";
import { wordleReducer } from "@/lib/app-reducer.ts";
import { loadState, saveState } from "@/lib/storage.ts";

import "./App.css";

function App() {
	const [state, dispatch] = useReducer(wordleReducer, undefined, loadState);

	useEffect(() => {
		saveState(state);
	}, [state]);

	return (
		<>
			<div className="flex flex-col gap-8 md:flex-row">
				<div>
					{state.rows.map((row, index) => (
						<Guess dispatch={dispatch} key={index} row={row} rowIndex={index} />
					))}
				</div>

				<PossibleWords wordleState={state} />
			</div>
			<Button className="mt-4" variant="destructive" onClick={() => dispatch({ type: "RESET" })}>
				Reset
			</Button>
		</>
	);
}

export default App;
