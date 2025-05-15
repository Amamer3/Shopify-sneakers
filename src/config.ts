interface Config {
  app: {
    name: string;
    description: string;
    url: string;
  };
  api: {
    url: string;
    version: string;
  };
  features: {
    pwa: boolean;
    analytics: boolean;
  };
}

export const config: Config = {
  app: {
    name: import.meta.env.VITE_APP_NAME,
    description: import.meta.env.VITE_APP_DESCRIPTION,
    url: import.meta.env.VITE_APP_URL,
  },
  api: {
    url: import.meta.env.VITE_API_URL,
    version: import.meta.env.VITE_API_VERSION,
  },
  features: {
    pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
};
