import { NotFoundError } from "@backend/common";
import { getOrder, getOrders, deleteOrder, saveOrder, editOrder } from "@backend/db/orders";
import { DbPaymentMethod, DbOrderState } from "@backend/interfaces/db";
import { ApiOrderItemArticle, ApiOrderItemHeader } from "@backend/interfaces/api";

import { createCar } from "@tests/factory/car";
import { createClient } from "@tests/factory/client";
import { createOrder, createOrderItemArticle, createOrderItemHeader } from "@tests/factory/order";
import { db_cleanup } from "@tests/factory/factory";
import {
  getOrderCount,
  orderExists,
  getDbOrder,
  getOrderItemsCount,
  getDbOrderArticles,
  getDbOrderHeaders,
} from "@tests/orders/helpers";

describe("orders - database queries", () => {
  beforeEach(async () => {
    await db_cleanup();
  });

  describe("getOrder", () => {
    it("returns the order", async () => {
      const dbOrder = await createOrder();
      const orderHeader = await createOrderItemHeader({ orderId: dbOrder.order_id, position: 1 });
      const orderArticle = await createOrderItemArticle({
        orderId: dbOrder.order_id,
        position: 2,
      });

      const apiOrder = await getOrder(dbOrder.order_id);

      for (const key of Object.keys(dbOrder)) {
        expect((apiOrder as any)[key]).toEqual((dbOrder as any)[key]);
      }

      expect(apiOrder.items).toHaveLength(2);

      const apiHeader = apiOrder.items[0] as ApiOrderItemHeader;
      expect(apiHeader.position).toBe(orderHeader.position);
      expect(apiHeader.header).toBe(orderHeader.header);

      const apiItem = apiOrder.items[1] as ApiOrderItemArticle;
      expect(apiItem.position).toBe(orderArticle.position);
      expect(apiItem.article_id).toEqual(orderArticle.article_id);
      expect(apiItem.description).toEqual(orderArticle.description);
      expect(apiItem.amount).toEqual(orderArticle.amount);
      expect(apiItem.price_per_item).toEqual(orderArticle.price_per_item);
      expect(apiItem.discount).toEqual(orderArticle.discount);
    });

    it("throws the NotFoundError if no order exists", async () => {
      try {
        await getOrder("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("getOrders", () => {
    it("returns an empty list for no orders", async () => {
      expect(await getOrders()).toEqual([]);
    });

    it("returns all orders", async () => {
      const dbOrder1 = await createOrder();
      const orderArticle = await createOrderItemArticle({
        orderId: dbOrder1.order_id,
      });
      const dbOrder2 = await createOrder();

      const apiOrders = await getOrders();

      expect(apiOrders).toHaveLength(2);

      const apiOrder1 = apiOrders.find(x => x.order_id === dbOrder1.order_id);
      const apiOrder2 = apiOrders.find(x => x.order_id === dbOrder2.order_id);

      for (const key of Object.keys(dbOrder1)) {
        expect((apiOrder1 as any)[key]).toEqual((dbOrder1 as any)[key]);
      }
      expect(apiOrder1!.items).toHaveLength(1);
      const apiItem = apiOrder1!.items[0] as ApiOrderItemArticle;
      expect(apiItem.position).toBe(orderArticle.position);
      expect(apiItem.article_id).toEqual(orderArticle.article_id);
      expect(apiItem.description).toEqual(orderArticle.description);
      expect(apiItem.amount).toEqual(orderArticle.amount);
      expect(apiItem.price_per_item).toEqual(orderArticle.price_per_item);
      expect(apiItem.discount).toEqual(orderArticle.discount);

      for (const key of Object.keys(dbOrder2)) {
        expect((apiOrder2 as any)[key]).toEqual((dbOrder2 as any)[key]);
      }
      expect(apiOrder2!.items).toEqual([]);
    });
  });

  describe("deleteOrder", () => {
    it("deletes an order", async () => {
      // create an order and header, which should not be deleted
      await createOrderItemHeader();
      // the order and article below should be deleted
      const dbOrder = await createOrder();
      await createOrderItemArticle({
        orderId: dbOrder.order_id,
      });
      expect(await orderExists(dbOrder.order_id)).toBe(true);
      expect(await getOrderCount()).toBe(2);
      expect(await getOrderItemsCount()).toBe(2);

      await deleteOrder(dbOrder.order_id);

      expect(await orderExists(dbOrder.order_id)).toBe(false);
      expect(await getOrderCount()).toBe(1);
      expect(await getOrderItemsCount()).toBe(1);
    });

    it("throws the NotFoundError, if the order does not exist", async () => {
      try {
        await deleteOrder("not_existing");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("saveOrder", () => {
    it("saves an order without items", async () => {
      const client = await createClient();
      const car = await createCar();
      const orderId = "sth";
      expect(await orderExists(orderId)).toBe(false);

      const payload = {
        order_id: orderId,
        car_id: car.car_id,
        client_id: client.client_id,
        title: "string",
        date: "2012-12-12",
        payment_due_date: "2012-12-12",
        payment_method: DbPaymentMethod.cash,
        state: DbOrderState.in_progress,
        description: "Some lengthy description",
        mileage: 222.333,
        items: [],
      };
      await saveOrder(payload);

      const dbOrder = await getDbOrder(orderId);
      for (const [key, value] of Object.entries(dbOrder)) {
        expect((payload as any)[key]).toEqual(value);
      }
      expect(await getOrderItemsCount()).toBe(0);
    });

    it("saves an order with items", async () => {
      const client = await createClient();
      const car = await createCar();
      const orderId = "sth";
      expect(await orderExists(orderId)).toBe(false);

      const payload = {
        order_id: orderId,
        car_id: car.car_id,
        client_id: client.client_id,
        title: "string",
        date: "2012-12-12",
        payment_due_date: "2012-12-12",
        payment_method: DbPaymentMethod.cash,
        state: DbOrderState.in_progress,
        description: "Some lengthy description",
        mileage: 222.333,
        items: [
          { position: 1, header: "This is the header" },
          {
            position: 2,
            article_id: "Q3Z",
            description: "Oil change (h)",
            amount: 2,
            price_per_item: 22.33,
            discount: 0.1,
          },
        ],
      };
      await saveOrder(payload);

      const dbOrder = await getDbOrder(orderId);
      for (const [key, value] of Object.entries(dbOrder)) {
        expect((payload as any)[key]).toEqual(value);
      }

      const orderArticles = await getDbOrderArticles(orderId);
      expect(orderArticles).toHaveLength(1);
      expect(orderArticles[0].position).toBe(payload.items[1].position);
      expect(orderArticles[0].article_id).toBe(payload.items[1].article_id);
      expect(orderArticles[0].description).toBe(payload.items[1].description);
      expect(orderArticles[0].amount).toBe(payload.items[1].amount);
      expect(orderArticles[0].price_per_item).toBe(payload.items[1].price_per_item);
      expect(orderArticles[0].discount).toBe(payload.items[1].discount);

      const orderHeaders = await getDbOrderHeaders(orderId);
      expect(orderHeaders).toHaveLength(1);
      expect(orderHeaders[0].position).toBe(payload.items[0].position);
      expect(orderHeaders[0].header).toBe(payload.items[0].header);
    });

    it("throws an error if the order cannot be saved", async () => {
      try {
        await saveOrder({} as any);
      } catch (error) {
        return;
      }
      fail("nothing thrown");
    });
  });

  describe("editOrder", () => {
    const changeProperties = [
      { changeProperty: "title", newValue: "sth" },
      { changeProperty: "date", newValue: "2020-12-12" },
      { changeProperty: "payment_due_date", newValue: "2020-12-12" },
      { changeProperty: "payment_method", newValue: DbPaymentMethod.remittance },
      { changeProperty: "state", newValue: DbOrderState.cancelled },
    ];
    for (const { changeProperty, newValue } of changeProperties) {
      it(`changes the property: ${changeProperty}`, async () => {
        const order = await createOrder();

        await editOrder(order.order_id, { [changeProperty]: newValue });

        const dbOrder = await getDbOrder(order.order_id);
        expect((dbOrder as any)[changeProperty]).toEqual(newValue);
      });
    }

    it(`changes the property: car_id`, async () => {
      const newCar = await createCar();
      const order = await createOrder();

      await editOrder(order.order_id, { car_id: newCar.car_id });

      const dbOrder = await getDbOrder(order.order_id);
      expect(dbOrder.car_id).toEqual(newCar.car_id);
    });

    it(`changes the property: client_id`, async () => {
      const newClient = await createClient();
      const order = await createOrder();

      await editOrder(order.order_id, { client_id: newClient.client_id });

      const dbOrder = await getDbOrder(order.order_id);
      expect(dbOrder.client_id).toEqual(newClient.client_id);
    });

    it(`deletes order.items`, async () => {
      const order = await createOrder();

      await createOrderItemHeader({ orderId: order.order_id });
      expect(await getDbOrderHeaders(order.order_id)).toHaveLength(1);

      await editOrder(order.order_id, { items: [] });

      expect(await getDbOrderHeaders(order.order_id)).toHaveLength(0);
    });

    it(`edits order.items`, async () => {
      const order = await createOrder();
      await createOrderItemHeader({ orderId: order.order_id });
      expect(await getOrderItemsCount()).toBe(1);

      const newOrderArticle = {
        position: 1,
        article_id: "akz",
        description: "work per hour",
        price_per_item: 22.11,
        discount: 0,
        amount: 3.3,
      };
      await editOrder(order.order_id, { items: [newOrderArticle] });

      expect(await getOrderItemsCount()).toBe(1);

      const orderArticle = (await getDbOrderArticles(order.order_id))[0];
      expect(orderArticle.position).toBe(newOrderArticle.position);
      expect(orderArticle.article_id).toBe(newOrderArticle.article_id);
      expect(orderArticle.description).toBe(newOrderArticle.description);
      expect(orderArticle.price_per_item).toBe(newOrderArticle.price_per_item);
      expect(orderArticle.discount).toBe(newOrderArticle.discount);
      expect(orderArticle.amount).toBe(newOrderArticle.amount);
    });

    it("changes multiple properties at once", async () => {
      const newClient = await createClient();
      const newCar = await createCar();
      const order = await createOrder();

      await editOrder(order.order_id, {
        title: "HH-12-12",
        state: DbOrderState.cancelled,
        client_id: newClient.client_id,
        car_id: newCar.car_id,
      });

      const dbOrder = await getDbOrder(order.order_id);
      expect(dbOrder.title).toEqual("HH-12-12");
      expect(dbOrder.state).toEqual(DbOrderState.cancelled);
      expect(dbOrder.client_id).toEqual(newClient.client_id);
      expect(dbOrder.car_id).toEqual(newCar.car_id);
    });

    it("throws an error if the order cannot be edited", async () => {
      const order = await createOrder();

      try {
        await editOrder(order.order_id, { client_id: "y" });
      } catch (error) {
        return;
      }
      fail("nothing thrown");
    });

    it("throws the NotFoundError if the order does not exist", async () => {
      try {
        await editOrder("not_existing", {} as any);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        return;
      }
      fail("nothing thrown");
    });
  });
});
