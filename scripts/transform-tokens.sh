#!/usr/bin/env bash
# Transform the Figma tokens into a format that can be used with style-dictionary

set -e

rm -rf dist/js

npx token-transformer tokens dist/js/cds-tokens.json "core/core,mode/light,viewport/desktop,brand/compassion" core/core
