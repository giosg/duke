#!/bin/bash

set -e

usage() {
cat <<EOT
Usage: $0 [-h|--help] [--key=<KEY>|-k <KEY>]
Arguments
  -h, --help                   Show help
  -k KEYFILE, --key=KEYFILE    Optional extension private key file to include as key.pem.
                               Not needed when updating an existing Chrome Web Store item.
EOT
}

keyfile=""

while [[ $# > 0 ]]
do
  case "$1" in
  -k)
    keyfile=$2
    shift 2
    ;;
  --key=*)
    keyfile=${1#*=}
    shift
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    args=("${args[@]}" "$1")
    shift
    ;;
  esac
done

set -u

# Some sanity checks
[[ -n "$keyfile" && ! -f "$keyfile" ]] && {
  echo "Keyfile $keyfile does not exist!"
  exit 1
}

# Ensure that npm packages are installed
echo "Installing packages ..."
npm ci

# Build with Vite
echo "Building extension with Vite ..."
npm run build

# Make sure the manifest and package.json agree on the version
manifest_version=$(node -p "require('./dist/manifest.json').version")
package_version=$(node -p "require('./package.json').version")
[[ "$manifest_version" != "$package_version" ]] && {
  echo "Version mismatch: manifest.json has $manifest_version but package.json has $package_version"
  exit 1
}
echo "Packaging version $manifest_version"

# Do the packaging
echo "Building duke2.zip ..."

# Create a temp dir, copy built files there and compress the extension
echo "Copying files"
build_dir=$(mktemp -d)
cp -R dist/. $build_dir
if [[ -n "$keyfile" ]]; then
  cp "$keyfile" $build_dir/key.pem
  echo "Compressing extension and $keyfile into duke2.zip"
else
  echo "Compressing extension into duke2.zip"
fi
cd $build_dir
zip -r duke2.zip .
cd -
rm -f duke2.zip
cp $build_dir/duke2.zip .
echo "Done building duke2.zip"
echo "Go to Chrome webstore and upload duke2.zip"
