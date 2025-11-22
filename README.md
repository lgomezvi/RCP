# Robot Context Protocol (RCP) 🤖

> A hardware-independent protocol that gives LLMs the ability to control any robot using natural language.

## 🎯 Motivation

Arbitrary degrees of freedom in robotics make it nearly impossible to create standard AI solutions. Different robots require different control systems, creating massive barriers to AI integration.

**RCP solves this by using natural language** - which has denser meaning and better semantics than traditional control interfaces. Built on Model Context Protocol (MCP), RCP enables AI agents to directly control robots regardless of hardware configuration.

### The Vision

Instead of programming complex inverse kinematics and motor controls, simply say:

```
"Pick up the red block and place it in the box"
```

The AI agent handles the rest - planning, execution, and adaptation.

## 🏗️ Architecture

### Workflow

```
User Command → Planning Agent (LLM) → Execution Agent (SLM) → RCP Server (Robot) → Physical Hardware
                      ↑                       ↑                      ↑
                      └───── Context ─────────┴────── Sensors ───────┘
```

### Three-Stage Process

1. **Connection & Discovery**: Robot exposes capabilities via WebSocket (streaming) and HTTP (commands)
2. **Calibration**: Agent explores hardware, builds few-shot prompts, creates robot-specific knowledge base
3. **Active Control**: High-level commands → decomposition → low-latency execution with continuous feedback

## 🛠️ Technology Stack

### Software
- **Agents**: LLM (planning) + SLM (execution)
- **Memory**: ChromaDB (vector store), Time-series DB (sensor context)
- **Frontend**: Next.js (control interface + logging)
- **Communication**: WebSocket (sensor streaming), HTTP (commands)

### Hardware
- **Controller**: Raspberry Pi (RCP server)
- **Actuators**: Arduino + servo motors
- **Sensors**: Gripper force sensors, LiDAR

# Project Setup

This repository contains a monorepo with a frontend, backend, and Arduino code.

## Frontend (Next.js)

To set up and run the frontend application:

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file in the `frontend` directory to store your environment variables.

```bash
# frontend/.env.local

NEXT_PUBLIC_API_URL=http://localhost:8000
```

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. You can access them in your code like this: `process.env.NEXT_PUBLIC_API_URL`.

## Backend Python setup

Download uv: 

cd into backend, run uv sync, then uv venv, `source .venv/bin/activate`.

cd to project root, run `uvicorn backend.main:app --reload` to run the server.

### Environment Variables

Check config.py and .env.example for loading environment variables for Open Router.

To load these variables, you can use the `dotenv` library in your Python code (which is included in `pyproject.toml`):

```python
# main.py
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
```
