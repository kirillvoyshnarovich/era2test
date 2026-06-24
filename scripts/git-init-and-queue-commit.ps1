# Workflow:
# 1) stash текущих изменений (очередь генераций)
# 2) initial commit базового состояния
# 3) apply stash
# 4) commit с фичей очереди
#
# Запуск из корня frontend:
#   powershell -ExecutionPolicy Bypass -File .\scripts\git-init-and-queue-commit.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git не найден в PATH. Установите Git for Windows и перезапустите терминал."
}

if (-not (Test-Path .git)) {
  Write-Host "-> git init"
  git init
}

Write-Host "-> git stash push -u -m 'generation-queue feature'"
git stash push -u -m "generation-queue feature"

Write-Host "-> initial commit (base state)"
git add .
git commit -m "$(@'
Initial commit: ERA2 frontend base state.

EOF
')"

Write-Host "-> git stash pop"
git stash pop

Write-Host "-> feature commit"
git add .
git commit -m "$(@'
Add generation queue screen with mock engine and task list.

Implements queue page, mock engine, filters, counters, and task list UI per assignment spec.
EOF
')"

Write-Host "Done."
git log --oneline -n 3
git status
