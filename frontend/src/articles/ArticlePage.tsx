import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { withSnackbar, WithSnackbarProps } from "notistack";

import ArticleListItem from "articles/ArticlePageItem";
import TextFilter from "common/TextFilter";
import { GetArticle } from "common/api";
import { anyTextSearch, appFetch } from "common/utils";

const useStyles = makeStyles(theme => ({
  articlePage: {
    paddingTop: theme.spacing(1),
  },
}));

const ArticlePage = function({ enqueueSnackbar }: WithSnackbarProps) {
  const classes = useStyles();
  const [articles, setArticles] = useState([] as GetArticle[]);
  const [filterText, setFilter] = useState("");

  async function loadArticles() {
    try {
      const apiArticles = await appFetch({ url: "/api/articles", json: true });
      setArticles(apiArticles);
    } catch (error) {
      enqueueSnackbar("Laden der Artikel fehlgeschlagen", { variant: "error" });
      setArticles([]);
    }
  }

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classes.articlePage}>
      <TextFilter
        onChange={newFilter => {
          setFilter(newFilter);
        }}
      />
      {articles
        .filter(article => anyTextSearch(article, filterText))
        .map(article => (
          <ArticleListItem
            key={article.article_number}
            article={article}
            onUpdate={loadArticles}
          />
        ))}
    </div>
  );
};

export default withSnackbar(ArticlePage);
