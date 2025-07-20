#!/bin/bash

# Set this to your desired backup path
BACKUP_DIR="$HOME/docker-backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
mkdir -p "$BACKUP_DIR"

# List volumes to back up (you can hardcode them instead)
VOLUMES=$(docker volume ls -q | grep quizio)

for VOL in $VOLUMES; do
  docker run --rm \
    -v ${VOL}:/volume \
    -v $BACKUP_DIR:/backup \
    alpine \
    sh -c "tar czf /backup/${VOL}_${TIMESTAMP}.tar.gz -C /volume ."
done
