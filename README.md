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
