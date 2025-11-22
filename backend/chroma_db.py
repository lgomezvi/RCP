import chromadb
from chromadb.config import Settings

client = chromadb.PersistentClient("./chroma_robot")
collection = client.get_or_create_collection("robot_knowledge")