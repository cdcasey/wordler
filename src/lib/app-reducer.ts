// Types for the Wordle helper
export interface YellowLetter {
	letter: string;
	position: number;
}

export interface WordleState {
	green: (string | null)[];
	yellow: YellowLetter[];
	gray: string[];
}

// Action types
type AddGreenLetterAction = {
	type: "ADD_GREEN_LETTER";
	payload: {
		letter: string;
		position: number;
	};
};

type AddYellowLetterAction = {
	type: "ADD_YELLOW_LETTER";
	payload: {
		letter: string;
		position: number;
	};
};

type AddGrayLetterAction = {
	type: "ADD_GRAY_LETTER";
	payload: {
		letter: string;
	};
};

type RemoveGreenLetterAction = {
	type: "REMOVE_GREEN_LETTER";
	payload: {
		position: number;
	};
};

type RemoveYellowLetterAction = {
	type: "REMOVE_YELLOW_LETTER";
	payload: {
		letter: string;
		position: number;
	};
};

type RemoveGrayLetterAction = {
	type: "REMOVE_GRAY_LETTER";
	payload: {
		letter: string;
	};
};

type ResetAction = {
	type: "RESET";
};

type ClearPositionAction = {
	type: "CLEAR_POSITION";
	payload: {
		letter: string;
		position: number;
	};
};

export type WordleAction =
	| AddGreenLetterAction
	| AddYellowLetterAction
	| AddGrayLetterAction
	| RemoveGreenLetterAction
	| RemoveYellowLetterAction
	| RemoveGrayLetterAction
	| ResetAction
	| ClearPositionAction;

// Initial state for the Wordle helper
export const initialState: WordleState = {
	green: [null, null, null, null, null], // Fixed positions for correct letters
	yellow: [], // Array of {letter, position} objects
	gray: [], // Array of excluded letters
};

// Reducer function to manage Wordle guess state
export function wordleReducer(state: WordleState, action: WordleAction): WordleState {
	switch (action.type) {
		case "ADD_GREEN_LETTER": {
			const { letter, position } = action.payload;
			const newGreen = [...state.green];
			newGreen[position] = letter;
			return {
				...state,
				green: newGreen,
				// Remove from yellow if it was there
				yellow: state.yellow.filter(y =>
					!(y.letter === letter && y.position === position),
				),
			};
		}

		case "ADD_YELLOW_LETTER": {
			const { letter, position } = action.payload;
			// Check if this letter/position combo already exists
			const exists = state.yellow.some(y =>
				y.letter === letter && y.position === position,
			);

			if (!exists) {
				return {
					...state,
					yellow: [...state.yellow, { letter, position }],
				};
			}
			return state;
		}

		case "ADD_GRAY_LETTER": {
			const { letter } = action.payload;
			// Only add if not already in gray list
			if (!state.gray.includes(letter)) {
				return {
					...state,
					gray: [...state.gray, letter],
				};
			}
			return state;
		}

		case "REMOVE_GREEN_LETTER": {
			const { position } = action.payload;
			const newGreen = [...state.green];
			newGreen[position] = null;
			return { ...state, green: newGreen };
		}

		case "REMOVE_YELLOW_LETTER": {
			const { letter, position } = action.payload;
			return {
				...state,
				yellow: state.yellow.filter(y =>
					!(y.letter === letter && y.position === position),
				),
			};
		}

		case "REMOVE_GRAY_LETTER": {
			const { letter } = action.payload;
			return {
				...state,
				gray: state.gray.filter(l => l !== letter),
			};
		}

		case "RESET":
			// Reset all state to initial values
			return initialState;

		case "CLEAR_POSITION": {
			// Clear all letter data at a specific position
			const { letter, position: pos } = action.payload;
			return {
				green: state.green.map((l, i) => i === pos ? null : l),
				yellow: state.yellow.filter(y => y.position !== pos),
				gray: state.gray.filter(l => l !== letter),
			};
		}

		default:
			return state;
	}
}

// Usage examples:
// const [state, dispatch] = useReducer(wordleReducer, initialState);
//
// dispatch({ type: 'ADD_GREEN_LETTER', payload: { letter: 'r', position: 0 } });
// dispatch({ type: 'ADD_YELLOW_LETTER', payload: { letter: 's', position: 1 } });
// dispatch({ type: 'ADD_GRAY_LETTER', payload: { letter: 't' } });
// dispatch({ type: 'REMOVE_GREEN_LETTER', payload: { position: 0 } });
// dispatch({ type: 'RESET' });
