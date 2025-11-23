from flask import Flask, request, render_template

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    if request.method == 'POST':
        name = request.form.get('name')
        message = request.form.get('message')
        return f"Hello, {name}! You submitted: {message}"
    return "Invalid request method."

if __name__ == '__main__':
    app.run(debug=True)
