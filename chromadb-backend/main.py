from flask import Flask, request, jsonify
from .chroma import get_chroma_collection

app = Flask(__name__)

@app.route("/api/documents/", methods=["POST"])
def add_documents():
    try:
        request_body = request.get_json()
        documents = request_body.get('documents')
        metadatas = request_body.get('metadatas')
        
        if not documents:
            return jsonify({"error": "Documents are required"}), 400
        
        collection = get_chroma_collection()
        
        # Get existing IDs to find the next available ID
        existing_data = collection.get()
        existing_ids = existing_data['ids'] if existing_data['ids'] else []
        
        # Extract numeric IDs and find the maximum
        max_id = 0
        for existing_id in existing_ids:
            if existing_id.startswith('doc'):
                try:
                    num = int(existing_id[3:])  # Extract number after 'doc'
                    max_id = max(max_id, num)
                except ValueError:
                    continue
        
        # Generate new sequential IDs
        new_ids = []
        for i in range(len(documents)):
            new_ids.append(f"doc{max_id + i + 1}")
        
        # Prepare metadatas - ensure each has at least one key
        if not metadatas or len(metadatas) != len(documents):
            metadatas = [{"index": i} for i in range(len(documents))]
        else:
            # Ensure each metadata dict has at least one key
            metadatas = [meta if meta else {"index": i} for i, meta in enumerate(metadatas)]
        
        # Add documents with auto-generated IDs
        collection.add(
            ids=new_ids,
            documents=documents,
            metadatas=metadatas,
        )
        
        response = {
            "message": "Documents added successfully",
            "ids": new_ids,
            "count": len(new_ids)
        }
        
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/query/", methods=["GET"])
def query_documents():
    try:
        # Get query parameters from URL
        query_text = request.args.get('query')
        n_results = request.args.get('n_results', default=5, type=int)
        
        if not query_text:
            return jsonify({"error": "Query text is required"}), 400
        
        collection = get_chroma_collection()
        
        # Query the collection - ChromaDB handles embedding automatically
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        
        # Format the response
        documents = []
        for i in range(len(results['ids'][0])):
            documents.append({
                "id": results['ids'][0][i],
                "document": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i]
            })
        
        return jsonify({
            "query": query_text,
            "results": documents,
            "count": len(documents)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)