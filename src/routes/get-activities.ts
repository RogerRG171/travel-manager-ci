/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { dayjs } from '../lib/dayjs'

export async function getActivities(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/activities',
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
          activity: {
            orderBy: {
              occurs_at: 'asc',
            },
          },
        },
      })

      if (!trip) {
        throw new Error('Trip not found.')
      }
      const differenceInDaysBetweenTripStartsAndEnds = dayjs(trip.ends_at).diff(
        trip.starts_at,
        'days',
      )
      const activities = Array.from({
        length: differenceInDaysBetweenTripStartsAndEnds + 1,
      }).map((_, index) => {
        const date = dayjs(trip.starts_at).add(index, 'day')
        return {
          date: date.toDate(),
          activities: trip.activity.filter((activity) => {
            return dayjs(activity.occurs_at).isSame(date, 'day')
          }),
        }
      })

      return reply.status(201).send({ activities })
    },
  )
}
