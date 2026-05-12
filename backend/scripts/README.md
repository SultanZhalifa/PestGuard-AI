# Backend Scripts

Utility scripts for development, training, and DB migration.  
**NOT part of the production runtime** — do not import these in `app.py`.

| Script | Purpose |
|--------|---------|
| `train_custom_model.py` | Train custom YOLO11 model on warehouse dataset |
| `download_datasets.py` | Download and prepare training datasets from Roboflow |
| `migrate_zones.py` | One-off DB migration for camera_zones table schema |

## Usage

Run from the `backend/` directory:

```bash
# Training
python scripts/train_custom_model.py

# Download datasets
python scripts/download_datasets.py

# DB migration (only needed once after schema change)
python scripts/migrate_zones.py
```
