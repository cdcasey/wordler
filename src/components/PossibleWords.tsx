import possibleWords from "@/lib/words.json";
// import possibleWords from "@/lib/nyt-words.json";
import type { WordleState } from "@/lib/app-reducer.ts";

export function PossibleWords({ wordleState }: { wordleState: WordleState }) {
	const filteredPossibleWords = possibleWords.filter((word) => {
		const { gray, yellow, green } = wordleState;
		if (gray.some((letter) => word.includes(letter))) {
			return false;
		}

		// 2) All green letters match position
		for (let i = 0; i < green.length; i++) {
			if (green[i] && word[i] !== green[i]) {
				return false;
			}
		}

		// 3) Yellow letters exist but not in guessed position
		for (const y of yellow) {
			if (!word.includes(y.letter) || word[y.position] === y.letter) {
				return false;
			}
		}

		return true;
	});

	if (!filteredPossibleWords.length) return <p>No possible words left</p>;
	if (filteredPossibleWords.length > 500) return <p>More than {filteredPossibleWords.length} words...</p>;

	return (
		<ul className="flex max-w-xl flex-wrap gap-2">
			{filteredPossibleWords.map((word) => {
				return <li key={word}>{word}</li>;
			})}
		</ul>
	);
}
