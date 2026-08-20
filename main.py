import os
import json
import base64
import urllib.request
import urllib.error
from pathlib import Path
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-123')

# --- Resend (HTTPS email API) Configuration ---
# Switched from SMTP because Railway blocks all outbound SMTP ports on every
# plan below Pro. Resend sends over HTTPS instead, so no blocked-port issue.
RESEND_API_KEY = os.getenv('RESEND_API_KEY')
RESEND_FROM = os.getenv('RESEND_FROM', 'The Best Estimator <onboarding@resend.dev>')
CEO_EMAIL = os.getenv('CEO_EMAIL', 'support@thebestestimatorllc.com')

# Max upload size: 15MB, to keep blueprint attachments within typical email/API limits
app.config['MAX_CONTENT_LENGTH'] = 15 * 1024 * 1024

def send_via_resend(payload):
    """POST an email to Resend's HTTPS API. Raises on any failure so the
    caller's existing try/except handles it exactly like mail.send() did."""
    req = urllib.request.Request(
        'https://api.resend.com/emails',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {RESEND_API_KEY}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode('utf-8'))

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

@app.context_processor
def inject_nav_services():
    # Makes the services list available in base.html's navbar dropdown
    # on every page, without needing to pass it from every single route.
    return {'nav_services': load_services()}

@app.route('/')
def index():
    all_services = load_services()
    return render_template('index.html', services=all_services)

@app.route('/samples')
def samples():
    all_samples = load_samples()
    return render_template('samples.html', samples=all_samples)

@app.route('/services')
def services_page():
    all_services = load_services()
    # The "BIM Modelling" entry is a hub — it has its own dedicated page
    # (/bim-modelling) instead of a flashcard here, so it's excluded.
    visible_services = [s for s in all_services if not s.get('is_hub')]
    return render_template('services.html', services=visible_services)

@app.route('/bim-modelling')
def bim_modelling():
    all_services = load_services()
    hub = next((s for s in all_services if s.get('is_hub')), None)
    sub_services = hub['sub_services'] if hub else []
    return render_template('bim_modelling.html', services=sub_services, hub=hub)

@app.route('/about')
def about():
    # Placeholder content — edit the strings below with the real name,
    # title, and bio copy. Keeping it here (rather than hardcoded in the
    # template) means future edits only need to happen in one place.
    ceo = {
        'name': 'Mohsin Altaf',
        'title': 'Founder & CEO',
        'photo': 'images/team/ceo.png',
        'bio_paragraphs': [
            '[Insert first bio paragraph here — company origin story: '
            'when and why The Best Estimator LLC was founded, and what '
            'it focused on early on.]',
            '[Insert second bio paragraph here — the CEO\u2019s background: '
            'relevant experience, credentials, or career history before '
            'and during the company.]',
        ],
    }
    return render_template('about.html', ceo=ceo)

@app.route('/pricing')
def pricing():
    return render_template('pricing.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

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

        attachments = []

        # Embed the logo directly in the email (Content-ID) rather than linking
        # to a URL — displays correctly regardless of hosting status, and the
        # HTML template already references it as cid:tbe_logo, unchanged.
        logo_path = BASE_DIR / 'static' / 'images' / 'logo.png'
        if logo_path.exists():
            with open(logo_path, 'rb') as logo_file:
                attachments.append({
                    "filename": "logo.png",
                    "content": base64.b64encode(logo_file.read()).decode('ascii'),
                    "content_id": "tbe_logo",
                })

        # Attach the blueprint directly to the email — read into memory,
        # never written to disk, so nothing depends on the server's filesystem.
        if has_attachment:
            file_bytes = file.read()
            attachments.append({
                "filename": file.filename,
                "content": base64.b64encode(file_bytes).decode('ascii'),
            })

        payload = {
            "from": RESEND_FROM,
            "to": [CEO_EMAIL],
            "subject": f"New Quote Request — {name or 'Unknown'}",
            "text": body,       # plain-text fallback for clients that don't render HTML
            "html": html_body,  # branded version most clients will actually display
        }
        if email:
            payload["reply_to"] = email
        if attachments:
            payload["attachments"] = attachments

        send_via_resend(payload)

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
