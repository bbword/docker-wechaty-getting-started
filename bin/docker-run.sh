#!/usr/bin/env bash
set -e

BOT=$1

# import WECHATY_IMAGE from bin/docker-config.sh
source $(dirname $0)/docker-config.sh

DOCKER_ENV=$(docker::env $(env | grep WECHATY_) )

[ -z "$NO_PULL" ] && docker pull "$WECHATY_IMAGE"

docker run \
  -t -i --rm \
  --name wechaty \
  --volume="$(pwd)":/bot \
  "$WECHATY_IMAGE" \
  "$BOT"
