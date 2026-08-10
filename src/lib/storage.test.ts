import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initialState, type WordleAction, type WordleState, wordleReducer } from "@/lib/app-reducer.ts";
import { loadState, saveState } from "@/lib/storage.ts";

const STORAGE_KEY = "wordler:state:v1";

/** Minimal in-memory localStorage; jsdom isn't installed and isn't needed here. */
function stubStorage(overrides: Partial<Storage> = {}) {
	const store = new Map<string, string>();
	vi.stubGlobal("localStorage", {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => void store.set(key, value),
		removeItem: (key: string) => void store.delete(key),
		...overrides,
	});
	return store;
}

let store: Map<string, string>;

beforeEach(() => {
	store = stubStorage();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const run = (actions: WordleAction[]): WordleState => actions.reduce(wordleReducer, initialState);

const type = (row: number, word: string): WordleAction[] =>
	word.split("").map((letter, position) => ({ type: "SET_LETTER", payload: { row, position, letter } }));

const paint = (row: number, position: number, color: "green" | "yellow" | "gray"): WordleAction => ({
	type: "SET_COLOR",
	payload: { row, position, color },
});

const filledState = () =>
	run([
		...type(0, "crane"),
		paint(0, 0, "green"),
		paint(0, 1, "gray"),
		...type(1, "blimp"),
		paint(1, 2, "yellow"),
	]);

describe("round trip", () => {
	it("restores a filled grid exactly", () => {
		const saved = filledState();
		saveState(saved);
		expect(loadState()).toEqual(saved);
	});

	it("restores letters that have no color yet", () => {
		const saved = run(type(0, "crane"));
		saveState(saved);
		expect(loadState().rows[0].map(cell => cell.letter).join("")).toBe("crane");
	});

	it("persists only the grid, not the derived filters", () => {
		saveState(filledState());
		expect(Object.keys(JSON.parse(store.get(STORAGE_KEY)!))).toEqual(["rows"]);
	});

	// The filters are recomputed on load rather than trusted, so a stale or
	// tampered payload can't desync the word list from the grid.
	it("recomputes filters instead of trusting stored ones", () => {
		const saved = filledState();
		store.set(STORAGE_KEY, JSON.stringify({ rows: saved.rows, green: ["z", "z", "z", "z", "z"], gray: ["q"] }));
		expect(loadState()).toEqual(saved);
	});

	it("survives a save/load/save cycle unchanged", () => {
		saveState(filledState());
		const first = loadState();
		saveState(first);
		expect(loadState()).toEqual(first);
	});
});

describe("malformed storage falls back to initial state", () => {
	it("handles an empty key", () => {
		expect(loadState()).toEqual(initialState);
	});

	it("handles unparseable JSON", () => {
		store.set(STORAGE_KEY, "{not json");
		expect(loadState()).toEqual(initialState);
	});

	it.each([
		["missing rows", {}],
		["rows not an array", { rows: "crane" }],
		["too few rows", { rows: [[], [], []] }],
		["a short row", { rows: [Array(4).fill({ letter: "a", color: "" }), [], [], [], []] }],
		["an unknown color", { rows: [Array(5).fill({ letter: "a", color: "purple" }), [], [], [], []] }],
		["a multi-character letter", { rows: [Array(5).fill({ letter: "ab", color: "" }), [], [], [], []] }],
		["a non-string letter", { rows: [Array(5).fill({ letter: 1, color: "" }), [], [], [], []] }],
		["null cells", { rows: [Array(5).fill(null), [], [], [], []] }],
	])("rejects %s", (_label, payload) => {
		store.set(STORAGE_KEY, JSON.stringify(payload));
		expect(loadState()).toEqual(initialState);
	});

	it("does not throw when reading is unavailable", () => {
		stubStorage({
			getItem: () => {
				throw new Error("SecurityError");
			},
		});
		expect(() => loadState()).not.toThrow();
		expect(loadState()).toEqual(initialState);
	});
});

describe("write failures are non-fatal", () => {
	it("swallows a quota error", () => {
		stubStorage({
			setItem: () => {
				throw new Error("QuotaExceededError");
			},
		});
		expect(() => saveState(filledState())).not.toThrow();
	});
});
