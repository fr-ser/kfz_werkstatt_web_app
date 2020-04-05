import { appFetch } from "common/utils";
import { GetArticle, SaveArticle, EditArticle } from "./APIInterfaces";

export async function getArticles(): Promise<GetArticle[]> {
  return appFetch({ url: "/api/articles" });
}

export async function deleteArticle(articleNumber: string) {
  await appFetch({ url: `/api/articles/${articleNumber}`, method: "DELETE" });
}

export async function saveArticle(article: SaveArticle) {
  await appFetch({
    url: `/api/articles`,
    method: "POST",
    jsonData: article,
    jsonResponse: false,
  });
}

export async function editArticle(articleNumber: string, articleChanges: EditArticle) {
  await appFetch({
    url: `/api/articles/${articleNumber}`,
    method: "PUT",
    jsonData: articleChanges,
    jsonResponse: false,
  });
}
