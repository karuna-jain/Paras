#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# For H2 (dev)
cp ./data/paras_db.mv.db "$BACKUP_DIR/paras_db_$DATE.mv.db"
echo "Backup created: $BACKUP_DIR/paras_db_$DATE.mv.db"

# For MySQL (prod) — uncomment when switching
# mysqldump -u root -p paras_autoparts > "$BACKUP_DIR/paras_db_$DATE.sql"
# echo "MySQL backup created: $BACKUP_DIR/paras_db_$DATE.sql"

# Keep only last 30 backups
ls -t $BACKUP_DIR/*.mv.db 2>/dev/null | tail -n +31 | xargs rm -f
