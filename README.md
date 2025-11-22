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

## Backend (Python)

To set up and run the backend server:

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment using `uv`:**
    ```bash
    uv venv
    ```

3.  **Activate the virtual environment:**
    ```bash
    source .venv/bin/activate
    ```
    *(On Windows, use `.venv\Scripts\activate`)*

4.  **Install dependencies:**
    The dependencies are listed in the `pyproject.toml` file. Install them using `uv`:
    ```bash
    uv pip install -e .
    ```

5.  **Run the backend application:**
    ```bash
    python main.py
    ```

### Environment Variables

Create a `.env` file in the `backend` directory.

```bash
# backend/.env

DATABASE_URL="your-database-url"
```

To load these variables, you can use the `dotenv` library in your Python code (which is included in `pyproject.toml`):

```python
# main.py
import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
```
