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

export function LetterKind({
	className,
	variant,
	...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
	return (
		<Button variant="ghost" size="icon" className={cn("rounded-full w-fit h-fit", className)} {...props}>
			<CircleIcon className={cn(buttonVariants({ variant }))} />
		</Button>
	);
}
