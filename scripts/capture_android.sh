#!/usr/bin/env bash
set -euo pipefail
# Requires an Android device already authorized through adb. Does not root the phone.
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
command -v adb >/dev/null || { echo 'Instalá Android Platform Tools (adb).'; exit 1; }
adb get-state >/dev/null
mkdir -p "$repo_root/dist/android"
adb shell perfetto --txt -c - -o /data/misc/perfetto-traces/nagua.perfetto-trace < "$repo_root/scripts/profiling/android-perfetto.pbtxt"
adb pull /data/misc/perfetto-traces/nagua.perfetto-trace "$repo_root/dist/android/nagua.perfetto-trace"
echo 'Abrí dist/android/nagua.perfetto-trace en https://ui.perfetto.dev'
