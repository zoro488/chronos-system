# .github/scripts/copilot-cli-tools.ps1

function Invoke-CopilotReview {
    param (
        [string]$FilePath
    )

    $prompt = "Review the file '$FilePath' for bugs, performance issues, and style violations. Provide a summary of the issues and suggestions for improvement."
    gh copilot suggest $prompt
}

function New-CopilotTests {
    param (
        [string]$SourceFile
    )

    $prompt = "Generate unit tests for the file '$SourceFile'. The tests should cover the main functionality of the code and include edge cases."
    gh copilot suggest $prompt
}

function Optimize-CodeWithCopilot {
    param (
        [string]$FilePath
    )

    $prompt = "Optimize the code in the file '$FilePath' for performance and readability. Provide the optimized code."
    gh copilot suggest $prompt
}

function Add-CopilotDocumentation {
    param (
        [string]$FilePath
    )

    $prompt = "Generate documentation for the code in the file '$FilePath'. The documentation should be in a format suitable for JSDoc or TypeDoc."
    gh copilot suggest $prompt
}

function Find-SecurityIssues {
    param (
        [string]$FilePath
    )

    $prompt = "Analyze the file '$FilePath' for security vulnerabilities. Provide a list of the vulnerabilities and suggestions for how to fix them."
    gh copilot suggest $prompt
}

function Invoke-CopilotRefactor {
    param (
        [string]$FilePath,
        [string]$Pattern
    )

    $prompt = "Refactor the code in the file '$FilePath' using the '$Pattern' pattern. Provide the refactored code."
    gh copilot suggest $prompt
}

function New-CopilotCommitMessage {
    $prompt = "Generate a commit message for the current staged changes. The commit message should follow the conventional commit format."
    gh copilot suggest $prompt
}

function Invoke-CopilotProjectAnalysis {
    $prompt = "Analyze the entire project and provide a report on the code quality, performance, and security. The report should include a list of the most critical issues and suggestions for improvement."
    gh copilot suggest $prompt
}

# Aliases
Set-Alias -Name ghcr -Value Invoke-CopilotReview
Set-Alias -Name ghct -Value New-CopilotTests
Set-Alias -Name ghco -Value Optimize-CodeWithCopilot
Set-Alias -Name ghcd -Value Add-CopilotDocumentation
Set-Alias -Name ghcv -Value Find-SecurityIssues
Set-Alias -Name ghcf -Value Invoke-CopilotRefactor
Set-Alias -Name ghcm -Value New-CopilotCommitMessage
Set-Alias -Name ghca -Value Invoke-CopilotProjectAnalysis