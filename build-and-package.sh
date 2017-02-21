#!/bin/bash

set -e

usage() {
cat <<EOT
Usage: $0 [-h|--help] --key=<KEY>|-k <KEY>
Arguments
  -h, --help                   Show help
  -k KEYFILE, --key=KEYFILE    Extension private key file
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

# Check required params
[[  -z "$keyfile" ]] && {
  usage
  exit 1
}
# Some sanity checks
[[ ! -f $keyfile ]] && {
  echo "Keyfile $keyfile does not exist!"
  exit 1
}

# Do the build
echo "Building duke.zip ..."

# Create a temp dir, copy stuff there and compress the extension
echo "Copying files"
build_dir=$(mktemp -d)
cp -R app/. $build_dir
cp $keyfile $build_dir/key.pem

echo "Compressing extension and $keyfile into duke.zip"
cd $build_dir
zip -r duke.zip .
cd -
cp $build_dir/duke.zip .
echo "Done."
echo "Go to Chrome webstore and upload duke.zip"
