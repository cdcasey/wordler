import { LetterKind } from "@/components/LetterKind.tsx";

export function LetterKindButtons() {
	return (
		<div>
			<LetterKind variant="green" />
			<LetterKind variant="yellow" />
			<LetterKind variant="gray" />
		</div>
	);
}
