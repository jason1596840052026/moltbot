# molbot

molbot is a Flask-based backend service for a personal assistant chatbot.
It supports local development on Windows PowerShell and has been deployed successfully to Render.

## Project Overview

This project is a lightweight backend API service built with Flask.
It connects to the NVIDIA API and currently uses the following model:

- `meta/llama-3.1-8b-instruct`

Current confirmed capabilities:

- Local Flask app runs successfully
- NVIDIA API connection works
- `GET /` works
- `GET /health` works
- `POST /chat` works
- Traditional Chinese UTF-8 JSON request works correctly
- Render deployment is successful

## Deployment

Render Web Service has been deployed successfully.

- Render base URL: `https://moltbot-ckvn.onrender.com`

Example:

- `https://your-service-name.onrender.com`

## Project Structure

```text
molbot/
├─ app.py
├─ requirements.txt
├─ test_nvidia_api.py
├─ README.md
├─ .gitignore
└─ .env               # local only, do not upload
```

## Environment Variables

This project uses environment variables for API key management.

Required environment variables:

- `NVIDIA_API_KEY`

Local `.env` example:

```env
NVIDIA_API_KEY=your_api_key_here
```

> Do not upload `.env` to GitHub.

## Local Setup

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run locally

```bash
python app.py
```

### 3. Local default URL

```
http://127.0.0.1:5000
```

## API Endpoints

### GET /

Backend service status check.

**Response example:**

```json
{
  "message": "molbot backend is running"
}
```

### GET /health

Health check endpoint.

**Response example:**

```json
{
  "status": "ok"
}
```

### POST /chat

Send a user message to the backend and get an AI reply.

**Request body:**

```json
{
  "message": "你好，請用繁體中文自我介紹"
}
```

**Response example:**

```json
{
  "reply": "你好！我是 molbot ..."
}
```

## PowerShell Test Examples

### Test /

```powershell
Invoke-RestMethod `
  -Uri "https://moltbot-ckvn.onrender.com/" `
  -Method Get
```

### Test /health

```powershell
Invoke-RestMethod `
  -Uri "https://moltbot-ckvn.onrender.com/health" `
  -Method Get
```

### Test /chat with Traditional Chinese UTF-8 JSON

```powershell
$body = @{
    message = "你好，請用繁體中文自我介紹"
} | ConvertTo-Json -Depth 3

Invoke-RestMethod `
  -Uri "https://moltbot-ckvn.onrender.com/chat" `
  -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))
```

## Error Handling

Current error handling direction:

- Return JSON response format consistently
- Handle API request errors
- Handle unexpected server errors
- Keep backend responses easy to test in PowerShell

## Development Notes

- Windows environment
- PowerShell-first workflow
- `.env` is for local use only
- Production secret values should be set in Render environment variables

## Roadmap

Planned next improvements:

- Improve README details continuously
- Refine API response format
- Add better exception handling
- Add request validation
- Prepare for future frontend integration
- Prepare for future assistant feature expansion