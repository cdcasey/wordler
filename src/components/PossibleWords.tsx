// import possibleWords from "@/lib/words.json";
import allPossibleWords from "@/lib/nyt-words.json";
import likelyPossibleWords from "@/lib/possible-words.json";
import type { WordleState } from "@/lib/app-reducer.ts";

function possibleWordFilter(word: string, state: WordleState) {
	const { gray, yellow, green } = state;
	const effectiveGray = gray.filter(
		(letter) => !green.includes(letter) && !yellow.some((y) => y.letter === letter),
	);
	if (effectiveGray.some((letter) => word.includes(letter))) {
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
}

export function PossibleWords({ wordleState }: { wordleState: WordleState }) {
	const filteredPossibleWords = allPossibleWords.filter((possibleWord) => {
		return possibleWordFilter(possibleWord, wordleState);
	});
	const filteredLikelyWords = likelyPossibleWords.filter((likelyWord) => {
		return possibleWordFilter(likelyWord, wordleState);
	});

	if (!filteredPossibleWords.length) return <p>No possible words left</p>;
	if (filteredPossibleWords.length > 500) return <p>More than {filteredPossibleWords.length} words...</p>;

	return (
		<div className="flex flex-col">
			<h2 className="mb-2 font-bold">Likely</h2>
			<ul className="flex max-w-xl flex-wrap content-start gap-2">
				{filteredLikelyWords.map((word) => {
					return (
						<li key={word} className="h-fit">
							{word}
						</li>
					);
				})}
			</ul>
			<h2 className="mt-4 mb-2 font-bold">Possible</h2>
			<ul className="flex max-w-xl flex-wrap content-start gap-2">
				{filteredPossibleWords.map((word) => {
					return (
						<li key={word} className="h-fit">
							{word}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
