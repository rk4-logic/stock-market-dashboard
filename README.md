1. Install Dependencies
In the root of your project, run:

npm install
This installs all dependencies for the project.

2. Run the Frontend
To start the frontend development server, run:

npm run dev

This will start the Next.js app on http://localhost:3000.

3. Run the Backend Server
In a new terminal of code editor, navigate to the root of your project and run:

node server/index.js

This starts the Node.js WebSocket server on http://localhost:4000, which streams live stock market data to the frontend.

⚠️ Important: The backend server must be running for the dashboard to show real-time stock updates, major indices of India and other major Economies.

