import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import AppHeader from "common/AppHeader";
import { NavRoute } from "common/Navigation";
import ClientPage from "clients/ClientPage";
import CarPage from "cars/CarPage";
import OrderPage from "orders/OrderPage";
import OverviewPage from "overview/OverviewPage";
import DocumentPage from "documents/DocumentPage";
import ArticlePage from "articles/ArticlePage";

export default function App() {
  const [response, setResponse] = useState("initial");

  useEffect(() => {
    const doTheThing = async () => {
      try {
        const resp = await fetch("./api/health");
        const text = await resp.text();
        setResponse(text);
      } catch (error) {
        setResponse(error);
      }
    };

    doTheThing();
  }, []);

  return (
    <Router>
      <AppHeader />
      <h1>{response}</h1>
      <hr />

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
    </Router>
  );
}
