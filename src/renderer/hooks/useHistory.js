import { useState, useCallback } from 'react';

const MAX_HISTORY = 50;

export function useHistory(initialState) {
    const [state, setState] = useState({
        past: [],
        present: initialState,
        future: []
    });

    const canUndo = state.past.length > 0;
    const canRedo = state.future.length > 0;

    const undo = useCallback(() => {
        setState((currentState) => {
            const { past, present, future } = currentState;
            if (past.length === 0) return currentState;

            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);

            return {
                past: newPast,
                present: previous,
                future: [present, ...future]
            };
        });
    }, []);

    const redo = useCallback(() => {
        setState((currentState) => {
            const { past, present, future } = currentState;
            if (future.length === 0) return currentState;

            const next = future[0];
            const newFuture = future.slice(1);

            return {
                past: [...past, present],
                present: next,
                future: newFuture
            };
        });
    }, []);

    const set = useCallback((newPresent) => {
        setState((currentState) => {
            const { past, present } = currentState;

            if (JSON.stringify(newPresent) === JSON.stringify(present)) {
                return currentState;
            }

            // Limit history size
            const newPast = [...past, present].slice(-MAX_HISTORY);

            return {
                past: newPast,
                present: newPresent,
                future: []
            };
        });
    }, []);

    // Update present without adding to history (for initial load)
    const reset = useCallback((newPresent) => {
        setState({
            past: [],
            present: newPresent,
            future: []
        });
    }, []);

    return {
        state: state.present,
        set,
        undo,
        redo,
        reset,
        canUndo,
        canRedo,
        historyState: state
    };
}
