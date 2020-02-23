import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getCars } from "@backend/db/cars";

const getCarsRoute: fastify.RouteOptions = {
  url: "/api/cars",
  method: ["GET"],
  handler: async (request, reply) => {
    const cars = await getCars();
    return reply.send(cars);
  },
};

const getClientRoute: fastify.RouteOptions = {
  url: "/api/cars/:carId",
  method: ["GET"],
  handler: async (request, reply) => {
    const carId = request.params.carId;
    const car = await getCars(carId);

    if (car) return reply.send(car);
    else reply.code(404).send({ "msg:": `no car found for ${carId}` });
  },
};
export default fp(async (server, opts, next) => {
  server.route(getCarsRoute);
  server.route(getClientRoute);
  next();
});
