# Project Continuity & Context: The Best Estimator LLC

## 1. The Mission
Redesign `thebestestimatorllc.com` into a premium, enterprise-grade "Virtual Estimation Department" platform. The goal is to move from a generic WordPress look to a high-authority, "Apple/Hugo-style" aesthetic that builds extreme trust with contractors and builders.

## 2. Core Architectural Decisions
*   **Framework:** Python Flask (Chosen for maximum explainability and clean routing).
*   **Styling:** Vanilla CSS3 with CSS Variables for a "Single Source of Truth" design system.
*   **The Samples Engine:** Dynamic JSON-driven gallery (`samples.json`). This allows adding work samples (PDF/XLSX) without modifying HTML code.
*   **Lead Intake:** A 5-step interactive quote request form with secure blueprint file uploads to a non-public `uploads/` folder.
*   **Notifications:** Flask-Mail SMTP triggers to alert the CEO/Managers instantly when a new blueprint is uploaded.

## 3. Visual Design System (Hugo-Inspired)
*   **Palette:**
    *   `Oxford Blue (#0A1128)` - Primary Brand/Authority.
    *   `Construction Gold (#E5A93B)` - Action/CTA/Energy.
    *   `Paper White (#F7F9FC)` - Clean, modern background.
    *   `Hugo Black (#050505)` - High-contrast footer anchor.
*   **Animations:** Smooth page-entry reveals and scroll-triggered section fades to mimic the premium feel of `hugoinc.com`.

## 4. Continuity Strategy (For Future LLMs/Engineers)
*   **Code Structure:** Follows standard Flask conventions (Templates/Static folders).
*   **State Management:** All work-sample metadata is stored in `samples.json`.
*   **Environment:** Uses `.venv` and `requirements.txt` for consistent environment setup.
*   **Tracking:** Git-initialized for clear version history on GitHub.

## 5. Deployment Status
*   **Target:** Render.com / PythonAnywhere.
*   **Domain:** thebestestimatorllc.com (DNS to be pointed upon completion).
