import { describe, it, expect } from 'vitest';
import { createVerificationEmailTemplate, createPasswordResetTemplate } from '../emailTemplates';

describe('emailTemplates', () => {
  describe('createVerificationEmailTemplate', () => {
    it('should include verification link in both text and html versions', () => {
      const verificationLink = 'https://example.com/verify';
      const template = createVerificationEmailTemplate(verificationLink);

      expect(template.text).toContain(verificationLink);
      expect(template.html).toContain(verificationLink);
    });

    it('should have correct subject', () => {
      const template = createVerificationEmailTemplate('https://example.com/verify');
      expect(template.subject).toBe('Verify Your Urban Sole Store Account');
    });

    it('should mention expiration time', () => {
      const template = createVerificationEmailTemplate('https://example.com/verify');
      expect(template.text).toContain('24 hours');
      expect(template.html).toContain('24 hours');
    });
  });

  describe('createPasswordResetTemplate', () => {
    it('should include reset link in both text and html versions', () => {
      const resetLink = 'https://example.com/reset';
      const template = createPasswordResetTemplate(resetLink);

      expect(template.text).toContain(resetLink);
      expect(template.html).toContain(resetLink);
    });

    it('should have correct subject', () => {
      const template = createPasswordResetTemplate('https://example.com/reset');
      expect(template.subject).toBe('Reset Your Urban Sole Store Password');
    });

    it('should mention expiration time', () => {
      const template = createPasswordResetTemplate('https://example.com/reset');
      expect(template.text).toContain('1 hour');
      expect(template.html).toContain('1 hour');
    });
  });
});
