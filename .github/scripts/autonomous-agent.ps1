# .github/scripts/autonomous-agent.ps1

# Exit on error
$ErrorActionPreference = "Continue"

# Configure git
Write-Host "Configuring git..."
git config --global user.name "GitHub Copilot"
git config --global user.email "copilot@github.com"
git remote set-url origin https://x-access-token:${env:GITHUB_TOKEN}@github.com/${env:GITHUB_REPOSITORY}

function Get-CopilotFix {
    param (
        [string]$ErrorMessage
    )

    $prompt = "The following test failed: 
$ErrorMessage
". Provide a command to fix the test."
    $suggestion = "command" | gh copilot suggest $prompt

    # This is a very simple parser. It might not work for all cases.
    $command = $suggestion | Select-String -Pattern "Suggested command: (.*)" | ForEach-Object { $_.Matches.Groups[1].Value } | Select-Object -First 1

    return $command
}

# Process Trivy results
Write-Host "Processing Trivy results..."
if (Test-Path trivy-results.json) {
    $trivy_results = Get-Content trivy-results.json | ConvertFrom-Json
    if ($trivy_results.Vulnerabilities) {
        Write-Host "Vulnerabilities found:"
        $trivy_results.Vulnerabilities | ForEach-Object {
            Write-Host "- $($_.PkgName) ($($_.InstalledVersion)): $($_.Title)"
        }
        # In the future, we can create issues or try to fix the vulnerabilities here
    } else {
        Write-Host "No vulnerabilities found."
    }
} else {
    Write-Host "trivy-results.json not found."
}

$max_iterations = 5

for ($i=1; $i -le $max_iterations; $i++) {
    Write-Host "

Iteration $i/$max_iterations

"

    # Run tests
    Write-Host "Running tests..."
    try {
        npm run test:run
    } catch {
        Write-Host "Tests failed. Trying to get a fix from Copilot..."
        $error_output = $_.Exception.Message
        $fix_command = Get-CopilotFix -ErrorMessage $error_output

        if ($fix_command) {
            Write-Host "Copilot suggested command: $fix_command"
            try {
                Invoke-Expression $fix_command
                Write-Host "Command executed successfully. Trying again..."
                continue
            } catch {
                Write-Host "Copilot's command failed. Trying to revert changes..."
                # Revert changes as a fallback
                $failing_file = $error_output | Select-String -Pattern "(.*test.js)" | ForEach-Object { $_.Matches.Groups[1].Value } | Select-Object -First 1
                if ($failing_file) {
                    $source_file = $failing_file.Replace(".test.js", ".js")
                    git checkout HEAD -- $failing_file
                    git checkout HEAD -- $source_file
                    Write-Host "Changes reverted. Trying again..."
                    continue
                }
            }
        } else {
            Write-Host "Could not get a fix from Copilot."
        }
    }

    # Fix lint and format issues
    Write-Host "Fixing lint and format issues..."
    npx eslint . --fix
    npx prettier . --write

    # Check for changes
    $changes = git status --porcelain

    if ($changes) {
        Write-Host "Changes detected. Committing..."
        git add .
        git commit -m "fix: [AUTONOMOUS] Apply code analysis, style fixes, and run tests"
        git push
    } else {
        Write-Host "No changes detected."
        # If there are no changes, it means the code is clean
        break
    }
}

Write-Host "Autonomous agent run completed."