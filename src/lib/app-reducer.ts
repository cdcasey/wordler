// Types for the Wordle helper
export interface YellowLetter {
	letter: string;
	position: number;
}

export type LetterColor = "gray" | "yellow" | "green" | "";

export interface GridLetter {
	letter: string;
	color: LetterColor;
}

export const ROW_COUNT = 5;
export const WORD_LENGTH = 5;

export interface WordleState {
	// Raw grid input — the source of truth. green/yellow/gray below are
	// projections of this, maintained by the reducer for PossibleWords.
	rows: GridLetter[][];
	green: (string | null)[];
	yellow: YellowLetter[];
	gray: string[];
}

// Action types
type SetLetterAction = {
	type: "SET_LETTER";
	payload: {
		row: number;
		position: number;
		letter: string;
	};
};

type SetColorAction = {
	type: "SET_COLOR";
	payload: {
		row: number;
		position: number;
		color: LetterColor;
	};
};

type ClearPositionAction = {
	type: "CLEAR_POSITION";
	payload: {
		row: number;
		position: number;
	};
};

type ResetAction = {
	type: "RESET";
};

export type WordleAction = SetLetterAction | SetColorAction | ClearPositionAction | ResetAction;

export function emptyRows(): GridLetter[][] {
	return Array.from({ length: ROW_COUNT }, () =>
		Array.from({ length: WORD_LENGTH }, (): GridLetter => ({ letter: "", color: "" })),
	);
}

// Initial state for the Wordle helper
export const initialState: WordleState = {
	rows: emptyRows(),
	green: [null, null, null, null, null], // Fixed positions for correct letters
	yellow: [], // Array of {letter, position} objects
	gray: [], // Array of excluded letters
};

// Rebuild the green/yellow/gray filters from the grid. Deriving these in one
// pass keeps them consistent no matter how the grid was edited.
function project(rows: GridLetter[][]): Omit<WordleState, "rows"> {
	const green: (string | null)[] = Array.from({ length: WORD_LENGTH }, () => null);
	const yellow: YellowLetter[] = [];
	const grayCandidates: string[] = [];
	const present = new Set<string>();

	for (const row of rows) {
		row.forEach(({ letter, color }, position) => {
			if (!letter) return;
			switch (color) {
				case "green":
					green[position] = letter;
					present.add(letter);
					break;
				case "yellow":
					if (!yellow.some(y => y.letter === letter && y.position === position)) {
						yellow.push({ letter, position });
					}
					present.add(letter);
					break;
				case "gray":
					grayCandidates.push(letter);
					break;
			}
		});
	}

	// A letter marked gray elsewhere is still in the word if it's green/yellow
	// somewhere, so only exclude letters that are never present.
	const gray = [...new Set(grayCandidates)].filter(letter => !present.has(letter));

	return { green, yellow, gray };
}

export function withRows(rows: GridLetter[][]): WordleState {
	return { rows, ...project(rows) };
}

// Replace a single cell without mutating the previous state.
function updateCell(
	state: WordleState,
	row: number,
	position: number,
	patch: Partial<GridLetter>,
): WordleState {
	if (!state.rows[row]?.[position]) return state;

	const rows = state.rows.map((cells, r) =>
		r === row ? cells.map((cell, c) => (c === position ? { ...cell, ...patch } : cell)) : cells,
	);

	return withRows(rows);
}

// Reducer function to manage Wordle guess state
export function wordleReducer(state: WordleState, action: WordleAction): WordleState {
	switch (action.type) {
		case "SET_LETTER": {
			const { row, position, letter } = action.payload;
			const next = letter.toLowerCase();
			// An emptied cell can't carry a constraint.
			return updateCell(state, row, position, next ? { letter: next } : { letter: "", color: "" });
		}

		case "SET_COLOR": {
			const { row, position, color } = action.payload;
			// Clicking the active color again clears it.
			const current = state.rows[row]?.[position];
			if (!current?.letter) return state;
			return updateCell(state, row, position, { color: current.color === color ? "" : color });
		}

		case "CLEAR_POSITION": {
			const { row, position } = action.payload;
			return updateCell(state, row, position, { letter: "", color: "" });
		}

		case "RESET":
			// Reset all state to initial values
			return withRows(emptyRows());

		default:
			return state;
	}
}

// Usage examples:
// const [state, dispatch] = useReducer(wordleReducer, initialState);
//
// dispatch({ type: 'SET_LETTER', payload: { row: 0, position: 0, letter: 'r' } });
// dispatch({ type: 'SET_COLOR', payload: { row: 0, position: 0, color: 'green' } });
// dispatch({ type: 'CLEAR_POSITION', payload: { row: 0, position: 0 } });
// dispatch({ type: 'RESET' });
