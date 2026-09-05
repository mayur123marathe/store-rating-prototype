import request from 'supertest';
import { createApp } from '../app';
import { SignupSchema, passwordSchema, nameSchema } from '../validators';

const app = createApp();

describe('Validation Schemas & Security Rules', () => {
  describe('Name Validation Rules (20 - 60 characters)', () => {
    it('should reject name shorter than 20 characters', () => {
      const result = nameSchema.safeParse('Short Name');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 20 characters');
      }
    });

    it('should accept name with length between 20 and 60 characters', () => {
      const result = nameSchema.safeParse('Alexander Hamilton Junior');
      expect(result.success).toBe(true);
    });

    it('should reject name exceeding 60 characters', () => {
      const longName = 'A'.repeat(65);
      const result = nameSchema.safeParse(longName);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot exceed 60 characters');
      }
    });
  });

  describe('Password Validation Rules (8-16 chars, uppercase, special char)', () => {
    it('should reject password without uppercase letter', () => {
      const result = passwordSchema.safeParse('secret@123');
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = passwordSchema.safeParse('SecretPass123');
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 chars', () => {
      const result = passwordSchema.safeParse('Sec@1');
      expect(result.success).toBe(false);
    });

    it('should reject password longer than 16 chars', () => {
      const result = passwordSchema.safeParse('SuperSecretLongP@ssword12345');
      expect(result.success).toBe(false);
    });

    it('should accept strong password compliant with all rules', () => {
      const result = passwordSchema.safeParse('SecureP@ss123');
      expect(result.success).toBe(true);
    });
  });

  describe('Health Check API', () => {
    it('GET /api/health returns 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('Route Protection & RBAC Guards', () => {
    it('GET /api/admin/dashboard without token returns 401 Unauthorized', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/ratings without token returns 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/ratings')
        .send({ storeId: 'some-id', score: 5 });
      expect(res.status).toBe(401);
    });
  });
});
