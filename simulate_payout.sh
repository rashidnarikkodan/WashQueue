#!/bin/bash

# Default values
API_URL="http://localhost:3000/api/settlements/webhook/razorpayx"
ENV_FILE="./server/.env"

# Extract secret from .env if it exists
if [ -f "$ENV_FILE" ]; then
  SECRET=$(grep -E "^RAZORPAYX_WEBHOOK_SECRET=" "$ENV_FILE" | cut -d '=' -f2 | tr -d '"' | tr -d "'")
fi

show_help() {
  echo "Usage: $0 [OPTIONS]"
  echo "Simulate a RazorpayX payout.processed webhook."
  echo ""
  echo "Options:"
  echo "  -f, --file           A JSON file containing the exact payload to send (overrides -p, -r, -a)"
  echo "  -p, --payout-id      The payout ID (e.g., pout_xyz123) [ignored if --file is used]"
  echo "  -r, --reference-id   The reference ID of the settlement [ignored if --file is used]"
  echo "  -a, --amount         The amount in paise (default: 500000) [ignored if --file is used]"
  echo "  -s, --secret         RazorpayX Webhook Secret (defaults to RAZORPAYX_WEBHOOK_SECRET in $ENV_FILE)"
  echo "  -u, --url            Webhook URL (default: $API_URL)"
  echo "  -h, --help           Show this help message"
  exit 1
}

AMOUNT=500000

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -f|--file) JSON_FILE="$2"; shift ;;
        -p|--payout-id) PAYOUT_ID="$2"; shift ;;
        -r|--reference-id) REF_ID="$2"; shift ;;
        -a|--amount) AMOUNT="$2"; shift ;;
        -s|--secret) SECRET="$2"; shift ;;
        -u|--url) API_URL="$2"; shift ;;
        -h|--help) show_help ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [ -z "$SECRET" ]; then
  echo "Error: RAZORPAYX_WEBHOOK_SECRET is not set in $ENV_FILE and was not provided via --secret"
  exit 1
fi

if [ -n "$JSON_FILE" ]; then
  if [ ! -f "$JSON_FILE" ]; then
    echo "Error: File '$JSON_FILE' not found."
    exit 1
  fi
  PAYLOAD=$(cat "$JSON_FILE")
  echo "Using payload from file: $JSON_FILE"
else
  if [ -z "$PAYOUT_ID" ] || [ -z "$REF_ID" ]; then
    echo "Error: You must provide either --file OR both --payout-id and --reference-id."
    echo ""
    show_help
  fi
  TIMESTAMP=$(date +%s)
  # Exact JSON structure expected by Razorpay signature verification
  PAYLOAD=$(cat <<EOF
{"entity":"event","account_id":"acc_mock123","event":"payout.processed","contains":["payout"],"payload":{"payout":{"entity":{"id":"$PAYOUT_ID","entity":"payout","amount":$AMOUNT,"currency":"INR","status":"processed","reference_id":"$REF_ID"}}},"created_at":$TIMESTAMP}
EOF
)
  echo "Generated mock payload for Payout ID: $PAYOUT_ID and Ref ID: $REF_ID"
fi

# Compute HMAC SHA256 signature
SIGNATURE=$(printf "%s" "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

echo "----------------------------------------"
echo "Target URL   : $API_URL"
echo "Signature    : $SIGNATURE"
echo "----------------------------------------"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: $SIGNATURE" \
  -d "$PAYLOAD"

echo ""
echo ""
