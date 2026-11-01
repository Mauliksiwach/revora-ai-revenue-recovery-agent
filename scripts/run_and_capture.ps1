$backend = Start-Process -FilePath "npx" -ArgumentList "tsx backend/src/index.ts" -PassThru -NoNewWindow
$frontend = Start-Process -FilePath "npx" -ArgumentList "serve -s frontend/dist -l 5173" -PassThru -NoNewWindow

try {
    Write-Host "Waiting for servers to become responsive..."
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try {
            $resp = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2
            if ($resp.StatusCode -eq 200) {
                $ready = $true
                break
            }
        } catch {
            # continue waiting
        }
    }

    if (-not $ready) {
        Write-Error "Servers failed to start within 30 seconds."
        exit 1
    }

    Write-Host "Servers ready! Running screenshot capture..."
    Start-Sleep -Seconds 2
    node scripts/capture_screenshots.mjs
}
finally {
    Write-Host "Cleaning up server processes..."
    if ($backend -and -not $backend.HasExited) { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue }
    if ($frontend -and -not $frontend.HasExited) { Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue }
}
