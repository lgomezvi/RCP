from flask import current_app, g
import chromadb
from chromadb.api import ClientAPI
from chromadb.api.models.Collection import Collection
import os
from dotenv import load_dotenv

load_dotenv()

def get_chroma_client() -> ClientAPI:
    # if 'chroma_client' not in g:
    #     g.chroma_client = chromadb.CloudClient(
    #         api_key=os.getenv("CHROMA_API_KEY"),
    #         tenant=os.getenv("CHROMA_TENANT"),
    #         database=os.getenv("CHROMA_DATABASE")
    #     )
    # return g.chroma_client
    return chromadb.EphemeralClient()
    
def get_chroma_collection() -> Collection:
    chroma_client = get_chroma_client()
    if 'chroma_collection' not in g:
        g.chroma_collection = chroma_client.get_or_create_collection(name="my_collection")
    return g.chroma_collection