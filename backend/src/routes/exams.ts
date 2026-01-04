import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, not } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { generateId } from '../lib/id.js';

export function registerExamRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/exams - Get all exams for authenticated user
  app.fastify.get(
    '/api/exams',
    {
      schema: {
        description: 'Get all exams for authenticated user',
        tags: ['exams'],
        querystring: {
          type: 'object',
          properties: {
            archived: { type: 'boolean', description: 'Filter by archived status' },
          },
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'string' },
                title: { type: 'string' },
                subject: { type: 'string' },
                dateTime: { type: 'string' },
                location: { type: 'string' },
                pressureMode: { type: 'string', enum: ['calm', 'realistic', 'brutal'] },
                archived: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { archived } = request.query as { archived?: boolean };

      const conditions = [eq(schema.exams.userId, session.user.id)];
      if (archived !== undefined) {
        conditions.push(eq(schema.exams.archived, archived));
      }

      const exams = await app.db
        .select()
        .from(schema.exams)
        .where(and(...conditions));

      return exams;
    }
  );

  // POST /api/exams - Create new exam
  app.fastify.post(
    '/api/exams',
    {
      schema: {
        description: 'Create a new exam',
        tags: ['exams'],
        body: {
          type: 'object',
          required: ['title', 'dateTime'],
          properties: {
            title: { type: 'string' },
            subject: { type: 'string' },
            dateTime: { type: 'string' },
            location: { type: 'string' },
            pressureMode: { type: 'string', enum: ['calm', 'realistic', 'brutal'] },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              title: { type: 'string' },
              subject: { type: 'string' },
              dateTime: { type: 'string' },
              location: { type: 'string' },
              pressureMode: { type: 'string' },
              archived: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { title, subject, dateTime, location, pressureMode = 'calm' } = request.body as {
        title: string;
        subject?: string;
        dateTime: string;
        location?: string;
        pressureMode?: 'calm' | 'realistic' | 'brutal';
      };

      // Get user settings
      const userSettings = await app.db.query.userSettings.findFirst({
        where: eq(schema.userSettings.userId, session.user.id),
      });

      const isPremium = userSettings?.isPremium ?? false;

      // Check limits for free users
      if (!isPremium) {
        // Free users limited to 'calm' pressure mode
        if (pressureMode !== 'calm') {
          return reply.status(400).send({
            error: 'Free users can only use calm pressure mode',
          });
        }

        // Free users limited to 1 active exam
        const activeExamCount = await app.db
          .select()
          .from(schema.exams)
          .where(
            and(eq(schema.exams.userId, session.user.id), eq(schema.exams.archived, false))
          );

        if (activeExamCount.length >= 1) {
          return reply.status(400).send({
            error: 'Free users can only have 1 active exam. Archive an exam to create a new one.',
          });
        }
      }

      const examId = generateId();
      const newExam = {
        id: examId,
        userId: session.user.id,
        title,
        subject: subject || null,
        dateTime: new Date(dateTime),
        location: location || null,
        pressureMode: pressureMode as 'calm' | 'realistic' | 'brutal',
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await app.db.insert(schema.exams).values(newExam);

      reply.status(201);
      return newExam;
    }
  );

  // GET /api/exams/:id - Get single exam
  app.fastify.get(
    '/api/exams/:id',
    {
      schema: {
        description: 'Get a single exam by ID',
        tags: ['exams'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              title: { type: 'string' },
              subject: { type: 'string' },
              dateTime: { type: 'string' },
              location: { type: 'string' },
              pressureMode: { type: 'string' },
              archived: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };

      const exam = await app.db.query.exams.findFirst({
        where: and(eq(schema.exams.id, id), eq(schema.exams.userId, session.user.id)),
      });

      if (!exam) {
        return reply.status(404).send({ error: 'Exam not found' });
      }

      return exam;
    }
  );

  // PUT /api/exams/:id - Update exam
  app.fastify.put(
    '/api/exams/:id',
    {
      schema: {
        description: 'Update an exam',
        tags: ['exams'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            subject: { type: 'string' },
            dateTime: { type: 'string' },
            location: { type: 'string' },
            pressureMode: { type: 'string', enum: ['calm', 'realistic', 'brutal'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              title: { type: 'string' },
              subject: { type: 'string' },
              dateTime: { type: 'string' },
              location: { type: 'string' },
              pressureMode: { type: 'string' },
              archived: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };
      const updateData = request.body as {
        title?: string;
        subject?: string;
        dateTime?: string;
        location?: string;
        pressureMode?: 'calm' | 'realistic' | 'brutal';
      };

      // Verify exam belongs to user
      const exam = await app.db.query.exams.findFirst({
        where: and(eq(schema.exams.id, id), eq(schema.exams.userId, session.user.id)),
      });

      if (!exam) {
        return reply.status(404).send({ error: 'Exam not found' });
      }

      // If updating pressure mode for free user, validate
      if (updateData.pressureMode) {
        const userSettings = await app.db.query.userSettings.findFirst({
          where: eq(schema.userSettings.userId, session.user.id),
        });

        const isPremium = userSettings?.isPremium ?? false;
        if (!isPremium && updateData.pressureMode !== 'calm') {
          return reply.status(400).send({
            error: 'Free users can only use calm pressure mode',
          });
        }
      }

      const updates = {
        ...(updateData.title !== undefined && { title: updateData.title }),
        ...(updateData.subject !== undefined && { subject: updateData.subject }),
        ...(updateData.dateTime !== undefined && { dateTime: new Date(updateData.dateTime) }),
        ...(updateData.location !== undefined && { location: updateData.location }),
        ...(updateData.pressureMode !== undefined && {
          pressureMode: updateData.pressureMode,
        }),
        updatedAt: new Date(),
      };

      await app.db
        .update(schema.exams)
        .set(updates)
        .where(eq(schema.exams.id, id));

      const updated = await app.db.query.exams.findFirst({
        where: eq(schema.exams.id, id),
      });

      return updated;
    }
  );

  // DELETE /api/exams/:id - Delete exam
  app.fastify.delete(
    '/api/exams/:id',
    {
      schema: {
        description: 'Delete an exam',
        tags: ['exams'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };

      // Verify exam belongs to user
      const exam = await app.db.query.exams.findFirst({
        where: and(eq(schema.exams.id, id), eq(schema.exams.userId, session.user.id)),
      });

      if (!exam) {
        return reply.status(404).send({ error: 'Exam not found' });
      }

      await app.db.delete(schema.exams).where(eq(schema.exams.id, id));

      return { message: 'Exam deleted successfully' };
    }
  );

  // PATCH /api/exams/:id/archive - Archive/unarchive exam
  app.fastify.patch(
    '/api/exams/:id/archive',
    {
      schema: {
        description: 'Archive or unarchive an exam',
        tags: ['exams'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['archived'],
          properties: {
            archived: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              title: { type: 'string' },
              subject: { type: 'string' },
              dateTime: { type: 'string' },
              location: { type: 'string' },
              pressureMode: { type: 'string' },
              archived: { type: 'boolean' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { id } = request.params as { id: string };
      const { archived } = request.body as { archived: boolean };

      // Verify exam belongs to user
      const exam = await app.db.query.exams.findFirst({
        where: and(eq(schema.exams.id, id), eq(schema.exams.userId, session.user.id)),
      });

      if (!exam) {
        return reply.status(404).send({ error: 'Exam not found' });
      }

      await app.db
        .update(schema.exams)
        .set({ archived, updatedAt: new Date() })
        .where(eq(schema.exams.id, id));

      const updated = await app.db.query.exams.findFirst({
        where: eq(schema.exams.id, id),
      });

      return updated;
    }
  );
}
