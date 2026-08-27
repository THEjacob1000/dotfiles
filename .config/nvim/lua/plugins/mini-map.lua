return {
  {
    "nvim-mini/mini.map",
    version = false,
    config = function()
      local map = require("mini.map")

      map.setup({
        integrations = {
          map.gen_integration.builtin_search(),
          map.gen_integration.diagnostic(),
          map.gen_integration.gitsigns(),
        },
      })
    end,
    keys = {
      {
        "<leader>um",
        function()
          require("mini.map").toggle()
        end,
        desc = "Toggle Minimap",
      },
    },
  },
}
