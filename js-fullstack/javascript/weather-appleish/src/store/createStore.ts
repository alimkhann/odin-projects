type Listener = () => void;

export function createStore<State>(initialState: State) {
  let state = initialState;
  const listeners = new Set<Listener>();

  return {
    getState: () => state,
    setState: (updater: (previousState: State) => State) => {
      state = updater(state);
      for (const l of listeners) l();
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
