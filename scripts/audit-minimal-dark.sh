#!/usr/bin/env bash
set -euo pipefail

echo "Audit Minimal Dark - Prohibited patterns in src/:"
grep -RInE "(bg-gray-|text-gray-|gradient|glass|premium-card|glass-card)" src || true

echo
echo "Counts:"
printf "bg-gray-* : %s\n" "$(grep -RIn "bg-gray-" src | wc -l | xargs)"
printf "text-gray-*: %s\n" "$(grep -RIn "text-gray-" src | wc -l | xargs)"
printf "gradient  : %s\n" "$(grep -RIn "gradient" src | wc -l | xargs)"
printf "glass     : %s\n" "$(grep -RIn "glass" src | wc -l | xargs)"
printf "premium   : %s\n" "$(grep -RIn "premium-card" src | wc -l | xargs)"

