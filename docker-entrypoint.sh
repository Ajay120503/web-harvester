#!/bin/sh
set -e

# Substitute environment variables in nginx config template
# Replaces ${API_URL} and ${SOCKET_URL} with actual values from environment
export API_URL="${API_URL:-http://server:5000}"
export SOCKET_URL="${SOCKET_URL:-http://server:5000}"

echo "Configuring nginx with:"
echo "  API_URL: ${API_URL}"
echo "  SOCKET_URL: ${SOCKET_URL}"

# Use envsubst to replace variables in the template
envsubst '${API_URL} ${SOCKET_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec "$@"