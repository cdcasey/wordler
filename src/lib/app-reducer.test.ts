import { describe, expect, it } from "vitest";

import {
	emptyRows,
	initialState,
	ROW_COUNT,
	WORD_LENGTH,
	type WordleAction,
	type WordleState,
	withRows,
	wordleReducer,
} from "@/lib/app-reducer.ts";

// --- helpers ---------------------------------------------------------------

const run = (actions: WordleAction[], from: WordleState = initialState) => actions.reduce(wordleReducer, from);

/** Type a word into a row, one SET_LETTER per character. */
const type = (row: number, word: string): WordleAction[] =>
	word.split("").map((letter, position) => ({ type: "SET_LETTER", payload: { row, position, letter } }));

const paint = (row: number, position: number, color: "green" | "yellow" | "gray" | ""): WordleAction => ({
	type: "SET_COLOR",
	payload: { row, position, color },
});

const clear = (row: number, position: number): WordleAction => ({
	type: "CLEAR_POSITION",
	payload: { row, position },
});

// --- grid ------------------------------------------------------------------

describe("grid", () => {
	it("starts empty at the configured size", () => {
		expect(initialState.rows).toHaveLength(ROW_COUNT);
		expect(initialState.rows.every(row => row.length === WORD_LENGTH)).toBe(true);
		expect(initialState.rows.flat().every(cell => cell.letter === "" && cell.color === "")).toBe(true);
	});

	it("stores typed letters lowercased", () => {
		const state = run([{ type: "SET_LETTER", payload: { row: 0, position: 0, letter: "C" } }]);
		expect(state.rows[0][0].letter).toBe("c");
	});

	it("keeps rows independent", () => {
		const state = run([...type(0, "crane"), ...type(1, "blimp")]);
		expect(state.rows[0].map(c => c.letter).join("")).toBe("crane");
		expect(state.rows[1].map(c => c.letter).join("")).toBe("blimp");
		expect(state.rows[2].every(c => c.letter === "")).toBe(true);
	});

	it("ignores writes to cells outside the grid", () => {
		const state = run([
			{ type: "SET_LETTER", payload: { row: ROW_COUNT, position: 0, letter: "x" } },
			{ type: "SET_LETTER", payload: { row: 0, position: WORD_LENGTH, letter: "x" } },
			{ type: "SET_LETTER", payload: { row: -1, position: -1, letter: "x" } },
		]);
		expect(state).toBe(initialState);
	});
});

// --- colors ----------------------------------------------------------------

describe("colors", () => {
	it("projects green to its position", () => {
		const state = run([...type(0, "crane"), paint(0, 0, "green")]);
		expect(state.green).toEqual(["c", null, null, null, null]);
	});

	it("projects yellow with its position", () => {
		const state = run([...type(0, "crane"), paint(0, 1, "yellow")]);
		expect(state.yellow).toEqual([{ letter: "r", position: 1 }]);
	});

	it("projects gray as an exclusion", () => {
		const state = run([...type(0, "crane"), paint(0, 1, "gray")]);
		expect(state.gray).toEqual(["r"]);
	});

	it("clicking the active color again clears it", () => {
		const state = run([...type(0, "crane"), paint(0, 0, "green"), paint(0, 0, "green")]);
		expect(state.rows[0][0].color).toBe("");
		expect(state.green).toEqual([null, null, null, null, null]);
	});

	it("switching color replaces the previous constraint", () => {
		const state = run([...type(0, "crane"), paint(0, 0, "green"), paint(0, 0, "yellow")]);
		expect(state.green).toEqual([null, null, null, null, null]);
		expect(state.yellow).toEqual([{ letter: "c", position: 0 }]);
	});

	it("refuses to color an empty cell", () => {
		const state = run([paint(0, 0, "green")]);
		expect(state).toBe(initialState);
	});
});

// --- clearing --------------------------------------------------------------

