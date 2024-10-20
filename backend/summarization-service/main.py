from flask import Flask, request, jsonify
from summarize import first_summarize, subsequent_summarize
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route('/summarize', methods=['POST'])
def summarize():
    id = request.json['caller_id']
    text = request.json['text']
    is_first = request.json['is_first']
    if is_first:
        summary = first_summarize(text, id % 2)
    else:
        summary = subsequent_summarize(text)
    return jsonify({'summary': summary})

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5002)