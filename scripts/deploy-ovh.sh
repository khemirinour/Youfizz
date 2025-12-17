#!/bin/bash

# OVH Production Deployment Script
# This script automates the deployment process on OVH VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="${PROJECT_DIR:-/opt/you_fizz}"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
REPO_URL="${REPO_URL:-https://gitlab.com/wassim.dallaliii-group/you_fizz.git}"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    log_info "All requirements met!"
}

check_env_file() {
    if [ ! -f "$PROJECT_DIR/$ENV_FILE" ]; then
        log_warn "Environment file $ENV_FILE not found!"
        log_info "Creating from template..."
        if [ -f "$PROJECT_DIR/.env.production.example" ]; then
            cp "$PROJECT_DIR/.env.production.example" "$PROJECT_DIR/$ENV_FILE"
            log_warn "Please edit $PROJECT_DIR/$ENV_FILE with your production values before continuing!"
            exit 1
        else
            log_error "Template file .env.production.example not found!"
            exit 1
        fi
    fi
    log_info "Environment file found"
}

check_minio_volume() {
    if [ ! -d "/mnt/minio-storage" ]; then
        log_warn "MinIO storage directory /mnt/minio-storage does not exist!"
        log_info "Please run scripts/mount-ovh-volume.sh first to mount the OVH Block Storage volume"
        exit 1
    fi
    
    if ! mountpoint -q /mnt/minio-storage 2>/dev/null; then
        log_warn "MinIO storage directory is not mounted!"
        log_info "Please run scripts/mount-ovh-volume.sh first to mount the OVH Block Storage volume"
        exit 1
    fi
    
    log_info "MinIO storage volume is mounted"
}

setup_project() {
    log_info "Setting up project directory..."
    
    if [ ! -d "$PROJECT_DIR" ]; then
        log_info "Creating project directory: $PROJECT_DIR"
        sudo mkdir -p "$PROJECT_DIR"
        sudo chown -R $USER:$USER "$PROJECT_DIR"
    fi
    
    cd "$PROJECT_DIR"
    
    # Clone or update repository
    if [ ! -d ".git" ]; then
        log_info "Cloning repository..."
        git clone "$REPO_URL" .
    else
        log_info "Updating repository..."
        git pull origin main || git pull origin master
    fi
}

build_images() {
    log_info "Building Docker images..."
    cd "$PROJECT_DIR"
    
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
    
    log_info "Images built successfully"
}

deploy_services() {
    log_info "Deploying services..."
    cd "$PROJECT_DIR"
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check service status
    log_info "Service status:"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
}

cleanup() {
    log_info "Cleaning up unused Docker resources..."
    docker image prune -f
    docker system prune -f --volumes
}

show_logs() {
    log_info "Showing recent logs (last 50 lines)..."
    cd "$PROJECT_DIR"
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --tail=50
}

# Main deployment flow
main() {
    log_info "=== OVH Production Deployment ==="
    log_info "Project directory: $PROJECT_DIR"
    log_info "Compose file: $COMPOSE_FILE"
    log_info ""
    
    # Parse command line arguments
    SKIP_BUILD=false
    SKIP_CLEANUP=false
    SHOW_LOGS=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-cleanup)
                SKIP_CLEANUP=true
                shift
                ;;
            --logs)
                SHOW_LOGS=true
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Usage: $0 [--skip-build] [--skip-cleanup] [--logs]"
                exit 1
                ;;
        esac
    done
    
    # Run checks
    check_requirements
    check_env_file
    check_minio_volume
    
    # Setup project
    setup_project
    
    # Build images (unless skipped)
    if [ "$SKIP_BUILD" = false ]; then
        build_images
    else
        log_info "Skipping build (--skip-build flag set)"
    fi
    
    # Deploy services
    deploy_services
    
    # Cleanup (unless skipped)
    if [ "$SKIP_CLEANUP" = false ]; then
        cleanup
    else
        log_info "Skipping cleanup (--skip-cleanup flag set)"
    fi
    
    # Show logs if requested
    if [ "$SHOW_LOGS" = true ]; then
        show_logs
    fi
    
    log_info ""
    log_info "=== Deployment Complete ==="
    log_info "Services are running. Check status with:"
    log_info "  docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE ps"
    log_info ""
    log_info "View logs with:"
    log_info "  docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE logs -f"
}

# Run main function
main "$@"

