function sony --description 'Toggle the Sony TV (HDMI-0)'
    if xrandr --listmonitors | string match -q '* HDMI-0'
        xrandr --output HDMI-0 --off
        echo 'Sony TV: off'
    else
        xrandr --output HDMI-0 --auto --pos 0x1440 \
            --output DP-4 --pos 1920x1440 \
            --output DP-2 --pos 5360x1440 \
            --output DP-0 --pos 4160x0
        echo 'Sony TV: on'
    end
end
