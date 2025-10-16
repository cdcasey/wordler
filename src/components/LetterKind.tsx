import React from "react";
import { Button } from "@/components/ui/button.tsx";
import { CircleIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils.ts";

const buttonVariants = cva("stroke-none", {
	variants: {
		variant: {
			green: "fill-green-500",
			yellow: "fill-yellow-500",
			gray: "fill-gray-300",
			none: "fill-none stroke-1 stroke-gray-700",
		},
	},
	defaultVariants: {
		variant: "none",
	},
});

interface LetterKindProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
	letter: string;
}

export function LetterKind({ letter, className, variant, ...props }: LetterKindProps) {
	console.log("LetterKind", letter, variant);
	return (
		<Button variant="ghost" size="icon" className={cn("h-fit w-fit rounded-full", className)} {...props}>
			<CircleIcon className={cn(buttonVariants({ variant }))} />
		</Button>
	);
}
