#!/usr/bin/env fish

function ltu --description "Tunnel legacy services"
    ssh -N \
        -o ExitOnForwardFailure=no \
        -L 10002:global-auth.service.consul:10002 \
        -L 3550:app-manager.service.consul:3550 \
        legacy-bastion
end
