#!/bin/bash

# BugReaper Project Linker
# Usage: ./scripts/link-project.sh /path/to/your/project project-name

set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: ./scripts/link-project.sh <source-path> <link-name>"
    echo ""
    echo "Example:"
    echo "  ./scripts/link-project.sh ~/Projects/my-app my-app"
    echo ""
    exit 1
fi

SOURCE_PATH="$1"
LINK_NAME="$2"
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TOY_DIR="$SCRIPT_DIR/../toy"
LINK_PATH="$TOY_DIR/$LINK_NAME"

# Check if source exists
if [ ! -d "$SOURCE_PATH" ]; then
    echo "❌ Error: Source directory does not exist: $SOURCE_PATH"
    exit 1
fi

# Check if link already exists
if [ -e "$LINK_PATH" ]; then
    echo "⚠️  Warning: $LINK_NAME already exists in toy/ folder"
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$LINK_PATH"
    else
        echo "Cancelled."
        exit 0
    fi
fi

# Create symlink
ln -s "$SOURCE_PATH" "$LINK_PATH"

echo "✅ Successfully linked!"
echo ""
echo "   Source: $SOURCE_PATH"
echo "   Link:   $LINK_PATH"
echo ""
echo "🎯 Next steps:"
echo "   1. Restart BugReaper services (or they'll auto-detect)"
echo "   2. Open http://localhost:3003"
echo "   3. Your project will appear in the dropdown!"
echo ""
echo "📝 To remove this link later:"
echo "   rm $LINK_PATH"
