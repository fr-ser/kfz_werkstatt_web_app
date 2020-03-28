import fetchMock from "jest-fetch-mock";

export function resetFetchMock() {
  fetchMock.resetMocks();
  fetchMock.mockReject(new Error("Mocked fetch fails by default"));
}
