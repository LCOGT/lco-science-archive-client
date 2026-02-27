#!/bin/sh

# Locate the best available python interpreter
PYTHON_EXE=$(command -v python3 || command -v python || command -v python2)

if [ -z "$PYTHON_EXE" ]; then
    echo "Error: Python interpreter not found." >&2
    exit 1
fi

function getJsonVal () {
    $PYTHON_EXE -c "import json,sys;sys.stdout.write(json.dumps(json.load(sys.stdin)$1))";
}

frames=(FRAMELIST)
authtoken="AUTHTOKEN"
frame_url="ARCHIVEFRAMEURL"

echo "Downloading ${#frames[@]} frames to the current directory"
for f in ${frames[@]}; do
    if [ "$authtoken" != "AUTHTOKEN" ]; then
      json=$(wget -qO- --header="Authorization: Token $authtoken" "$frame_url$f/")
    else
      json=$(wget -qO- "$frame_url$f/")
    fi
    filename=$(echo $json| getJsonVal "['filename']" | tr -d '"')
    url=$(echo $json | getJsonVal "['url']" | tr -d '"')
    wget -O $filename -c $url
done
exit 0
