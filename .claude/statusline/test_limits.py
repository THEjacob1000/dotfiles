#!/usr/bin/env python3
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("limits.py")
STATUS_INPUT = json.dumps({"model": {"id": "claude-opus-4-6"}})
USAGE_RESPONSE = {
    "five_hour": {
        "utilization": 12.0,
        "resets_at": "2099-01-01T00:00:00+00:00",
    },
    "seven_day": {
        "utilization": 34.0,
        "resets_at": "2099-01-02T00:00:00+00:00",
    },
}
CREDENTIALS = {"claudeAiOauth": {"accessToken": "test-token"}}


class LimitsCredentialsTest(unittest.TestCase):
    def run_usage(self, *, credentials_file=False, keychain=False):
        with tempfile.TemporaryDirectory() as directory:
            home = Path(directory)
            cache = home / ".cache" / "ccstatusline"
            cache.mkdir(parents=True)
            (cache / "limits-claude.json").write_text(json.dumps(USAGE_RESPONSE))

            if credentials_file:
                claude = home / ".claude"
                claude.mkdir()
                (claude / ".credentials.json").write_text(json.dumps(CREDENTIALS))

            env = os.environ.copy()
            env["HOME"] = str(home)
            if keychain:
                bin_dir = home / "bin"
                bin_dir.mkdir()
                security = bin_dir / "security"
                security.write_text(
                    "#!/bin/sh\nprintf '%s\\n' '"
                    + json.dumps(CREDENTIALS)
                    + "'\n"
                )
                security.chmod(0o755)
                env["PATH"] = f"{bin_dir}{os.pathsep}{env['PATH']}"

            return subprocess.run(
                [sys.executable, SCRIPT, "usage"],
                input=STATUS_INPUT,
                capture_output=True,
                check=True,
                env=env,
                text=True,
            ).stdout.strip()

    def test_reads_linux_credentials_file(self):
        self.assertEqual(
            self.run_usage(credentials_file=True),
            "Session: 12% | Weekly: 34%",
        )

    def test_reads_macos_keychain_when_file_is_absent(self):
        self.assertEqual(
            self.run_usage(keychain=True),
            "Session: 12% | Weekly: 34%",
        )


if __name__ == "__main__":
    unittest.main()
