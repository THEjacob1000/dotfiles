function ccx
    env \
        ANTHROPIC_BASE_URL=http://127.0.0.1:8317 \
        ANTHROPIC_AUTH_TOKEN=(cat ~/.cli-proxy-api/client.key) \
        ANTHROPIC_DEFAULT_OPUS_MODEL='gpt-5.6-sol(medium)' \
        ANTHROPIC_DEFAULT_SONNET_MODEL='gpt-5.6-terra(medium)' \
        ANTHROPIC_DEFAULT_HAIKU_MODEL='gpt-5.6-luna(low)' \
        CLAUDE_CODE_DISABLE_1M_CONTEXT=1 \
        CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY=3 \
        ENABLE_TOOL_SEARCH=false \
        claude --dangerously-skip-permissions $argv
    end

function ccf
    env \
        ANTHROPIC_BASE_URL=http://127.0.0.1:8317 \
        ANTHROPIC_AUTH_TOKEN=(cat ~/.cli-proxy-api/client.key) \
        CLAUDE_CODE_SUBAGENT_MODEL='gpt-5.6-sol(medium)' \
        CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY=3 \
        claude --dangerously-skip-permissions --model claude-fable-5 $argv
    end
