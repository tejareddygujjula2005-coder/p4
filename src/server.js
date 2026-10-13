require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/database');

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exitCode = 1;
  }
};

startServer();