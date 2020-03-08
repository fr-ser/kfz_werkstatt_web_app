import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { NotFoundError } from "@backend/common";
import { getOrder, getOrders, saveOrder, deleteOrder, editOrder } from "@backend/db/orders";
import { GetOrder, EditOrder, SaveOrder } from "@backend/interfaces/api";
import { RouteOptionsWithBody } from "@backend/interfaces/helpers";
import { saveSchema, editSchema } from "@backend/routes/schemas/orders";

const getOrdersRoute: fastify.RouteOptions = {
  url: "/api/orders",
  method: ["GET"],
  handler: async (request, reply) => {
    const orders = await getOrders();
    return reply.send(orders);
  },
};

const getOrderRoute: fastify.RouteOptions = {
  url: "/api/orders/:orderId",
  method: ["GET"],
  handler: async (request, reply) => {
    const orderId = request.params.orderId;
    let order: GetOrder;
    try {
      order = await getOrder(orderId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        reply.code(404).send({ msg: error.toString() });
      } else {
        throw error;
      }
      return;
    }

    return reply.send(order);
  },
};

const postOrdersRoute: RouteOptionsWithBody<SaveOrder> = {
  url: "/api/orders",
  method: ["POST"],
  schema: { body: saveSchema },
  handler: async (request, reply) => {
    try {
      await saveOrder(request.body);
    } catch (error) {
      reply.code(422).send({ msg: error });
      return;
    }
    reply.code(201).send();
  },
};

const deleteOrderRoute: fastify.RouteOptions = {
  url: "/api/orders/:orderId",
  method: ["DELETE"],
  handler: async (request, reply) => {
    const orderId = request.params.orderId;
    try {
      await deleteOrder(orderId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        reply.code(404).send({ msg: error.toString() });
      } else {
        reply.code(409).send({ msg: error.toString() });
      }
      return;
    }

    reply.send({ "msg:": `deleted` });
  },
};

const putOrdersRoute: RouteOptionsWithBody<EditOrder> = {
  url: "/api/orders:orderId",
  method: ["PUT"],
  schema: { body: editSchema },
  handler: async (request, reply) => {
    const orderId = request.params.orderId;

    try {
      await editOrder(orderId, request.body);
    } catch (error) {
      reply.code(422).send({ msg: error });
      return;
    }
    reply.code(200).send();
  },
};

export default fp(async (server, _, next) => {
  server.route(getOrdersRoute);
  server.route(getOrderRoute);
  server.route(postOrdersRoute);
  server.route(putOrdersRoute);
  server.route(deleteOrderRoute);

  next();
});
