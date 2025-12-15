#!/usr/bin/env bash

INPUT=$1
SLEEP=${2:-1}

# Show help if requested
if [ "$INPUT" = "--help" ] || [ "$INPUT" = "-h" ]; then
  echo "Usage: $0 <adoc-file> [sleep-interval]"
  echo ""
  echo "Watches a folder for file changes and rebuilds the HTML output when needed."
  echo ""
  echo "Arguments:"
  echo "  <adoc-file>        Path to the AsciiDoc (.adoc) file to convert"
  echo "  [sleep-interval]   Seconds to wait between checks (default: 1)"
  echo ""
  echo "How it works:"
  echo "  - Monitors ALL files in the folder containing the .adoc file"
  echo "  - If ANY file is newer than the output .html file, triggers a rebuild"
  echo "  - Uses Docker with asciidoctor-revealjs and asciidoctor-diagram"
  echo ""
  echo "The output HTML file will be created in the parent folder (../) of the input .adoc file."
  echo "You can jump to any slide in the presentation with #<horizontal>/<vertical> in the URL (0-based)."
  echo ""
  echo "Example:"
  echo "  $0 presentation.adoc"
  echo "  $0 presentation.adoc 2"
  echo ""
  exit 0
fi

if [ -z "$INPUT" ]; then
  echo "Usage: $0 <adoc-file> [sleep-interval]"
  echo "Run '$0 --help' for more information."
  exit 1
fi

FOLDER=$(dirname "$INPUT")
BASENAME=$(basename "$INPUT" .adoc)
if command -v realpath >/dev/null 2>&1; then
  ABS_FOLDER=$(realpath -m "$FOLDER")
elif command -v readlink >/dev/null 2>&1; then
  ABS_FOLDER=$(readlink -f "$FOLDER" 2>/dev/null || (cd "$FOLDER" 2>/dev/null && pwd -P))
else
  ABS_FOLDER=$(cd "$FOLDER" 2>/dev/null && pwd -P || printf "%s" "$FOLDER")
fi

OUTPUT="$ABS_FOLDER/$BASENAME.html"

echo "🔍 Watching folder: $(tput setaf 2)$ABS_FOLDER$(tput sgr0)"
echo "📝 Input file: $(tput setaf 2)$INPUT$(tput sgr0)"
echo "📄 Output file: $(tput setaf 2)file://$OUTPUT$(tput sgr0)"
echo "⏱  Sleep interval: $(tput setaf 2)$SLEEP seconds$(tput sgr0)"
echo ""

# Initial build
echo -n "🔄 Building $OUTPUT..."
docker run -v "$(pwd)":/documents asciidoctor/docker-asciidoctor asciidoctor-revealjs -r asciidoctor-diagram -o "$OUTPUT" "$INPUT"
echo "$(tput setaf 2)✔$(tput sgr0)"

while true; do
  # Get the newest timestamp from all files in the folder (excluding OUTPUT file)
#  find "$FOLDER" -type f ! -path "$OUTPUT" -printf '%T@ %p\n' 2>/dev/null | sort -rn
  newest_input=$(find "$ABS_FOLDER" -type f ! -path "$OUTPUT" -printf '%T@\n' 2>/dev/null | sort -rn | head -1)

  # Get output timestamp (default to 0 if file doesn't exist)
  if [ -f "$OUTPUT" ]; then
    output=$(stat "$OUTPUT" -c %Y)
  else
    output=0
  fi

  # Compare timestamps (convert to integer comparison)
  if (( $(echo "$newest_input > $output" | bc -l) )); then
    echo -n "🔄 $OUTPUT is outdated, rebuilding..."
    docker run -v "$(pwd)":/documents asciidoctor/docker-asciidoctor asciidoctor-revealjs -r asciidoctor-diagram -o "$OUTPUT" "$INPUT"
    echo "$(tput setaf 2)✔$(tput sgr0)"
  fi
  sleep "$SLEEP"
done

