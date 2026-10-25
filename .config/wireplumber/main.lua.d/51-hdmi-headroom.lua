-- NVIDIA HDMI/DP audio underruns (crackles) at small quanta while games load the CPU
table.insert(alsa_monitor.rules, {
  matches = {
    {
      { "node.name", "matches", "alsa_output.pci-0000_01_00.1.*" },
    },
  },
  apply_properties = {
    ["api.alsa.headroom"] = 1024,
  },
})
