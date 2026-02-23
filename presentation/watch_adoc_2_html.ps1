param (
    [string]$PROJECT
)

if ([string]::IsNullOrWhiteSpace($PROJECT)) {
    Write-Host "Usage: .\watch_adoc_2_html.ps1 -PROJECT <project-name>"
    Write-Host "Example: .\watch_adoc_2_html.ps1 -PROJECT my-presentation"
    Write-Host "Input expected: <project-name>/<project-name>.adoc"
    Write-Host "Output will be: <project-name>/<project-name>.html"
    exit 1
}

# Replace backslashes with forward slashes
$PROJECT = $PROJECT.Replace('\', '/')
$DIR = Get-Location

$inputFile = "${DIR}\$PROJECT\$PROJECT.adoc"
$outputFile = "${DIR}.\$PROJECT\$PROJECT.html"

Write-Host "Input file: $inputFile"
Write-Host "Output file: $outputFile"

$browserStarted = $false
while ($true) {
    $shouldRebuild = $false

    if (-not (Test-Path $outputFile)) {
        $shouldRebuild = $true
    }
    elseif ((Get-Item $inputFile).LastWriteTime -gt (Get-Item $outputFile).LastWriteTime) {
        $shouldRebuild = $true
    }

    if ($shouldRebuild) {
        Write-Host "Rebuilding presentation..." -NoNewline
        docker run -v "${DIR}:/documents" asciidoctor/docker-asciidoctor asciidoctor-revealjs -r asciidoctor-diagram -o $PROJECT/$PROJECT.html $PROJECT/$PROJECT.adoc
        Write-Host " done."
        if (-not $browserStarted) {
            Start-Process $outputFile
            $browserStarted = $true
        }
    }

    Start-Sleep -Seconds 1
}