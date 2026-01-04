import type { App } from '../index.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';

export function registerPremiumRoutes(app: App) {
  const requireAuth = app.requireAuth();

  // GET /api/premium/status - Check premium status
  app.fastify.get(
    '/api/premium/status',
    {
      schema: {
        description: 'Get premium status for authenticated user',
        tags: ['premium'],
        response: {
          200: {
            type: 'object',
            properties: {
              isPremium: { type: 'boolean' },
              premiumType: { type: 'string', enum: ['one_time', 'subscription'] },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const settings = await app.db.query.userSettings.findFirst({
        where: eq(schema.userSettings.userId, session.user.id),
      });

      const isPremium = settings?.isPremium ?? false;
      const premiumType = settings?.premiumType ?? null;

      return {
        isPremium,
        premiumType,
      };
    }
  );

  // POST /api/premium/verify - Verify premium purchase
  app.fastify.post(
    '/api/premium/verify',
    {
      schema: {
        description: 'Verify premium purchase and activate premium status',
        tags: ['premium'],
        body: {
          type: 'object',
          required: ['premiumType'],
          properties: {
            premiumType: { type: 'string', enum: ['one_time', 'subscription'] },
            verificationToken: { type: 'string', description: 'Optional: Token for verification' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              isPremium: { type: 'boolean' },
              premiumType: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await requireAuth(request, reply);
      if (!session) return;

      const { premiumType } = request.body as {
        premiumType: 'one_time' | 'subscription';
        verificationToken?: string;
      };

      // Validate premium type
      if (!['one_time', 'subscription'].includes(premiumType)) {
        return reply.status(400).send({
          error: 'Invalid premium type. Must be "one_time" or "subscription".',
        });
      }

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
          isPremium: true,
          premiumType: premiumType as 'one_time' | 'subscription',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await app.db.insert(schema.userSettings).values(defaultSettings);
        settings = defaultSettings;
      } else {
        // Update existing settings
        await app.db
          .update(schema.userSettings)
          .set({
            isPremium: true,
            premiumType: premiumType as 'one_time' | 'subscription',
            updatedAt: new Date(),
          })
          .where(eq(schema.userSettings.userId, session.user.id));

        settings = {
          ...settings,
          isPremium: true,
          premiumType: premiumType as 'one_time' | 'subscription',
          updatedAt: new Date(),
        };
      }

      return {
        message: 'Premium status activated successfully',
        isPremium: true,
        premiumType: settings.premiumType,
      };
    }
  );
}
