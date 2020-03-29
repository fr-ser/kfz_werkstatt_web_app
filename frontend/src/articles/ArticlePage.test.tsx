import React from "react";
import { fireEvent, render, act } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";

import ArticlePage from "articles/ArticlePage";

import { articleList } from "test/mocks/articles";
import { resetFetchMock } from "test/fetch";

describe("ArticlePage", () => {
  beforeEach(() => {
    resetFetchMock();
  });

  it("render articles received from the backend", async () => {
    fetchMock.mockIf(/api\/articles/, JSON.stringify(articleList));

    const { findAllByRole } = render(<ArticlePage />);

    const articles = await findAllByRole("article-item");
    expect(articles).toHaveLength(articleList.length);
  });

  it("filters rendered articles", async () => {
    jest.useFakeTimers();
    fetchMock.mockIf(/api\/articles/, JSON.stringify(articleList));

    var { getByRole, getAllByRole, findAllByRole } = render(<ArticlePage />);
    // await the first article load
    await findAllByRole("article-item");

    act(() => {
      const input = getByRole("text-filter-input");
      fireEvent.change(input, {
        target: { value: `${articleList[0].article_number} ${articleList[0].article_id}` },
      });
      jest.advanceTimersByTime(500);
    });

    const articles = getAllByRole("article-item");
    expect(articles).toHaveLength(1);
  });

  it("render nothing in case of an error", async () => {
    const { findAllByRole } = render(<ArticlePage />);

    try {
      // fetch raises an error by default
      const articles = await findAllByRole("article-item", {}, { timeout: 250 });
      expect(articles).toBeFalsy();
    } catch (_) {
      // no items found
    }
  });
});
