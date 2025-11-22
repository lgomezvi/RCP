from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import example_route  # TODO: remove the example in sprint 3

app = FastAPI()

origins = [
    "https://localhost",
    "https://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # this will be restrictive in prod.
    allow_credentials=True,  # cookie inclusion for CORS
    allow_methods=["*"],  # allow all HTTP reqs
    allow_headers=["*"],  # all headers
)

# TODO: remove the example in sprint 3
app.include_router(example_route.router, prefix="/example", tags=["example"])

@app.get("/")
def read_root():
    return {"message": "This is the index of the dev server"}
