function clicklock --description 'Toggle right-click drag lock'
    set -l device_id (xinput list --id-only 'pointer:Razer Razer Naga Trinity')
    set -l drag_lock (xinput list-props $device_id | string match -r 'libinput Drag Lock Buttons.*')

    if string match -qr ':\s*3,\s*3$' -- $drag_lock
        xinput set-prop $device_id 'libinput Drag Lock Buttons' 0
        echo 'Right-click lock: off'
    else
        xinput set-prop $device_id 'libinput Drag Lock Buttons' 3 3
        echo 'Right-click lock: on'
    end
end
