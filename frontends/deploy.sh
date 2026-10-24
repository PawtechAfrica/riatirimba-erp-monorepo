#!/usr/bin/bash
set -e

# Default values
APP_TO_DEPLOY="all"
SKIP_BUILD=false

# Parse arguments safely so order doesn't matter
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            ;;
        admin|admission|all)
            APP_TO_DEPLOY="$1"
            ;;
        *)
            echo "Unknown parameter: $1"
            echo "Usage: $0 [admin|admission|all] [--skip-build]"
            exit 1
            ;;
    esac
    shift
done

## --- Function to Deploy Admin App ---
deploy_admin() {
    echo "Deploying admin..."
    cd ./admin

    if [ "$SKIP_BUILD" = false ]; then
        pnpm run build
    else
        echo "⏩ Skipping build step..."
    fi

    cd dist
    # Removed the example ssh key and host for security
    scp -r ./ riatirim1@37.120.175.36:erp.riatirimbatvc.ac.ke
    echo "✅ Admin deployment completed!"
    cd - > /dev/null
    cd ../
}

## --- Function to Deploy Admission App ---
deploy_admission() {
    echo "Deploying admission..."
    cd ./admission

    if [ "$SKIP_BUILD" = false ]; then
        pnpm run build
    else
        echo "⏩ Skipping build step..."
    fi

    cd dist
    scp -r ./ riatirim1@37.120.175.36:admission.riatirimbatvc.ac.ke
    echo "✅ Admission deployment completed!"
    cd - > /dev/null
    cd ../
}


## --- Conditional Deployment Logic ---

if [ "$APP_TO_DEPLOY" == "admin" ] || [ "$APP_TO_DEPLOY" == "all" ]; then
    deploy_admin
fi

if [ "$APP_TO_DEPLOY" == "admission" ] || [ "$APP_TO_DEPLOY" == "all" ]; then
    deploy_admission
fi

# Final message
if [ "$APP_TO_DEPLOY" == "all" ]; then
    echo "💯 Deployment of ALL apps completed!"
else
    echo "💯 Deployment of $APP_TO_DEPLOY completed!"
fi
