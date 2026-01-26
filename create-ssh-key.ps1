ssh-keygen -t ed25519 -a 100 -C "andreas.konrad@gmx.net" -f ".\id_ed25519"

Write-Host "SSH key pair generated: ./id_ed25519 (private) and ./id_ed25519.pub (public)"