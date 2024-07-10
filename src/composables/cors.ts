import { type H3CorsOptions, type H3Event,handleCors } from 'h3';

interface UseCORSOptions {
  methods: H3CorsOptions['methods'];
  credentials: H3CorsOptions['credentials'];
}

export function useCORS(event: H3Event, options: UseCORSOptions): boolean {
  return handleCors(event, {
    origin: (providedOrigin) => {
      // Generate list of allowed origins
      const allowedOrigins = ['localhost'];

      if (process.env.FRONTEND_DOMAIN && process.env.FRONTEND_DOMAIN !== '') {
        allowedOrigins.push(process.env.FRONTEND_DOMAIN);
      }

      // Compare to provided origin
      return allowedOrigins.includes(providedOrigin);
    },
    preflight: {
      statusCode: 204,
    },
    methods: options.methods,
    credentials: options.credentials,
  });
}