describe("clearing", () => {
	it("drops the constraint when a colored letter is deleted", () => {
		const state = run([
			...type(0, "crane"),
			paint(0, 0, "green"),
			{ type: "SET_LETTER", payload: { row: 0, position: 0, letter: "" } },
		]);
		expect(state.rows[0][0]).toEqual({ letter: "", color: "" });
		expect(state.green).toEqual([null, null, null, null, null]);
	});

	it("CLEAR_POSITION removes both letter and color", () => {
		const state = run([...type(0, "crane"), paint(0, 2, "yellow"), clear(0, 2)]);
		expect(state.rows[0][2]).toEqual({ letter: "", color: "" });
		expect(state.yellow).toEqual([]);
	});

	it("clearing one cell leaves its neighbours alone", () => {
		const state = run([...type(0, "crane"), paint(0, 0, "green"), paint(0, 1, "gray"), clear(0, 1)]);
		expect(state.green).toEqual(["c", null, null, null, null]);
		expect(state.gray).toEqual([]);
	});

	it("RESET returns a fully empty state", () => {
		const state = run([...type(0, "crane"), paint(0, 0, "green"), ...type(1, "blimp"), { type: "RESET" }]);
		expect(state).toEqual({ rows: emptyRows(), green: [null, null, null, null, null], yellow: [], gray: [] });
	});
});

// --- regressions -----------------------------------------------------------
// Each test below pins a bug found during the localStorage refactor. See the
// bug note in each description before changing the expectation.

describe("regressions", () => {
	// Bug: gray accumulated on every click and was removed with indexOf, so the
	// same letter marked gray in two rows left a phantom entry when one was undone.
	it("does not duplicate a letter grayed in multiple rows", () => {
		const state = run([...type(0, "crane"), paint(0, 1, "gray"), ...type(1, "rusty"), paint(1, 0, "gray")]);
		expect(state.gray).toEqual(["r"]);
	});

	// Same bug, the half that was actually visible: un-graying one occurrence
	// used to leave the other behind and keep filtering the word list.
	it("removes a letter from gray only when no cell still marks it gray", () => {
		const grayedTwice = run([...type(0, "crane"), paint(0, 1, "gray"), ...type(1, "rusty"), paint(1, 0, "gray")]);
		const oneUndone = wordleReducer(grayedTwice, paint(1, 0, "gray"));
		expect(oneUndone.gray).toEqual(["r"]);

		const bothUndone = wordleReducer(oneUndone, paint(0, 1, "gray"));
		expect(bothUndone.gray).toEqual([]);
	});

	// Bug: a letter marked gray in one row excluded it outright, even when the
	// same letter was green or yellow elsewhere — wrong for repeated letters.
	it("does not exclude a gray letter that is green somewhere else", () => {
		const state = run([...type(0, "crane"), paint(0, 1, "gray"), ...type(1, "rusty"), paint(1, 0, "green")]);
		expect(state.gray).toEqual([]);
		expect(state.green).toEqual(["r", null, null, null, null]);
	});

	it("does not exclude a gray letter that is yellow somewhere else", () => {
		const state = run([...type(0, "crane"), paint(0, 1, "gray"), ...type(1, "rusty"), paint(1, 0, "yellow")]);
		expect(state.gray).toEqual([]);
		expect(state.yellow).toEqual([{ letter: "r", position: 0 }]);
	});

	// Bug: handleChange/handleColorClick wrote through a shallow copy
	// (tempWord[i].letter = …), mutating the objects held by the previous state.
	it("never mutates the previous state", () => {
		const before = run([...type(0, "crane"), paint(0, 0, "green")]);
		const snapshot = structuredClone(before);

		wordleReducer(before, paint(0, 1, "gray"));
		wordleReducer(before, { type: "SET_LETTER", payload: { row: 0, position: 0, letter: "z" } });
		wordleReducer(before, clear(0, 0));

		expect(before).toEqual(snapshot);
	});

	it("returns new row references only for the row that changed", () => {
		const before = run([...type(0, "crane"), ...type(1, "blimp")]);
		const after = wordleReducer(before, paint(0, 0, "green"));

		expect(after.rows[0]).not.toBe(before.rows[0]);
		expect(after.rows[1]).toBe(before.rows[1]);
	});

	// The invariant that makes reload safe: the filters are a pure function of
	// the grid, so rebuilding from stored rows must reproduce live state exactly.
	it("derives identical filters from rows alone", () => {
		const live = run([
			...type(0, "crane"),
			paint(0, 0, "green"),
			paint(0, 1, "gray"),
			paint(0, 2, "yellow"),
			...type(1, "blimp"),
			paint(1, 3, "yellow"),
		]);
		expect(withRows(live.rows)).toEqual(live);
	});
});
