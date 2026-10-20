function n --wraps="numen" --description "alias n=numen"; numen $argv; end
function kk --wraps="agent-run kiro kiro-cli --agent yolo --v3" --description "alias kk=agent-run kiro kiro-cli --agent yolo --v3"; agent-run kiro kiro-cli --agent yolo --v3 $argv; end
abbr --add kiro-cli 'agent-run kiro ~/.local/bin/kiro-cli'
function kiro --wraps="kiro-cli" --description "alias kiro=kiro-cli"; kiro-cli $argv; end
