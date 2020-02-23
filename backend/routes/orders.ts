import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getOrders } from "@backend/db/orders";

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
    const order = await getOrders(orderId);

    if (order) return reply.send(order);
    else reply.code(404).send({ "msg:": `no order found for ${orderId}` });
  },
};
export default fp(async (server, opts, next) => {
  server.route(getOrdersRoute);
  server.route(getOrderRoute);
  next();
});
