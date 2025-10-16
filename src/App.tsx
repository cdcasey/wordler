import React, { useState } from "react";

import { Word } from "@/components/Word.tsx";
import "./App.css";
import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";

function App() {
	const [wordList, setWordList] = useState([1]);
	console.log({ wordList });

	return (
		<>
			{wordList.map((word) => (
				<div className="flex gap-2" key={word}>
					<Word />
					<Button
						variant="outline"
						size="icon"
						className="rounded-full  mt-2"
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
		</>
	);
}

export default App;
