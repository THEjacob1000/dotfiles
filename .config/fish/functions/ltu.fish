#!/usr/bin/env fish

ssh -N \
  -o ExitOnForwardFailure=no \
  -L 10002:global-auth.service.consul:10002 \
  -L 3550:app-manager.service.consul:3550 \
  ssh-bastion.legacy.notprod.dev
