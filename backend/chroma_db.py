import chromadb
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def embed(texts):
    return model.encode(texts).tolist()

client = chromadb.PersistentClient(path="./chroma-data")

collection = client.get_or_create_collection(
    name="robot_rag",
    embedding_function=embed
)

# """ move to another file later"""
# import json

# def retrieve_context_from_chroma(json_instruction: dict):
#     query_text = json.dumps(json_instruction)
    
#     results = collection.query(
#         query_texts=[query_text],
#         n_results=5
#     )

#     docs = results["documents"][0] if len(results["documents"]) > 0 else []
#     return "\n\n".join(docs)