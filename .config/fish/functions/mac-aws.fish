function mac-aws -d "Import short-lived AWS creds from the MacBook via Tailscale"
    ssh jacob-mac 'aws configure export-credentials --format env' | string replace -r '^export ' '' | while read -l line
        set -l kv (string split -m1 = $line)
        and set -gx $kv[1] $kv[2]
    end
    if set -q AWS_ACCESS_KEY_ID
        echo "AWS creds imported, expire: $AWS_CREDENTIAL_EXPIRATION"
    else
        echo "failed to import creds from mac" >&2
        return 1
    end
end
