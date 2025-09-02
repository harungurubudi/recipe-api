export default () => ({
  // server configuration
  port: parseInt(process.env.APP_PORT ?? "3000", 10),
  environment: process.env.NODE_ENV ?? "development",
  // database configuration
  database: {
    host: process.env.DATABASE_HOST ?? "localhost",
    port: parseInt(process.env.DATABASE_PORT ?? "3306", 10),
    user: process.env.DATABASE_USER ?? "user",
    password: process.env.DATABASE_PASSWORD ?? "",
    name: process.env.DATABASE_NAME ?? "recipe_db",
    // make sure this is "require" in production
    ssl_mode: process.env.DATABASE_SSL_MODE ?? "require",
  },
  redis: {
    host: process.env.REDIS_HOST ?? "localhost",
    port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
    password: process.env.REDIS_PASSWORD ?? "",
  }
});
