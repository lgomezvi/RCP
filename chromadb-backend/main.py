from flask import Flask, request, jsonify
from .chroma import get_chroma_collection
import json

app = Flask(__name__)

@app.route("/api/documents/", methods=["POST"])
def add_documents():
    try:
        request_body = request.get_json()
        
        # Expecting an array of action records
        # Example: [{"action": "move", "parameters": {...}}, ...]
        records = request_body.get('records')
        
        if not records:
            return jsonify({"error": "Records are required"}), 400
        
        collection = get_chroma_collection()
        
        # Get existing IDs to find the next available ID
        existing_data = collection.get()
        existing_ids = existing_data['ids'] if existing_data['ids'] else []
        
        # Extract numeric IDs and find the maximum
        max_id = 0
        for existing_id in existing_ids:
            if existing_id.startswith('action'):
                try:
                    num = int(existing_id[6:])  # Extract number after 'action'
                    max_id = max(max_id, num)
                except ValueError:
                    continue
        
        # Generate new sequential IDs
        new_ids = []
        documents = []
        metadatas = []
        
        for i, record in enumerate(records):
            new_ids.append(f"action{max_id + i + 1}")
            
            # Convert the entire record to a searchable string
            document_text = f"Action: {record.get('action', 'unknown')}"
            if 'parameters' in record:
                params = record['parameters']
                document_text += f" | Axis: {params.get('axis', 'N/A')}"
                document_text += f" | Target Angle: {params.get('target_angle_deg', 'N/A')} degrees"
                document_text += f" | Speed Delay: {params.get('speed_delay_ms', 'N/A')} ms"
            
            documents.append(document_text)
            
            # Store the full JSON structure in metadata
            metadatas.append({
                "action": record.get('action', 'unknown'),
                "parameters": json.dumps(record.get('parameters', {})),
                "record_type": "robot_action"
            })
        
        # Add documents with auto-generated IDs
        collection.add(
            ids=new_ids,
            documents=documents,
            metadatas=metadatas,
        )
        
        response = {
            "message": "Action records added successfully",
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
        n_results = request.args.get('n_results', default=1, type=int)
        
        if not query_text:
            return jsonify({"error": "Query text is required"}), 400
        
        collection = get_chroma_collection()
        
        # Query the collection - ChromaDB handles embedding automatically
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        
        # Format the response with reconstructed JSON
        documents = []
        for i in range(len(results['ids'][0])):
            metadata = results['metadatas'][0][i]
            
            # Reconstruct the original JSON format
            action_record = {
                "id": results['ids'][0][i],
                "action": metadata.get('action'),
                "parameters": json.loads(metadata.get('parameters', '{}')),
                "distance": results['distances'][0][i],
                "document_text": results['documents'][0][i]
            }
            documents.append(action_record)
        
        return jsonify({
            "query": query_text,
            "results": documents,
            "count": len(documents)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)