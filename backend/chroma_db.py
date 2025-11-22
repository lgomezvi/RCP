import os
import chromadb
# Import embedding functions to swap models
import chromadb.utils.embedding_functions as embedding_functions
from groq import Groq

from dotenv import load_dotenv

emb_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2" 
)

# Initialize ChromaDB client with persistent storage
chroma_client = chromadb.PersistentClient(path="./chroma_db_storage")

# Pass the chosen embedding function here
collection = chroma_client.get_or_create_collection(
    name="knowledge_base",
    embedding_function=emb_fn
)

def add_documents():
    """Simulate adding data to the vector database."""
    documents = [
    ]
    
    ids = []
    
    print(f"📥 Embedding {len(documents)} documents using {emb_fn.__class__.__name__}...")
    collection.add(
        documents=documents,
        ids=ids
    )

def query_groq_rag(question: str):
    """
    1. Retrieve relevant context from Chroma.
    2. Send context + question to Groq for an answer.
    """
    print(f"\n🔎 Querying: '{question}'")
    
    # 1. RETRIEVE (Chroma)
    results = collection.query(
        query_texts=[question],
        n_results=1
    )
    
    if not results['documents'][0]:
        return "I couldn't find any relevant information."

    context_text = results['documents'][0][0]
    print(f"📄 Found Context: \"{context_text}\"")

    # # 2. GENERATE (Groq)
    # print("⚡ Sending to Groq for generation...")
    # chat_completion = groq_client.chat.completions.create(
    #     messages=[
    #         {
    #             "role": "system",
    #             "content": "You are a helpful assistant. Use the provided context to answer the user."
    #         },
    #         {
    #             "role": "user",
    #             "content": f"Context: {context_text}\n\nQuestion: {question}"
    #         }
    #     ],
    #     model="llama-3.1-8b-instant", # Or 'mixtral-8x7b-32768'
    #     temperature=0.5,
    # )

    # return chat_completion.choices[0].message.content

# ------------------------------------------------------------------
# MAIN EXECUTION
# ------------------------------------------------------------------
if __name__ == "__main__":
    # 1. Setup Data
    
    # 2. Run RAG
    user_query = "What does RAG stand for?"
    answer = query_groq_rag(user_query)
    
    print("\n" + "="*40)