import React, { useState } from "react";
import { Grid, TextField, IconButton, makeStyles, Paper } from "@material-ui/core";
import { Save, DeleteForever } from "@material-ui/icons";
import { withSnackbar, WithSnackbarProps } from "notistack";

import { SaveArticle, GetArticle } from "common/APIInterfaces";
import { strToFloat } from "common/utils";
import { deleteArticle, saveArticle, editArticle } from "common/api";

const useStyles = makeStyles((theme) => ({
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

interface BaseItemProps extends WithSnackbarProps {
  onSave: (articleOrError: Partial<GetArticle> | Error) => any;
  onDelete: (articleNumber: string) => any;
  initialArticleNumber: string;
  initialPrice: string;
  initialAmount: string;
  initialDescription: string;
}

const BaseItem = withSnackbar(function ({
  onSave,
  onDelete,
  initialArticleNumber,
  initialPrice,
  initialAmount,
  initialDescription,
}: BaseItemProps) {
  const classes = useStyles();

  const [articleNumber, setArticleNumber] = useState(initialArticleNumber);
  const handleArticleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArticleNumber(event.target.value);
  };
  const [price, setPrice] = useState(initialPrice);
  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(event.target.value);
  };
  const [amount, setAmount] = useState(initialAmount);
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };
  const [description, setDescription] = useState(initialDescription);
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  function forwardDelete() {
    onDelete(articleNumber);
  }

  function forwardSave() {
    let article: Partial<GetArticle> = {};

    if (articleNumber !== initialArticleNumber) {
      article.article_number = articleNumber;
    }

    if (description !== initialDescription) {
      article.description = description;
    }

    try {
      const newPrice = strToFloat(price);
      const previousPrice = initialPrice !== "" ? strToFloat(initialPrice) : "";
      if (newPrice !== previousPrice) {
        article.price = newPrice;
      }
    } catch (error) {
      onSave(new Error("Preis ist keine valide Zahl"));
      return;
    }

    try {
      const newAmount = amount ? strToFloat(amount) : "";
      const previousAmount = initialAmount !== "" ? strToFloat(initialAmount) : "";
      if (newAmount !== "" && newAmount !== previousAmount) {
        article.stock_amount = newAmount;
      }
    } catch (error) {
      onSave(new Error("Menge ist keine valide Zahl"));
      return;
    }

    onSave(article);
  }

  function onKeyPress(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      forwardSave();
    }
  }

  return (
    <Paper className={classes.paper}>
      <Grid role="article-item" container spacing={2} style={{ marginTop: 5 }}>
        <Grid item xs={2} className={classes.smallInfo}>
          <TextField
            inputProps={{ role: "article-number-input" }}
            onKeyPress={onKeyPress}
            fullWidth
            label="Artikel-Nr."
            value={articleNumber}
            onChange={handleArticleNumberChange}
          />
        </Grid>
        <Grid item xs={2} className={classes.smallInfo}>
          <TextField
            inputProps={{ role: "price-input" }}
            onKeyPress={onKeyPress}
            fullWidth
            label="Preis"
            value={price}
            onChange={handlePriceChange}
          />
        </Grid>
        <Grid item xs={2} className={classes.smallInfo}>
          <TextField
            inputProps={{ role: "amount-input" }}
            onKeyPress={onKeyPress}
            fullWidth
            label="Menge"
            value={amount}
            onChange={handleAmountChange}
          />
        </Grid>
        <Grid item xs={5} className={classes.description}>
          <TextField
            inputProps={{ role: "description-input" }}
            onKeyPress={onKeyPress}
            fullWidth
            label="Beschreibung"
            value={description}
            onChange={handleDescriptionChange}
          />
        </Grid>
        <Grid item xs={1} className={classes.actions}>
          <IconButton color="inherit" role="save-article" onClick={forwardSave}>
            <Save />
          </IconButton>
          <IconButton color="inherit" role="delete-article" onClick={forwardDelete}>
            <DeleteForever />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
});

interface NewItemProps extends WithSnackbarProps {
  onUpdate: () => Promise<void>;
  discard: () => void;
}

export const NewItem = withSnackbar(function ({
  onUpdate,
  discard,
  enqueueSnackbar,
}: NewItemProps) {
  async function onSave(articleOrError: Partial<GetArticle> | Error) {
    if (articleOrError instanceof Error) {
      enqueueSnackbar(`${articleOrError}`, { variant: "error" });
      return;
    }

    if (!("article_number" in articleOrError)) {
      enqueueSnackbar(`Artike-Nr. fehlt`, { variant: "error" });
      return;
    } else if (!("price" in articleOrError)) {
      enqueueSnackbar(`Preis fehlt`, { variant: "error" });
      return;
    } else if (!("description" in articleOrError)) {
      enqueueSnackbar(`Beschreibung fehlt`, { variant: "error" });
      return;
    }

    try {
      await saveArticle(articleOrError as SaveArticle);
      discard();
      enqueueSnackbar("Artikel gespeichert", { variant: "success" });
      await onUpdate();
    } catch (error) {
      enqueueSnackbar("Speichern fehlgeschlagen", { variant: "error" });
    }
  }

  return (
    <BaseItem
      initialArticleNumber=""
      initialPrice=""
      initialDescription=""
      initialAmount=""
      onDelete={discard}
      onSave={onSave}
    />
  );
});

interface ViewItemProps extends WithSnackbarProps {
  article: GetArticle;
  onUpdate: () => Promise<void>;
}

export const ViewItem = withSnackbar(function ({
  article,
  onUpdate,
  enqueueSnackbar,
}: ViewItemProps) {
  async function onDelete(articleNumber: string) {
    try {
      await deleteArticle(articleNumber);
      enqueueSnackbar("Artikel gelöscht", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Löschen fehlgeschlagen", { variant: "error" });
    }
    await onUpdate();
  }

  let initialAmount = "";
  if (article.stock_amount === 0 || !!article.stock_amount) {
    initialAmount = article.stock_amount.toLocaleString("de-DE");
  }

  async function onSave(articleOrError: Partial<GetArticle> | Error) {
    if (articleOrError instanceof Error) {
      enqueueSnackbar(`Fehler: ${articleOrError}`, { variant: "error" });
      return;
    } else if (Object.keys(articleOrError).length === 0) {
      enqueueSnackbar(`Nichts geändert`, { variant: "warning" });
      return;
    }

    try {
      await editArticle(article.article_number, articleOrError);
      enqueueSnackbar("Artikel gespeichert", { variant: "success" });
      await onUpdate();
    } catch (error) {
      enqueueSnackbar("Speichern fehlgeschlagen", { variant: "error" });
    }
  }

  return (
    <BaseItem
      initialArticleNumber={article.article_number}
      initialPrice={article.price.toLocaleString("de-DE")}
      initialDescription={article.description}
      initialAmount={initialAmount}
      onDelete={onDelete}
      onSave={onSave}
    />
  );
});
