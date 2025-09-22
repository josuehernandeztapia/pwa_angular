#!/usr/bin/env bash
set -euo pipefail

echo "Audit Minimal Dark - Prohibited patterns in src/:"
if grep -RInE "(bg-gray-|text-gray-|linear-gradient|glass|glass-bg|glass-border|backdrop-filter|premium-card|glass-card|#ffffff|#cbd5e1)" src ; then
  echo "❌ Found prohibited Minimal Dark patterns."
  exit 1
else
  echo "✅ No prohibited patterns found."
fi

echo
echo "Counts:"
printf "bg-gray-* : %s\n" "$(grep -RIn "bg-gray-" src | wc -l | xargs)"
printf "text-gray-*: %s\n" "$(grep -RIn "text-gray-" src | wc -l | xargs)"
printf "gradient  : %s\n" "$(grep -RIn "linear-gradient" src | wc -l | xargs)"
printf "glass     : %s\n" "$(grep -RIn "glass" src | wc -l | xargs)"
printf "premium   : %s\n" "$(grep -RIn "premium-card" src | wc -l | xargs)"

