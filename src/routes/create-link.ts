/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { ClientError } from '../errors/client-error'

export async function createLink(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/link',
    {
      schema: {
        body: z.object({
          title: z
            .string()
            .min(3, 'Minimum 3 characters')
            .max(150, 'Maximum 150 characters'),
          url: z.string().url({ message: 'Invalid url' }),
        }),
        params: z.object({
          tripId: z.string().uuid('Invalid id'),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { title, url } = request.body

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new ClientError('Trip not found.')
      }

      const link = await prisma.link.create({
        data: {
          title,
          url,
          trip_id: tripId,
        },
      })

      return reply.status(201).send({ linkId: link.id })
    },
  )
}
