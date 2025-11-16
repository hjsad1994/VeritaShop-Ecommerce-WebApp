# Test Brand API Endpoints
Write-Host "=== Testing Brand API ===" -ForegroundColor Cyan

# 1. Login để lấy cookies
Write-Host "`n1. Login as Admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@gmail.com"
    password = "123456"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json" `
    -SessionVariable webSession

Write-Host "Login Status: $($loginResponse.StatusCode)" -ForegroundColor Green
Write-Host "Response: $($loginResponse.Content)"

# 2. GET /api/brands - Lấy danh sách brands
Write-Host "`n2. GET /api/brands - List all brands..." -ForegroundColor Yellow
$brandsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/brands" `
    -Method GET

Write-Host "Status: $($brandsResponse.StatusCode)" -ForegroundColor Green
$brandsData = $brandsResponse.Content | ConvertFrom-Json
Write-Host "Found $($brandsData.data.brands.Count) brands"
$brandsData.data.brands | ForEach-Object { 
    Write-Host "  - $($_.name) ($($_.slug)) - Products: $($_.productCount)" 
}

# 3. GET /api/brands/:slug - Lấy brand theo slug
Write-Host "`n3. GET /api/brands/apple - Get brand by slug..." -ForegroundColor Yellow
$brandResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/brands/apple" `
    -Method GET

Write-Host "Status: $($brandResponse.StatusCode)" -ForegroundColor Green
$brandData = $brandResponse.Content | ConvertFrom-Json
Write-Host "Brand: $($brandData.data.name)"
Write-Host "Description: $($brandData.data.description)"
Write-Host "Product Count: $($brandData.data.productCount)"

# 4. GET /api/brands/:slug/products - Lấy products của brand
Write-Host "`n4. GET /api/brands/apple/products - Get products by brand..." -ForegroundColor Yellow
$productsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/brands/apple/products?page=1&limit=10" `
    -Method GET

Write-Host "Status: $($productsResponse.StatusCode)" -ForegroundColor Green
$productsData = $productsResponse.Content | ConvertFrom-Json
Write-Host "Brand: $($productsData.data.brand.name)"
Write-Host "Products: $($productsData.data.pagination.total)"
$productsData.data.products | ForEach-Object { 
    Write-Host "  - $($_.name) - $($_.finalPrice) VND" 
}

# 5. POST /api/brands - Tạo brand mới (Admin only)
Write-Host "`n5. POST /api/brands - Create new brand (Admin)..." -ForegroundColor Yellow
$newBrandBody = @{
    name = "Oppo"
    description = "Oppo Mobile"
    logo = "https://example.com/oppo-logo.png"
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/brands" `
        -Method POST `
        -Body $newBrandBody `
        -ContentType "application/json" `
        -WebSession $webSession
    
    Write-Host "Status: $($createResponse.StatusCode)" -ForegroundColor Green
    $createData = $createResponse.Content | ConvertFrom-Json
    Write-Host "Created Brand: $($createData.data.name)"
    Write-Host "Slug: $($createData.data.slug)"
    $newBrandId = $createData.data.id
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    $newBrandId = $null
}

# 6. PUT /api/brands/:id - Cập nhật brand (Admin only)
if ($newBrandId) {
    Write-Host "`n6. PUT /api/brands/$newBrandId - Update brand (Admin)..." -ForegroundColor Yellow
    $updateBrandBody = @{
        description = "Oppo Electronics - Updated"
    } | ConvertTo-Json

    try {
        $updateResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/brands/$newBrandId" `
            -Method PUT `
            -Body $updateBrandBody `
            -ContentType "application/json" `
            -WebSession $webSession
        
        Write-Host "Status: $($updateResponse.StatusCode)" -ForegroundColor Green
        $updateData = $updateResponse.Content | ConvertFrom-Json
        Write-Host "Updated Brand: $($updateData.data.name)"
        Write-Host "New Description: $($updateData.data.description)"
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }

    # 7. DELETE /api/brands/:id - Xóa brand (Admin only)
    Write-Host "`n7. DELETE /api/brands/$newBrandId - Delete brand (Admin)..." -ForegroundColor Yellow
    try {
        $deleteResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/brands/$newBrandId" `
            -Method DELETE `
            -WebSession $webSession
        
        Write-Host "Status: $($deleteResponse.StatusCode)" -ForegroundColor Green
        $deleteData = $deleteResponse.Content | ConvertFrom-Json
        Write-Host "Message: $($deleteData.message)"
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== All Brand API Tests Completed ===" -ForegroundColor Cyan
