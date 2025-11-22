
# this is the config for loading environment variables.

from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()  # need this to load values of the .env file for Pydantic.


class Settings(BaseSettings):
    example_key: str
    api_key: str


@lru_cache  # least recently used cache from functools, use cache if function argument is in the cache before.
def get_settings():
    return Settings()  # if you see a linting error here, ignore it.
