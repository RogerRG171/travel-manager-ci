import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../lib/prisma'

export async function confirmParticipant(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participant/:participantId/confirm',
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid('Invalid participant id'),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params

      const paticipant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      })

      if (!paticipant) {
        throw new Error('Participant not found.')
      }

      if (paticipant.is_confirmed) {
        return reply.redirect(
          `http://localhost:3000/trips/${paticipant.trip_id}`,
        )
      }

      await prisma.participant.update({
        where: {
          id: participantId,
        },
        data: {
          is_confirmed: true,
        },
      })

      return reply.redirect(`http://localhost:3000/trips/${paticipant.trip_id}`)
    },
  )
}
