import { withSnackbar, WithSnackbarProps } from "notistack";
import React from "react";
import { Grid, TextField, IconButton, makeStyles, Paper } from "@material-ui/core";
import { Save, DeleteForever } from "@material-ui/icons";

import { GetArticle } from "common/api";
import { appFetch } from "common/utils";

const useStyles = makeStyles(theme => ({
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

interface ArticleItemProps extends WithSnackbarProps {
  article: GetArticle;
  onUpdate: () => Promise<void>;
}

const ArticleListItem = function({ article, onUpdate, enqueueSnackbar }: ArticleItemProps) {
  const classes = useStyles();

  async function deleteArticle() {
    try {
      await appFetch({ url: `/api/articles/${article.article_number}`, method: "DELETE" });
      enqueueSnackbar("Artikel gelöscht", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Löschen fehlgeschlagen", { variant: "error" });
    }
    await onUpdate();
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
};

export default withSnackbar(ArticleListItem);
