/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function getPartcipantDetails(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/participant/:participantId',
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid('Invalid id'),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params

      const participant = await prisma.participant.findUnique({
        where: {
          id: participantId,
        },
      })

      if (!participant) {
        throw new Error('Participant not found.')
      }

      return reply.status(201).send({ participant })
    },
  )
}
