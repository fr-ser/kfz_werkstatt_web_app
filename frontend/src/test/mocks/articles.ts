import * as faker from "faker";

import { GetArticle } from "common/api";

export const articleList: GetArticle[] = [
  {
    article_number: `Art1`,
    description: faker.commerce.product(),
    stock_amount: faker.random.number(),
    price: faker.random.number(),
  },
  {
    article_number: `Art2`,
    description: faker.commerce.product(),
    stock_amount: faker.random.number(),
    price: faker.random.number(),
  },
  {
    article_number: `Art3`,
    description: faker.commerce.product(),
    stock_amount: faker.random.number(),
    price: faker.random.number(),
  },
];
