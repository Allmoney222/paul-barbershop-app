Param(
    [Parameter(Position=0)]
    [string]$Message = "Update",
    [switch]$Push
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git not found. Install Git and ensure it's in PATH."
    exit 2
}

git rev-parse --is-inside-work-tree > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Current folder is not a git repository."
    exit 3
}

Write-Host "Staging changes..."
git add .

# If nothing is staged, `git diff --cached --quiet` exits 0 — no commit needed
git diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "No changes to commit."
} else {
    Write-Host "Committing with message: $Message"
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) {
        Write-Error "git commit failed"
        exit 4
    }
}

if ($Push) {
    Write-Host "Pushing to remote..."
    git push
    if ($LASTEXITCODE -ne 0) {
        Write-Error "git push failed"
        exit 5
    }
}

Write-Host "Done."
