export const environment: any = {
  production: true,
  apiUrl: 'https://api.conductores-pwa.com/v1',
  appName: 'Conductores PWA',
  version: '1.0.0',
  
  // Feature flags for production
  features: {
    enableMockData: false,
    enableAnalytics: true,
    enablePushNotifications: true,
    enableOfflineMode: true
  },

  // API endpoints configuration
  endpoints: {
    auth: '/auth',
    clients: '/clients',
    quotes: '/quotes',
    scenarios: '/scenarios',
    documents: '/documents',
    payments: '/payments',
    reports: '/reports'
  },

  // External services - production keys
  services: {
    metamap: {
      clientId: '',
      flowId: '',
      baseUrl: 'https://api.metamap.com'
    },
    conekta: {
      publicKey: '',
      baseUrl: 'https://api.conekta.io'
    },
    mifiel: {
      appId: '',
      baseUrl: 'https://api.mifiel.com/api/v1'
    }
  },

  // Timeouts and limits
  timeouts: {
    api: 30000,
    fileUpload: 120000,
    auth: 15000
  },

  storage: {
    prefix: 'conductores_pwa_',
    version: '1.0'
  }
};

// Make 'services' spy-able in tests if ever loaded under prod env
(() => {
  const _services = environment.services;
  try {
    Object.defineProperty(environment, 'services', {
      configurable: true,
      get: () => _services
    });
  } catch {}
})();
