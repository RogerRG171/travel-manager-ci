/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { dayjs } from '../lib/dayjs'
import { ClientError } from '../errors/client-error'

export async function updatetrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/trips/:tripId',
    {
      schema: {
        body: z.object({
          destination: z
            .string()
            .min(3, 'Minimum 3 characters')
            .max(150, 'Maximum 150 characters'),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
        params: z.object({
          tripId: z.string().uuid('Invalid id'),
        }),
      },
    },
    async (request, reply) => {
      const { destination, starts_at, ends_at } = request.body

      const { tripId } = request.params

      let trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new ClientError('Invalid trip id')
      }

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new ClientError('Invalid trip start date')
      }

      if (dayjs(ends_at).isBefore(dayjs(starts_at))) {
        throw new ClientError('Invalid trip end date')
      }

      trip = await prisma.trip.update({
        where: {
          id: tripId,
        },
        data: {
          destination,
          starts_at,
          ends_at,
        },
      })

      return reply.status(201).send({ tripId: trip.id })
    },
  )
}
