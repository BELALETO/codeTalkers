const app = require('./app');
const { connectDB } = require('./config/database');
const { port } = require('./config/config');

// Track server instance for graceful shutdown
let server;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Stack trace:', err.stack);

  // Exit immediately for uncaught exceptions
  // as the application is in an unknown state
  process.exit(1);
});

// Start the server
(async () => {
  try {
    // Connect to the database
    await connectDB();
    console.log('Database connected successfully');

    // Start the server
    server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...');
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
  console.error('Stack trace:', err.stack);

  // Close server gracefully, then exit
  if (server) {
    server.close(() => {
      console.log('Server closed. Process terminating...');
      process.exit(1);
    });

    // Force shutdown after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('Forced shutdown: Graceful shutdown timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM signal (graceful shutdown)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Process terminated!');
    });
  }
});
