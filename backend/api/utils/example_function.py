
# This is a dummy utils function to show how Langgraph functions can be imported.

from fastapi import (
    Depends,
)  # use fastAPI dependency injection to load cached# env variables.

from backend.config import Settings, get_settings  # absolute path


def hello():
    print("This is an example function that is imported and called")


def get_env(settings: Settings = Depends(get_settings)):
    example_key = settings.example_key

    return f"Example Key: {example_key}"
