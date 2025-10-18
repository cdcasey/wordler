import { useReducer, useState } from "react";

import { Word } from "@/components/Word.tsx";
import "./App.css";
import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { PossibleWords } from "@/components/PossibleWords.tsx";
import { initialState, wordleReducer } from "@/lib/app-reducer.ts";

function App() {
	const [guessList, setGuessList] = useState([1]);
	const [state, dispatch] = useReducer(wordleReducer, initialState);
	return (
		<div className="flex gap-4">
			<div>
				{guessList.map((word) => (
					<div className="flex gap-2" key={word}>
						<Word dispatch={dispatch} />
						<Button
							variant="outline"
							size="icon"
							className="mt-2 rounded-full"
							onClick={() =>
								setGuessList((prev) => {
									if (prev.length === 6) return prev;
									return [...prev, prev.length + 1];
								})
							}
						>
							<Plus />
						</Button>
					</div>
				))}
			</div>

			<PossibleWords wordleState={state} />
		</div>
	);
}

export default App;
