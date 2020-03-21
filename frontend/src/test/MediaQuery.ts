let matchQueries = {} as { [query: string]: boolean };

export function clearMatchers() {
  matchQueries = {};
}

export function setMatcher(query: string, result: boolean) {
  matchQueries[query] = result;
}

export function mockMediaQuery() {
  Object.defineProperty(window, "matchMedia", {
    value: jest.fn(query => {
      let foundMatch = matchQueries[query];

      // if nothing was found match true
      const matches = foundMatch === undefined ? true : foundMatch;

      return {
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
    }),
  });
}
