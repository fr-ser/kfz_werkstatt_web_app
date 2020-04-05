import React from "react";
import { fireEvent, act } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import { MemoryRouter } from "react-router-dom";

import ArticlePage from "articles/ArticlePage";
import App from "App";

import { render } from "test/render";
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
        target: { value: `${articleList[0].article_number} ${articleList[0].description}` },
      });
      jest.advanceTimersByTime(500);
    });

    const articles = getAllByRole("article-item");
    expect(articles).toHaveLength(1);
  });

  it("can delete an article", async () => {
    const article = articleList[0];
    fetchMock.mockIf(/api\/articles/, JSON.stringify([article]));

    const { getByRole, findByRole } = render(<ArticlePage />);

    await findByRole("article-item");
    fetchMock.resetMocks();

    await act(async () => {
      fireEvent.click(getByRole("delete-article"));
    });

    expect(fetchMock.mock.calls).toHaveLength(2);
    const deleteCall = fetchMock.mock.calls[0] as any;
    expect(deleteCall[1].method).toBe("DELETE");
    expect(deleteCall[0]).toBe(`/api/articles/${article.article_number}`);
  });

  it("can add and remove an article row", async () => {
    fetchMock.mockIf(/api\/articles/, "[]");

    const { getByRole, findByRole, queryByRole } = render(
      <MemoryRouter initialEntries={["/articles"]}>
        <App />
      </MemoryRouter>
    );
    fetchMock.resetMocks();

    await act(async () => {
      fireEvent.click(await findByRole("add-article"));
      fireEvent.click(getByRole("delete-article"));
    });

    expect(queryByRole("delete-article")).toBeFalsy();
  });

  it("can add an article", async () => {
    const article = articleList[0];
    fetchMock.mockIf(/api\/articles/, "[]");

    const { queryAllByRole, getByRole, findByRole } = render(
      <MemoryRouter initialEntries={["/articles"]}>
        <App />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.click(await findByRole("add-article"));

      fireEvent.change(getByRole("article-number-input"), {
        target: { value: article.article_number },
      });
      fireEvent.change(getByRole("price-input"), {
        target: { value: article.price.toLocaleString("de-DE") },
      });
      fireEvent.change(getByRole("amount-input"), {
        target: { value: article.stock_amount?.toLocaleString("de-DE") },
      });
      fireEvent.change(getByRole("description-input"), {
        target: { value: article.description },
      });

      fetchMock.resetMocks();
      fireEvent.click(getByRole("save-article"));
    });

    // refresh page and mock still returns nothing
    expect(queryAllByRole("article-item")).toHaveLength(0);

    expect(fetchMock.mock.calls).toHaveLength(2);
    const saveCall = fetchMock.mock.calls[0] as any;
    expect(saveCall[1].method).toBe("POST");
    const savedArticle = JSON.parse(saveCall[1].body);
    expect(savedArticle).toEqual(article);
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

  describe("edit an article", () => {
    const initialArticle = articleList[0];
    const testCases = [
      {
        inputRole: "article-number-input",
        newInputValue: initialArticle.article_number + "a",
        changeRequest: { article_number: initialArticle.article_number + "a" },
      },
      {
        inputRole: "price-input",
        newInputValue: (initialArticle.price + 1).toLocaleString("de-DE"),
        changeRequest: { price: initialArticle.price + 1 },
      },
      {
        inputRole: "amount-input",
        newInputValue: ((initialArticle.stock_amount as number) + 1).toLocaleString("de-DE"),
        changeRequest: { stock_amount: (initialArticle.stock_amount as number) + 1 },
      },
      {
        inputRole: "description-input",
        newInputValue: initialArticle.description + "a",
        changeRequest: { description: initialArticle.description + "a" },
      },
    ];

    for (const { inputRole, newInputValue, changeRequest } of Object.values(testCases)) {
      it(`can edit the ${inputRole}`, async () => {
        fetchMock.mockIf(/api\/articles/, JSON.stringify([initialArticle]));

        const { getByRole, findByRole } = render(
          <MemoryRouter initialEntries={["/articles"]}>
            <App />
          </MemoryRouter>
        );

        await act(async () => {
          fireEvent.change(await findByRole(inputRole), {
            target: { value: newInputValue },
          });

          fetchMock.resetMocks();
          fireEvent.click(getByRole("save-article"));
        });

        expect(fetchMock.mock.calls).toHaveLength(2);
        const saveCall = fetchMock.mock.calls[0] as any;
        expect(saveCall[1].method).toBe("PUT");
        const articleChange = JSON.parse(saveCall[1].body);
        expect(articleChange).toEqual(changeRequest);
      });
    }

    it("changes all the attributes at once", async () => {
      fetchMock.mockIf(/api\/articles/, JSON.stringify([initialArticle]));

      const { getByRole, findByRole } = render(
        <MemoryRouter initialEntries={["/articles"]}>
          <App />
        </MemoryRouter>
      );

      await act(async () => {
        fireEvent.change(await findByRole("article-number-input"), {
          target: { value: "a" },
        });
        fireEvent.change(await findByRole("price-input"), {
          target: { value: "0" },
        });
        fireEvent.change(await findByRole("amount-input"), {
          target: { value: "1" },
        });
        fireEvent.change(await findByRole("description-input"), {
          target: { value: "b" },
        });

        fetchMock.resetMocks();
        fireEvent.click(getByRole("save-article"));
      });

      expect(fetchMock.mock.calls).toHaveLength(2);
      const saveCall = fetchMock.mock.calls[0] as any;
      expect(saveCall[1].method).toBe("PUT");
      const articleChange = JSON.parse(saveCall[1].body);
      expect(articleChange).toEqual({
        article_number: "a",
        price: 0,
        stock_amount: 1,
        description: "b",
      });
    });
  });
});
