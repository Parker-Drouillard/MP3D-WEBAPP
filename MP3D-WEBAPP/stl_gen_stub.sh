#!/bin/bash

# Stub STL binary for development
# Simulates the real binary interface: --item <slug> --input <dir> --output <filepath>

ITEM=""
INPUT=""
OUTPUT=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --item) ITEM="$2"; shift 2 ;;
    --input) INPUT="$2"; shift 2 ;;
    --output) OUTPUT="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# Validate arguments
if [[ -z "$ITEM" || -z "$INPUT" || -z "$OUTPUT" ]]; then
  echo "Usage: stl_gen_stub --item <slug> --input <dir> --output <filepath>" >&2
  exit 1
fi

echo "[stub] Processing item=$ITEM input=$INPUT output=$OUTPUT"

# Simulate processing time
sleep 2

# Write a minimal valid STL file
cat > "$OUTPUT" << 'EOF'
solid stub
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 1 0 0
      vertex 0 1 0
    endloop
  endfacet
endsolid stub
EOF

echo "[stub] STL written to $OUTPUT"
exit 0