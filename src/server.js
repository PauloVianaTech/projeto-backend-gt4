const app = require('./app');
const database = require('./database');
const { logger } = require('./observability');
const PORT = process.env.PORT || 3001;
const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
database.connection.sync(syncOptions).then(() => {
  app.listen(PORT, '0.0.0.0', () => logger.info({ port: PORT }, 'server_started'));
}).catch(async error => {
  logger.error({ errorMessage: error.message }, 'database_startup_failed');
  await database.connection.close();
  process.exitCode = 1;
});
