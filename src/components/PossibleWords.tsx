import possibleWords from "@/lib/words.json";

export function PossibleWords() {
	const filteredPossibleWords = possibleWords.filter((word) => word.startsWith("ca"));
	if (!filteredPossibleWords.length) return <p>No possible words left</p>;
	if (filteredPossibleWords.length > 500) return <p>More than {filteredPossibleWords.length} words...</p>;
	return (
		<ul className="flex max-w-xl flex-wrap gap-2">
			{filteredPossibleWords.map((word) => {
				return <li>{word}</li>;
			})}
		</ul>
	);
}
