import { useState } from "react";

import { Word } from "@/components/Word.tsx";
import "./App.css";
import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { PossibleWords } from "@/components/PossibleWords.tsx";

function App() {
	const [wordList, setWordList] = useState([1]);

	return (
		<div className="flex gap-4">
			<div>
				{wordList.map((word) => (
					<div className="flex gap-2" key={word}>
						<Word />
						<Button
							variant="outline"
							size="icon"
							className="mt-2 rounded-full"
							onClick={() =>
								setWordList((prev) => {
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

			<PossibleWords />
		</div>
	);
}

export default App;
