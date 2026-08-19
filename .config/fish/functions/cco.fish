function cco
    if not set -q OPENROUTER_API_KEY
        echo 'cco: OPENROUTER_API_KEY is not set' >&2
        return 1
    end

    env \
        ANTHROPIC_BASE_URL=https://openrouter.ai/api \
        ANTHROPIC_AUTH_TOKEN=$OPENROUTER_API_KEY \
        ANTHROPIC_API_KEY= \
        claude --dangerously-skip-permissions --model stealth/ox-alpha $argv
end
