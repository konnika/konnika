param(
    [string]$Name,
    [string]$IBAN,
    [string]$Amount,
    [string]$Comment,
    [string]$BIC = "",
    [string]$OutputFile = "qr.png"
)

# Prompt for missing values
if (-not $Name) {
    $Name = Read-Host "Name"
}

if (-not $IBAN) {
    $IBAN = Read-Host "IBAN"
}

if (-not $Amount) {
    $Amount = Read-Host "Amount (in Euro, e.g., 25.50)"
}

if (-not $Comment) {
    $Comment = Read-Host "Comment/Remittance Information"
}

# API Configuration
$API_BASE_URL = "epc-qr.eu"
$API_VERSION = "2"  # Version 2 recommended for SEPA area

# Build the URL with query parameters
$params = @{
    iban = $IBAN
    bname = $Name
    euro = $Amount
    info = $Comment
    ver = $API_VERSION
    type = "png"
}

# Add BIC only if provided
if ($BIC) {
    $params.bic = $BIC
}

# Build query string
$queryString = ($params.GetEnumerator() | ForEach-Object { 
    "$($_.Key)=$([System.Uri]::EscapeDataString($_.Value))" 
}) -join "&"

$url = "https://${API_BASE_URL}/?${queryString}"

# Display information
Write-Host ""
Write-Host "Generating QR code..." -ForegroundColor Cyan
Write-Host "Name: $Name"
Write-Host "IBAN: $IBAN"
Write-Host "Amount: EUR $Amount"
Write-Host "Comment: $Comment"
Write-Host ""

# Use curl.exe to download the QR code (-k flag to skip certificate validation)
& curl.exe -k $url --output $OutputFile --silent --show-error

if ($LASTEXITCODE -eq 0) {
    Write-Host "QR code saved successfully to: $OutputFile" -ForegroundColor Green
} else {
    Write-Host "Error generating QR code" -ForegroundColor Red
}
