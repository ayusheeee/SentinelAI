# SentinelAI

AI-Driven Security Incident Investigation — SOC Platform.

## Architecture & Pipeline

```text
Logs (Upload & Parse)
  ↓
Parsing & Field Normalization (POST /api/logs/upload)
  ↓
Sigma Detection (planned)
  ↓
MITRE ATT&CK Mapping (catalog integrated)
  ↓
ML Anomaly Detection (planned)
  ↓
Evidence Fusion & LLM Investigation (planned)
  ↓
Human Analyst Triage
```

## Running the Application

### 1. Start the Backend API (Log Parsing Engine)

```bash
cd backend
npm start
# Runs on http://localhost:3001
```

### 2. Start the Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
# Proxies /api to http://localhost:3001
```

Open the Vite URL (typically `http://localhost:5173` or `http://localhost:5174`).

---

## Log Upload & Parsing Feature

SOC analysts can upload security logs in the **Logs** page (`/logs`).

Supported formats:
- **CSV files** (`.csv`): Header-mapped security logs.
- **Syslog / Linux Auth** (`.log`, `.txt`): RFC 3164, RFC 5424, sshd, sudo.
- **CEF / Key-Value logs** (`.log`, `.txt`): Common Event Format, firewall and IPS logs.
- **JSON Lines** (`.log`, `.txt`): Newline-delimited JSON objects.

### Sample Test Logs

Sample test log files are provided in `test-logs/`:
- `test-logs/sample-security.csv`: Windows / Network security events in CSV format.
- `test-logs/sample-auth.log`: Linux authentication and sshd brute-force Syslog entries.
- `test-logs/sample-cef.log`: Palo Alto & CheckPoint CEF firewall drop/allow logs.
- `test-logs/sample-firewall.txt`: Key-value security appliance logs.

---

## Detection Catalogs

Official **MITRE ATT&CK Enterprise** (697 techniques) and **SigmaHQ Rules** (3,754 rules) are locally stored in `frontend/public/data/`.

To refresh the upstream catalogs:
```bash
cd frontend
npm run ingest:detection-data
```
