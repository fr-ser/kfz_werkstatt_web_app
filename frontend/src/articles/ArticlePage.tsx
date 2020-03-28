import React, { useState, useEffect } from "react";
import { Divider, Grid, TextField, IconButton } from "@material-ui/core";
import { Save, DeleteForever } from "@material-ui/icons";

import { GetArticle } from "common/api";

function ArticleListItem({ article }: { article: GetArticle }) {
  return (
    <Grid role="article-item" container spacing={2} style={{ marginTop: 5 }}>
      <Grid item xs={2}>
        <TextField fullWidth label="Artikel-Nr." defaultValue={article.article_number} />
      </Grid>
      <Grid item xs={2}>
        <TextField fullWidth label="Preis" defaultValue={article.price.toLocaleString("de-DE")} />
      </Grid>
      <Grid item xs={2}>
        <TextField
          fullWidth
          label="Menge"
          defaultValue={article.stock_amount?.toLocaleString("de-DE")}
        />
      </Grid>
      <Grid item xs={5}>
        <TextField fullWidth label="Beschreibung" defaultValue={article.description} />
      </Grid>
      <Grid item xs={1}>
        <IconButton color="inherit">
          <Save />
        </IconButton>
        <IconButton color="inherit">
          <DeleteForever />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default function ArticlePage() {
  const [articles, setArticles] = useState([] as GetArticle[]);

  async function loadArticles() {
    try {
      const resp = await fetch("/api/articles");
      const apiArticles = await resp.json();
      setArticles(apiArticles);
    } catch (error) {
      console.error(error);
      // TODO: show notification
      setArticles([]);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div>
      <h2>Articles</h2>
      <Divider />
      {articles.map(article => (
        <ArticleListItem key={article.article_id} article={article} />
      ))}
    </div>
  );
}
