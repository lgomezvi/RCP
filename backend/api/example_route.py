from fastapi import APIRouter, Depends

from backend.api.utils.example_function import get_env, hello

router = APIRouter()


@router.get("/dummy")
def get_planning(
    env_string: str = Depends(get_env),
):  # get_planning depends on the results of get_env, so get_env is run first.
    hello()
    print(env_string)
    return {"message": env_string}
