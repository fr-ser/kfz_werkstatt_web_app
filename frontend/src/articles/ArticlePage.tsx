import React, { useState, useEffect } from "react";
import { Grid, TextField, IconButton, makeStyles, Paper } from "@material-ui/core";
import { Save, DeleteForever } from "@material-ui/icons";

import TextFilter from "common/TextFilter";
import { GetArticle } from "common/api";
import { anyTextSearch } from "common/utils";

const useStyles = makeStyles(theme => ({
  articlePage: {
    paddingTop: theme.spacing(1),
  },
  paper: {
    marginTop: 20,
    padding: theme.spacing(0, 1),
  },
  smallInfo: {
    minWidth: 75,
  },
  description: {
    minWidth: 215,
  },
  actions: {
    minWidth: 100,
    whiteSpace: "nowrap",
  },
}));

interface ArticleItemProps {
  article: GetArticle;
  onUpdate: () => Promise<void>;
}

function ArticleListItem({ article, onUpdate }: ArticleItemProps) {
  const classes = useStyles();

  async function deleteArticle() {
    try {
      await fetch(`/api/articles/${article.article_number}`, { method: "DELETE" });
      await onUpdate();
    } catch (error) {
      // TODO: notify of error
    }
  }

  return (
    <Paper className={classes.paper}>
      <Grid role="article-item" container spacing={2} style={{ marginTop: 5 }}>
        <Grid item xs={2} className={classes.smallInfo}>
          <TextField fullWidth label="Artikel-Nr." defaultValue={article.article_number} />
        </Grid>
        <Grid item xs={2} className={classes.smallInfo}>
          <TextField
            fullWidth
            label="Preis"
            defaultValue={article.price.toLocaleString("de-DE")}
          />
        </Grid>
        <Grid item xs={2} className={classes.smallInfo}>
          <TextField
            fullWidth
            label="Menge"
            defaultValue={article.stock_amount?.toLocaleString("de-DE")}
          />
        </Grid>
        <Grid item xs={5} className={classes.description}>
          <TextField fullWidth label="Beschreibung" defaultValue={article.description} />
        </Grid>
        <Grid item xs={1} className={classes.actions}>
          <IconButton color="inherit">
            <Save />
          </IconButton>
          <IconButton color="inherit" role="delete-article" onClick={deleteArticle}>
            <DeleteForever />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default function ArticlePage() {
  const classes = useStyles();
  const [articles, setArticles] = useState([] as GetArticle[]);
  const [filterText, setFilter] = useState("");

  async function loadArticles() {
    try {
      const resp = await fetch("/api/articles");
      const apiArticles = await resp.json();
      setArticles(apiArticles);
    } catch (error) {
      // TODO: show notification or Sentry?
      setArticles([]);
    }
  }

  useEffect(() => {
    loadArticles();
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
}
