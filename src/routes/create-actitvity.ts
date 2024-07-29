/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

import { dayjs } from '../lib/dayjs'

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/:tripId/activity',
    {
      schema: {
        body: z.object({
          title: z
            .string()
            .min(3, 'Minimum 3 characters')
            .max(150, 'Maximum 150 characters'),
          occurs_at: z.coerce.date(),
        }),
        params: z.object({
          tripId: z.string().uuid('Invalid id'),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params
      const { title, occurs_at } = request.body

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }

      if (dayjs(occurs_at).isBefore(trip.starts_at)) {
        throw new Error('Invalid activity date')
      }

      if (dayjs(occurs_at).isAfter(trip.ends_at)) {
        throw new Error('Invalid activity date')
      }

      const activity = await prisma.activity.create({
        data: {
          title,
          occurs_at,
          trip_id: tripId,
        },
      })

      return reply.status(201).send({ activityId: activity.id })
    },
  )
}
