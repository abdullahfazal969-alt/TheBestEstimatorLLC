# Workflow: How to Update Work Samples

Whenever the CEO provides you with a new sample file, follow these steps to update the website instantly.

## 1. Prepare the File
1.  **Rename the file:** Give it a clean, descriptive name (e.g., `sample_drywall_commercial.pdf`).
2.  **Move the file:** Move the file into your local project directory: `/home/fazal/thebestestimator/static/samples/`.

## 2. Register the Sample in `samples.json`
Open `/home/fazal/thebestestimator/samples.json` and add a new entry to the array. 

**Example entry:**
```json
{
  "id": "unique-id-here",
  "trade": "TheTradeName",
  "title": "Title of the sample",
  "description": "Short description of the work sample.",
  "file_url": "/static/samples/sample_drywall_commercial.pdf",
  "file_type": "pdf"
}
```
*Note: Make sure the `file_url` matches the filename you moved into the folder.*

## 3. Update the Filter Tabs (Only if it's a NEW Trade Division)
Open `/home/fazal/thebestestimator/templates/samples.html`. Find the section with `<div class="filter-tabs">`.

If you added a sample for a trade division that *does not exist* in the filter buttons, add a new button:
```html
<button class="filter-tab" data-filter="YourNewTradeName">YourNewTradeName</button>
```

## 4. Deploy
Once updated, commit your changes and push to GitHub:
```bash
git add .
git commit -m "feat: added new sample for [Trade Name]"
git push origin main
```
The website will update automatically on your hosting platform!
