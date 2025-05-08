
# Goby

Goby is a powerful network monitoring and security analysis tool that allows users to monitor network activity, analyze security metrics, and visualize network graphs. Built with modern web technologies, it provides an intuitive interface and robust data processing capabilities.

## Project Overview

This project is designed to help users assess network security and performance metrics using live updates and interactive visualizations. Goby integrates backend technologies for data fetching and processing, while utilizing a frontend built with React for user interface components.

## Installation

To run Goby on your local machine, follow these steps:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/goby.git
    cd goby
    ```

2. **Install the dependencies:**
    You need Node.js and npm installed on your machine. Then run:
    ```bash
    npm install
    ```

3. **Start the development server:**
    ```bash
    npm run dev
    ```

4. **Build the project:**
    For production builds, run:
    ```bash
    npm run build
    ```

## Usage

1. After starting the development server, navigate to `http://localhost:8000` in your web browser.
2. Use the menu to access various features such as network monitoring, security analysis, and visualizations.
3. For API interactions, ensure your server is running at `http://localhost:3000`.

## Features

- **Real-time Monitoring:** Monitor network traffic and performance metrics in real-time.
- **Security Analysis:** Analyze network security and identify potential vulnerabilities.
- **Interactive Graphs:** Visualize network nodes and connections using graph representations.
- **Data Persistence:** Data is stored in SQLite for efficient access and management.

## Dependencies

Goby has several dependencies that are essential for its operation. Here’s a selection from the `package.json`:

- **Express**: A fast, unopinionated, minimalist web framework for Node.js (`express`).
- **SQLite3**: Asynchronous, non-blocking SQLite3 bindings for Node.js (`sqlite3`).
- **System Information**: A library to gather device and system information (`systeminformation`).
- **React**: A JavaScript library for building user interfaces (`react`, `react-dom`).
- **Tailwind CSS**: A utility-first CSS framework for styling the frontend (`tailwindcss`).
- **Chart.js**: A library for visualizing data with charts (`chart.js`, `react-chartjs-2`).
- **axios**: A promise-based HTTP client for making requests (`axios`).

You can find a full list of dependencies in the `package.json` file.

## Project Structure

```
goby
├── server/
│   ├── index.js         # Entry point of the backend server
│   ├── routes/          # API endpoint definitions
│   └── models/          # Database models and schemas
├── frontend/
│   ├── components/      # React components for the UI
│   ├── utils/           # Utility functions for the frontend
│   └── App.jsx          # Main React application component
├── vite.config.js       # Vite configuration file
├── package.json         # Project metadata and dependencies
└── index.html           # Static HTML file to render the application
```

For any additional questions or issues, feel free to open an issue in the GitHub repository. Enjoy using Goby for your network monitoring and analysis needs!
