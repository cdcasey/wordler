import {
	type GridLetter,
	type LetterColor,
	ROW_COUNT,
	WORD_LENGTH,
	type WordleState,
	initialState,
	withRows,
} from "@/lib/app-reducer.ts";

const STORAGE_KEY = "wordler:state:v1";

const COLORS: LetterColor[] = ["gray", "yellow", "green", ""];

function isGridLetter(value: unknown): value is GridLetter {
	if (typeof value !== "object" || value === null) return false;
	const { letter, color } = value as Partial<GridLetter>;
	return typeof letter === "string" && letter.length <= 1 && COLORS.includes(color as LetterColor);
}

function parseRows(value: unknown): GridLetter[][] | null {
	if (!Array.isArray(value) || value.length !== ROW_COUNT) return null;

	const rows = value.map(row =>
		Array.isArray(row) && row.length === WORD_LENGTH && row.every(isGridLetter)
			? (row as GridLetter[]).map(({ letter, color }) => ({ letter, color }))
			: null,
	);

	return rows.every(row => row !== null) ? (rows as GridLetter[][]) : null;
}

// Rebuild the full state from stored rows only. The derived filters are
// recomputed rather than trusted, so a stale payload can't desync them.
export function loadState(): WordleState {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return initialState;

		const rows = parseRows((JSON.parse(raw) as { rows?: unknown }).rows);
		return rows ? withRows(rows) : initialState;
	} catch {
		// Unavailable or corrupt storage shouldn't stop the app from booting.
		return initialState;
	}
}

export function saveState(state: WordleState): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ rows: state.rows }));
	} catch {
		// Quota or private-mode failures are non-fatal.
	}
}
