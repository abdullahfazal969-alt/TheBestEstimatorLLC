import os
import json
from pathlib import Path
from flask import Flask, render_template, request, jsonify
from flask_mail import Mail, Message
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
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
        with open(BASE_DIR / 'samples.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        app.logger.error("Unable to load samples.json: %s", e)
        return []

def load_services():
    try:
        with open(BASE_DIR / 'services.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        app.logger.error("Unable to load services.json: %s", e)
        return []

@app.route('/')
def index():
    all_services = load_services()
    return render_template('index.html', services=all_services)

@app.route('/samples')
def samples():
    all_samples = load_samples()
    return render_template('samples.html', samples=all_samples)

@app.route('/pricing')
def pricing():
    all_services = load_services()
    return render_template('pricing.html', services=all_services)

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/submit-quote', methods=['POST'])
def submit_quote():
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    organization = request.form.get('org', '').strip()
    project_type = request.form.get('project_type')
    services = request.form.get('services')
    message = request.form.get('message')

    # Basic server-side validation — never trust the client alone
    if not name or not email:
        return jsonify({
            "status": "error",
            "message": "Name and email are required."
        }), 400

    file = request.files.get('blueprint')
    has_attachment = bool(file and file.filename)

    body_lines = [
        "New Lead Submitted!",
        f"Contractor: {name} ({email})",
        f"Company: {organization or 'Not provided'}",
        f"Project Trade: {project_type}",
        f"Requested Services: {services}",
        f"Message: {message}",
    ]
    body = "\n".join(body_lines)
    print(body)  # keep server-log visibility for debugging

    try:
        html_body = render_template(
            'email/quote_notification.html',
            name=name,
            email=email,
            organization=organization,
            project_type=project_type,
            services=services,
            message=message,
            has_attachment=has_attachment,
        )

        msg = Message(
            subject=f"New Quote Request — {name or 'Unknown'}",
            recipients=[CEO_EMAIL],
            reply_to=email if email else None,
            body=body,       # plain-text fallback for clients that don't render HTML
            html=html_body,  # branded version most clients will actually display
        )

        # Embed the logo directly in the email (Content-ID) rather than linking
        # to a URL — this way it displays correctly even before the site is live,
        # and doesn't depend on the recipient's client fetching a remote image.
        logo_path = BASE_DIR / 'static' / 'images' / 'logo.png'
        if logo_path.exists():
            with open(logo_path, 'rb') as logo_file:
                msg.attach(
                    filename="logo.png",
                    content_type="image/png",
                    data=logo_file.read(),
                    disposition='inline',
                    headers={'Content-ID': '<tbe_logo>'},
                )

        # Attach the blueprint directly to the email — read into memory,
        # never written to disk, so nothing depends on the server's filesystem.
        if has_attachment:
            file_bytes = file.read()
            msg.attach(
                filename=file.filename,
                content_type=file.content_type or "application/octet-stream",
                data=file_bytes,
            )

        mail.send(msg)

        # Only report success when the email genuinely sent — the frontend
        # relies on this to decide which banner to show.
        return jsonify({
            "status": "success",
            "message": "Your quote request was sent successfully."
        })

    except Exception as e:
        # Don't pretend this succeeded. Log the real error server-side,
        # send back a distinct failure status so the UI can show it honestly.
        print(f"Email send failed: {e}")
        return jsonify({
            "status": "error",
            "message": "We couldn't send your request right now. Please try again, or email us directly."
        }), 502

if __name__ == '__main__':
    app.run(debug=True)
