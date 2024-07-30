/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../errors/client-error'

export async function getLinks(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/links',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid('Invalid id'),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          link: true,
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      return reply.status(201).send({ links: trip.link })
    },
  )
}
