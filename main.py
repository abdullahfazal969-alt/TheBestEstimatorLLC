import os
import json
from flask import Flask, render_template, request, jsonify
from flask_mail import Mail, Message
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-123')

# --- SMTP / Email Configuration ---
# All values come from environment variables (.env locally, host dashboard in production).
# Never hardcode credentials here.
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

CEO_EMAIL = os.getenv('CEO_EMAIL', 'support@thebestestimatorllc.com')

mail = Mail(app)

# Max upload size: 15MB, to keep blueprint attachments within typical SMTP/mailbox limits
app.config['MAX_CONTENT_LENGTH'] = 15 * 1024 * 1024

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

    file = request.files.get('blueprint')

    body_lines = [
        "New Lead Submitted!",
        f"Contractor: {name} ({email})",
        f"Project Trade: {project_type}",
        f"Requested Services: {services}",
        f"Message: {message}",
    ]
    body = "\n".join(body_lines)
    print(body)  # keep server-log visibility for debugging

    try:
        msg = Message(
            subject=f"New Quote Request — {name or 'Unknown'}",
            recipients=[CEO_EMAIL],
            reply_to=email if email else None,
            body=body,
        )

        # Attach the blueprint directly to the email — read into memory,
        # never written to disk, so nothing depends on the server's filesystem.
        if file and file.filename:
            file_bytes = file.read()
            msg.attach(
                filename=file.filename,
                content_type=file.content_type or "application/octet-stream",
                data=file_bytes,
            )

        mail.send(msg)
        email_status = "sent"
    except Exception as e:
        # Don't fail the whole request if email delivery has an issue —
        # the lead is still logged server-side either way.
        print(f"Email send failed: {e}")
        email_status = "failed"

    return jsonify({
        "status": "success",
        "message": "Quote request submitted successfully!",
        "email_status": email_status
    })

if __name__ == '__main__':
    app.run(debug=True)
