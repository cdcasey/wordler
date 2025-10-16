import { Button } from "@/components/ui/button.tsx";
import { CircleIcon } from "lucide-react";

export function LetterKind() {
	return (
		<Button variant="ghost" size="icon" className="rounded-full w-fit h-fit">
			<CircleIcon className="" />
		</Button>
	);
}
