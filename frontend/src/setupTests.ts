// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import fetchMock, { enableFetchMocks } from "jest-fetch-mock";

import { mockMediaQuery } from "test/MediaQuery";

mockMediaQuery();
enableFetchMocks();
fetchMock.mockReject(new Error("Mocked fetch fails by default"));

const createRangeMock = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: "BODY",
    ownerDocument: document,
  },
});

window.document.createRange = createRangeMock as any;
