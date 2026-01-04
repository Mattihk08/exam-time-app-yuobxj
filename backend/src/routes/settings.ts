import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

export function registerSettingsRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/settings - Get user settings
  app.fastify.get(
    '/api/settings',
    {
      schema: {
        description: 'Get user settings',
        tags: ['settings'],
        response: {
          200: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              defaultPressureMode: { type: 'string', enum: ['calm', 'realistic', 'brutal'] },
              notificationsEnabled: { type: 'boolean' },
              pureBlackMode: { type: 'boolean' },
              isPremium: { type: 'boolean' },
              premiumType: { type: 'string', enum: ['one_time', 'subscription'] },
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

      let settings = await app.db.query.userSettings.findFirst({
        where: eq(schema.userSettings.userId, session.user.id),
      });

      // Create default settings if they don't exist
      if (!settings) {
        const defaultSettings = {
          userId: session.user.id,
          defaultPressureMode: 'calm' as const,
          notificationsEnabled: false,
          pureBlackMode: false,
          isPremium: false,
          premiumType: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await app.db.insert(schema.userSettings).values(defaultSettings);
        settings = defaultSettings;
      }

      return settings;
    }
  );

  // PUT /api/settings - Update user settings
  app.fastify.put(
    '/api/settings',
    {
      schema: {
        description: 'Update user settings',
        tags: ['settings'],
        body: {
          type: 'object',
          properties: {
            defaultPressureMode: { type: 'string', enum: ['calm', 'realistic', 'brutal'] },
            notificationsEnabled: { type: 'boolean' },
            pureBlackMode: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              defaultPressureMode: { type: 'string' },
              notificationsEnabled: { type: 'boolean' },
              pureBlackMode: { type: 'boolean' },
              isPremium: { type: 'boolean' },
              premiumType: { type: 'string' },
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

      const updateData = request.body as {
        defaultPressureMode?: 'calm' | 'realistic' | 'brutal';
        notificationsEnabled?: boolean;
        pureBlackMode?: boolean;
      };

      // Get or create settings
      let settings = await app.db.query.userSettings.findFirst({
        where: eq(schema.userSettings.userId, session.user.id),
      });

      if (!settings) {
        const defaultSettings = {
          userId: session.user.id,
          defaultPressureMode: 'calm' as const,
          notificationsEnabled: false,
          pureBlackMode: false,
          isPremium: false,
          premiumType: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await app.db.insert(schema.userSettings).values(defaultSettings);
        settings = defaultSettings;
      }

      // Build update object with only provided fields
      const updates = {
        ...(updateData.defaultPressureMode !== undefined && {
          defaultPressureMode: updateData.defaultPressureMode,
        }),
        ...(updateData.notificationsEnabled !== undefined && {
          notificationsEnabled: updateData.notificationsEnabled,
        }),
        ...(updateData.pureBlackMode !== undefined && {
          pureBlackMode: updateData.pureBlackMode,
        }),
        updatedAt: new Date(),
      };

      await app.db
        .update(schema.userSettings)
        .set(updates)
        .where(eq(schema.userSettings.userId, session.user.id));

      const updated = await app.db.query.userSettings.findFirst({
        where: eq(schema.userSettings.userId, session.user.id),
      });

      return updated;
    }
  );
}
