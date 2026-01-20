# run-nginx.ps1

param(
    [string]$Dir = (Get-Location)
)

Set-Location $Dir

Write-Host "Running Nginx for $(Get-Location): http://localhost:8080"
docker run --name "nginx" -d --rm -p 8080:80 -v "$(Get-Location):/usr/share/nginx/html:ro" nginx