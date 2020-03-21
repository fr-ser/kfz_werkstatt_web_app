export enum NavRoute {
  clients = "clients",
  cars = "cars",
  orders = "orders",
  overview = "overview",
  documents = "documents",
  articles = "articles",
}

export const routeNames = {
  [NavRoute.clients]: "kunden",
  [NavRoute.cars]: "autos",
  [NavRoute.orders]: "aufträge",
  [NavRoute.overview]: "übersicht",
  [NavRoute.documents]: "dokumente",
  [NavRoute.articles]: "artikel",
};
