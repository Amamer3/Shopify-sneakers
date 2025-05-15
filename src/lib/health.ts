import { logger } from './logger';

interface ServiceHealth {
  status: 'up' | 'down';
  latency: number;
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    [key: string]: ServiceHealth;
  };
}

class HealthMonitor {
  private startTime: number;
  private checkInterval: number | null;
  private services: Set<string>;

  constructor() {
    this.startTime = Date.now();
    this.checkInterval = null;
    this.services = new Set(['api', 'storage', 'auth']);
  }

  async checkEndpoint(endpoint: string): Promise<ServiceHealth> {
    // In development, return healthy status without making actual requests
    if (import.meta.env.DEV) {
      return {
        status: 'up',
        latency: 0,
      };
    }

    const start = performance.now();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/health/${endpoint}`);
      const latency = performance.now() - start;
      return {
        status: response.ok ? 'up' : 'down',
        latency,
      };
    } catch (error) {
      logger.error(`Health check failed for ${endpoint}`, error);
      return {
        status: 'down',
        latency: performance.now() - start,
      };
    }
  }

  async getHealth(): Promise<HealthCheck> {
    const checks = await Promise.all(
      Array.from(this.services).map(async (service) => [
        service,
        await this.checkEndpoint(service),
      ])
    );

    const services = Object.fromEntries(checks);
    const unhealthyServices = Object.values(services).filter(
      (service: ServiceHealth) => service.status === 'down'
    );

    return {
      status:
        unhealthyServices.length === 0
          ? 'healthy'
          : unhealthyServices.length < this.services.size
          ? 'degraded'
          : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION || '0.0.0',
      services,
    };
  }

  startMonitoring(intervalMs: number = 60000) {
    // Don't start monitoring in development
    if (import.meta.env.DEV) {
      return;
    }

    if (this.checkInterval) {
      return;
    }

    this.checkInterval = window.setInterval(async () => {
      const health = await this.getHealth();
      if (health.status !== 'healthy') {
        logger.warn('System health degraded', health);
      }
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const healthMonitor = new HealthMonitor();
