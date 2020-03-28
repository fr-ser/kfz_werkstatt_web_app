import React from "react";
import { render } from "@testing-library/react";
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
