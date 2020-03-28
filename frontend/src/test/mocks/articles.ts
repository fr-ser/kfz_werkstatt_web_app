import * as faker from "faker";

import { GetArticle } from "common/api";

export const articleList: GetArticle[] = [
  {
    article_id: `Art1`,
    description: faker.commerce.product(),
    article_number: faker.commerce.product(),
    stock_amount: faker.random.number(),
    price: faker.random.number(),
  },
  {
    article_id: `Art2`,
    description: faker.commerce.product(),
    article_number: faker.commerce.product(),
    stock_amount: faker.random.number(),
    price: faker.random.number(),
  },
  {
    article_id: `Art3`,
    description: faker.commerce.product(),
    article_number: faker.commerce.product(),
    stock_amount: faker.random.number(),
    price: faker.random.number(),
  },
];
