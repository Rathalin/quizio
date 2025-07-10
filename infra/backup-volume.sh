#!/bin/bash

VOLUME=$1
DATE=$(date +%Y-%m-%d)
BACKUP_FILE="${VOLUME}_backup_${DATE}.tar.gz"

docker run --rm \
  -v ${VOLUME}:/volume \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/${BACKUP_FILE} -C /volume .

echo "Backup saved to ${BACKUP_FILE}"
