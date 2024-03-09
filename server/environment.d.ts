declare global {
    namespace NodeJS {
      interface ProcessEnv {
        PORT: string;
        FRONTEND_BASE_URL: string;
        NODE_ENV: "development" | "production";
  
        MONGODB_URI: string;
  
        CLOUD_NAME: string;
        CLOUD_API_KEY: string;
        CLOUD_SECRET_KEY: string;
  
        REDIS_URI: string;
  
        JWT_ACCESS_TOKEN: string;
        JWT_REFRESH_TOKEN: string;
        JWT_ACTIVATION_SECRET_KEY: string;
  
        JWT_ACCESS_TOKEN_EXPIRE: string;
        JWT_REFRESH_TOKEN_EXPIRE: string;
  
        MAILER_EMAIL: string;
        MAILER_PASSWORD: string;
      }
    }
  }

  export {}