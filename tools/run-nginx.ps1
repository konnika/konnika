# run-nginx.ps1

param(
    [string]$Dir = (Get-Location)
)

Push-Location $Dir
try {
    $PWD_LINUX = (Get-Location).Path -replace '\\', '/'
    $PWD_LINUX = $PWD_LINUX -replace 'c:/', "/mnt/c/"

    Write-Host "Running Nginx for $(Get-Location): http://localhost:8080"
    wsl docker run --name "nginx" -d --rm -p 8080:80 -v "${PWD_LINUX}:/usr/share/nginx/html:ro" nginx
}
finally {
    Pop-Location
}