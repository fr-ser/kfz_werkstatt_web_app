import React, { useState, useEffect } from "react";
import { makeStyles, Button } from "@material-ui/core";
import { withSnackbar, WithSnackbarProps } from "notistack";

import { ViewItem, NewItem } from "articles/ArticlePageItem";
import TextFilter from "common/TextFilter";
import { GetArticle } from "common/APIInterfaces";
import { anyTextSearch } from "common/utils";
import { getArticles } from "common/api";
import { useSidebar } from "common/Sidebar";

const useStyles = makeStyles((theme) => ({
  articlePage: {
    paddingTop: theme.spacing(1),
  },
}));

function ArticlePage({ enqueueSnackbar }: WithSnackbarProps) {
  const classes = useStyles();
  const [articles, setArticles] = useState([] as GetArticle[]);
  const [filterText, setFilter] = useState("");
  const [isNewArticleVisible, setIsNewArticleVisible] = useState(false);

  const { setMainActions } = useSidebar();

  async function loadArticles() {
    try {
      const apiArticles = await getArticles();
      setArticles(apiArticles.sort((a, b) => (a.article_number < b.article_number ? -1 : 1)));
    } catch (error) {
      enqueueSnackbar("Laden der Artikel fehlgeschlagen", { variant: "error" });
      setArticles([]);
    }
  }

  const sidebarActions = [
    <Button
      key="add-article"
      role="add-article"
      variant="contained"
      onClick={() => setIsNewArticleVisible(true)}
    >
      Artikel hinzufügen
    </Button>,
  ];

  useEffect(() => {
    setMainActions(sidebarActions);
    loadArticles();
    return function cleanup() {
      setMainActions([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={classes.articlePage}>
      <TextFilter
        onChange={(newFilter) => {
          setFilter(newFilter);
        }}
      />
      {!isNewArticleVisible ? null : (
        <NewItem onUpdate={loadArticles} discard={() => setIsNewArticleVisible(false)} />
      )}
      {articles
        .filter((article) => anyTextSearch(article, filterText))
        .map((article) => (
          <ViewItem key={article.article_number} article={article} onUpdate={loadArticles} />
        ))}
    </div>
  );
}

export default withSnackbar(ArticlePage);
