param (
    [string]$GithubToken
)

# Install gh-copilot extension
if (-not (gh extension list | Where-Object { $_ -match 'github/gh-copilot' })) {
    Write-Host "Installing gh-copilot extension..."
    gh extension install github/gh-copilot
} else {
    Write-Host "gh-copilot extension is already installed."
}

# Authenticate with GitHub
if ($GithubToken) {
    Write-Host "Authenticating with GitHub token..."
    $env:GITHUB_TOKEN = $GithubToken
    gh auth login --with-token $env:GITHUB_TOKEN
    gh auth status
} else {
    Write-Host "No GitHub token provided. Skipping authentication."
}