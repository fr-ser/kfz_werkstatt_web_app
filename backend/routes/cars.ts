import * as fastify from "fastify";
import * as fp from "fastify-plugin";

import { getCars, getCar, deleteCar, saveCar, editCar } from "@backend/db/cars";
import { GetCar, SaveCar, EditCar } from "@backend/interfaces/api";
import { NotFoundError } from "@backend/common";
import { RouteOptionsWithBody } from "@backend/interfaces/helpers";
import { saveSchema, editSchema } from "@backend/routes/schemas/cars";

const getCarsRoute: fastify.RouteOptions = {
  url: "/api/cars",
  method: ["GET"],
  handler: async (_, reply) => {
    return reply.send(await getCars());
  },
};

const getCarRoute: fastify.RouteOptions = {
  url: "/api/cars/:carId",
  method: ["GET"],
  handler: async (request, reply) => {
    const carId = request.params.carId;
    let car: GetCar;
    try {
      car = await getCar(carId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        reply.code(404).send({ msg: error.toString() });
      } else {
        throw error;
      }
      return;
    }

    return reply.send(car);
  },
};

const deleteCarRoute: fastify.RouteOptions = {
  url: "/api/cars/:carId",
  method: ["DELETE"],
  handler: async (request, reply) => {
    const carId = request.params.carId;
    try {
      await deleteCar(carId);
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

const postCarRoute: RouteOptionsWithBody<SaveCar> = {
  url: "/api/cars",
  method: ["POST"],
  schema: { body: saveSchema },
  handler: async (request, reply) => {
    try {
      await saveCar(request.body);
    } catch (error) {
      reply.code(422).send({ msg: error });
      return;
    }
    reply.code(201).send();
  },
};

const putCarsRoute: RouteOptionsWithBody<EditCar> = {
  url: "/api/cars:carId",
  method: ["PUT"],
  schema: { body: editSchema },
  handler: async (request, reply) => {
    const carId = request.params.carId;

    try {
      await editCar(carId, request.body);
    } catch (error) {
      reply.code(422).send({ msg: error });
      return;
    }
    reply.code(200).send();
  },
};

export default fp(async (server, _, next) => {
  server.route(getCarsRoute);
  server.route(getCarRoute);
  server.route(deleteCarRoute);
  server.route(postCarRoute);
  server.route(putCarsRoute);

  next();
});
