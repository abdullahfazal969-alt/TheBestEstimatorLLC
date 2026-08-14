import os
import json
from flask import Flask, render_template, request, jsonify, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-123')
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def load_samples():
    try:
        with open('samples.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/samples')
def samples():
    all_samples = load_samples()
    return render_template('samples.html', samples=all_samples)

@app.route('/pricing')
def pricing():
    return render_template('pricing.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/submit-quote', methods=['POST'])
def submit_quote():
    name = request.form.get('name')
    email = request.form.get('email')
    project_type = request.form.get('project_type')
    services = request.form.get('services')
    message = request.form.get('message')
    
    # Handle blueprint upload
    file = request.files.get('blueprint')
    if file:
        filename = f"{name.replace(' ', '_')}_{file.filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    
    # TODO: Connect with Flask-Mail for SMTP to CEO
    print(f"New Lead Submitted!")
    print(f"Contractor: {name} ({email})")
    print(f"Project Trade: {project_type}")
    print(f"Requested Services: {services}")
    print(f"Message: {message}")
    
    return jsonify({"status": "success", "message": "Quote request submitted successfully!"})

if __name__ == '__main__':
    app.run(debug=True)
