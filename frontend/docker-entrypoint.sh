#!/bin/sh
set -e

cat <<EOF >/app/public/runtime-config.js
window.__ENV__ = {
  NEXT_PUBLIC_API_URL: "${NEXT_PUBLIC_API_URL:-http://localhost:5001/api}",
  NEXT_PUBLIC_IMAGE_HOSTS: "${NEXT_PUBLIC_IMAGE_HOSTS:-dqwxtopaa87nn.cloudfront.net,d1ffmiafbbgufv.cloudfront.net,verita-phone-store-assets.s3.amazonaws.com,verita-phone-store-assets.s3.us-east-1.amazonaws.com}"
};
EOF

exec node server.js
