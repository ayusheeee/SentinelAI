# SentinelAI

AI-Driven Security Incident Investigation — SOC dashboard UI.

Detection, MITRE mapping at runtime, ML, and LLM investigation are **not implemented yet**. The frontend now includes locally stored MITRE ATT&CK and SigmaHQ catalogs for reference and later detection work.

## Run the dashboard

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Detection catalogs

MITRE ATT&CK Enterprise and SigmaHQ rules are ingested into `frontend/public/data/` so the UI does not call live external APIs.

To refresh those files from upstream:

```bash
cd frontend
npm run ingest:detection-data
```

## What’s included

Dark-theme SOC console with sidebar navigation:

- Dashboard, Alerts, Incidents, Logs, Investigations, Sigma, MITRE ATT&CK, Reports, Settings

SOC demo numbers still come from `frontend/src/mock/data.ts`. ATT&CK techniques and Sigma rules come from the ingested catalogs.

## Planned pipeline (backend later)

Logs → Parser → Normalization → Sigma Detection → MITRE Mapping → ML Anomaly Detection → Evidence Fusion → LLM Investigation → Human Analyst
