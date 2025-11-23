from flask import current_app, g
import chromadb
from chromadb.api import ClientAPI
from chromadb.api.models.Collection import Collection
import os
from dotenv import load_dotenv

load_dotenv()

def get_chroma_client() -> ClientAPI:
    return chromadb.EphemeralClient()
    
def get_chroma_collection() -> Collection:
    chroma_client = get_chroma_client()
    if 'chroma_collection' not in g:
        g.chroma_collection = chroma_client.get_or_create_collection(name="my_collection")
    return g.chroma_collection