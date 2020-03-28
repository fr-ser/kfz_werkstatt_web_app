import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { makeStyles, Theme } from "@material-ui/core/styles";

import AppHeader from "common/AppHeader";
import Sidebar, { SidebarProvider } from "common/Sidebar";
import { NavRoute } from "common/Navigation";
import ClientPage from "clients/ClientPage";
import CarPage from "cars/CarPage";
import OrderPage from "orders/OrderPage";
import OverviewPage from "overview/OverviewPage";
import DocumentPage from "documents/DocumentPage";
import ArticlePage from "articles/ArticlePage";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
  },
  content: {
    flexGrow: 1,
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
  },
  // necessary for content to be below app bar
  appHeaderSpacer: theme.mixins.toolbar,
}));

export default function App() {
  const classes = useStyles();
  return (
    <Router>
      <div className={classes.root}>
        <SidebarProvider>
          <AppHeader />
          <Sidebar />
          <div className={classes.content}>
            <div className={classes.appHeaderSpacer} />
            <Switch>
              <Route path={`/${NavRoute.clients}`}>
                <ClientPage />
              </Route>
              <Route path={`/${NavRoute.cars}`}>
                <CarPage />
              </Route>
              <Route path={`/${NavRoute.orders}`}>
                <OrderPage />
              </Route>
              <Route path={`/${NavRoute.documents}`}>
                <DocumentPage />
              </Route>
              <Route path={`/${NavRoute.articles}`}>
                <ArticlePage />
              </Route>
              {/* fallback/default route is overview */}
              <Route>
                <OverviewPage />
              </Route>
            </Switch>
          </div>
        </SidebarProvider>
      </div>
    </Router>
  );
}
