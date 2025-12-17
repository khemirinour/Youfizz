#!/bin/bash

# Script to mount OVH Block Storage volume for MinIO
# This script should be run as root or with sudo

set -e

# Configuration
MOUNT_POINT="/mnt/minio-storage"
DEVICE_PATTERN="/dev/vdb"
FSTYPE="ext4"
OWNER_USER="root"
OWNER_GROUP="root"

echo "=== OVH Block Storage Mount Script ==="
echo "Mount point: $MOUNT_POINT"
echo ""

# Function to find the block device
find_block_device() {
    # Check for common OVH block storage device names
    for dev in /dev/vdb /dev/sdb /dev/nvme1n1; do
        if [ -b "$dev" ]; then
            # Check if device is not already mounted
            if ! mountpoint -q "$dev" 2>/dev/null; then
                echo "$dev"
                return 0
            fi
        fi
    done
    
    # List all block devices and let user choose
    echo "Available block devices:"
    lsblk -o NAME,SIZE,TYPE,MOUNTPOINT | grep -E "disk|part"
    echo ""
    read -p "Enter device path (e.g., /dev/vdb): " DEVICE
    echo "$DEVICE"
}

# Check if mount point exists, create if not
if [ ! -d "$MOUNT_POINT" ]; then
    echo "Creating mount point: $MOUNT_POINT"
    mkdir -p "$MOUNT_POINT"
fi

# Check if already mounted
if mountpoint -q "$MOUNT_POINT"; then
    echo "Volume is already mounted at $MOUNT_POINT"
    df -h "$MOUNT_POINT"
    exit 0
fi

# Find the block device
echo "Detecting block storage device..."
DEVICE=$(find_block_device)

if [ -z "$DEVICE" ] || [ ! -b "$DEVICE" ]; then
    echo "Error: Block device not found or invalid: $DEVICE"
    echo "Please ensure the OVH Block Storage volume is attached to your VPS"
    exit 1
fi

echo "Using device: $DEVICE"
echo ""

# Check if device has a filesystem
if blkid "$DEVICE" > /dev/null 2>&1; then
    echo "Device $DEVICE already has a filesystem"
    FSTYPE=$(blkid -s TYPE -o value "$DEVICE" || echo "$FSTYPE")
    echo "Detected filesystem: $FSTYPE"
else
    echo "Device $DEVICE appears to be unformatted"
    read -p "Format device? This will ERASE ALL DATA! (yes/no): " FORMAT
    
    if [ "$FORMAT" = "yes" ]; then
        echo "Formatting $DEVICE as $FSTYPE..."
        mkfs -t "$FSTYPE" "$DEVICE"
        echo "Formatting complete"
    else
        echo "Aborting. Please format the device manually or attach a pre-formatted volume."
        exit 1
    fi
fi

# Mount the device
echo "Mounting $DEVICE to $MOUNT_POINT..."
mount -t "$FSTYPE" "$DEVICE" "$MOUNT_POINT"

# Set permissions for Docker
echo "Setting permissions..."
chown -R "$OWNER_USER:$OWNER_GROUP" "$MOUNT_POINT"
chmod 755 "$MOUNT_POINT"

# Add to /etc/fstab for automatic mounting on boot
FSTAB_ENTRY="$DEVICE $MOUNT_POINT $FSTYPE defaults,noatime 0 2"

if ! grep -q "$MOUNT_POINT" /etc/fstab; then
    echo "Adding entry to /etc/fstab for automatic mounting..."
    echo "$FSTAB_ENTRY" >> /etc/fstab
    echo "Entry added to /etc/fstab"
else
    echo "Entry already exists in /etc/fstab"
fi

# Verify mount
if mountpoint -q "$MOUNT_POINT"; then
    echo ""
    echo "=== Mount successful ==="
    echo "Device: $DEVICE"
    echo "Mount point: $MOUNT_POINT"
    echo "Filesystem: $FSTYPE"
    echo ""
    df -h "$MOUNT_POINT"
    echo ""
    echo "Volume is ready for MinIO storage!"
else
    echo "Error: Mount verification failed"
    exit 1
fi

