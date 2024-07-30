import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function getTrips(app: FastifyInstance) {
  app.get('/trips', async (request, reply) => {
    const trips = await prisma.trip.findMany()
    reply.status(200).send({ trips })
  })
}
