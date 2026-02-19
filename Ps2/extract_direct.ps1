$excelPath = "C:\Users\pagar\Desktop\Ps2\STOCK.xlsx"
$tempDir = [System.IO.Path]::GetTempPath() + "xlsx_temp_$(Get-Random)"
[System.IO.Directory]::CreateDirectory($tempDir) | Out-Null

try {
    # Extract xlsx as zip
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($excelPath, $tempDir)
    
    # Read sheet1.xml
    $sheetPath = "$tempDir\xl\worksheets\sheet1.xml"
    [xml]$sheet = Get-Content $sheetPath
    
    # Read sharedStrings.xml
    $stringsPath = "$tempDir\xl\sharedStrings.xml"
    [xml]$strings = Get-Content $stringsPath
    
    # Build string lookup
    $stringArray = @()
    $strings.sst.si | ForEach-Object { $stringArray += $_.t.InnerText }
    
    # Extract data
    $products = @()
    $grouped = @{}
    
    $rowNum = 0
    $sheet.worksheet.sheetData.row | ForEach-Object {
        $rowNum++
        if ($rowNum -eq 1) { return }  # Skip header
        
        $cellValues = @()
        $_.c | ForEach-Object {
            $cellRef = $_.r
            if ($_.t -eq "s") {
                $idx = [int]$_.v
                $cellValues += $stringArray[$idx]
            } else {
                $cellValues += $_.v
            }
        }
        
        if ($cellValues.Count -ge 1 -and $cellValues[0]) {
            $name = $cellValues[0]
            $category = if ($cellValues.Count -gt 1) { $cellValues[1] } else { "" }
            $price = if ($cellValues.Count -gt 2) { $cellValues[2] } else { 0 }
            $quantity = if ($cellValues.Count -gt 3) { $cellValues[3] } else { 0 }
            
            # Clean price
            $priceVal = 0
            if ($price) {
                $priceStr = [string]$price -replace "₹", "" | ForEach-Object { $_.Trim() }
                if ([double]::TryParse($priceStr, [ref]$priceVal)) {
                    $priceVal = [double]$priceStr
                }
            }
            
            # Clean quantity
            $qtyVal = 0
            if ($quantity -and $quantity -ne "") {
                if ([int]::TryParse([string]$quantity, [ref]$qtyVal)) {
                    $qtyVal = [int][string]$quantity
                }
            }
            
            $product = @{
                name = [string]$name
                category = [string]$category
                price = $priceVal
                quantity = $qtyVal
            }
            
            $products += $product
            
            $catKey = [string]$category
            if (-not $grouped.ContainsKey($catKey)) {
                $grouped[$catKey] = @()
            }
            $grouped[$catKey] += $product
        }
    }
    
    $result = @{
        products = $products
        grouped = $grouped
        total_products = $products.Count
        total_categories = $grouped.Count
    }
    
    $result | ConvertTo-Json -Depth 100
} catch {
    @{ error = $_.Exception.Message } | ConvertTo-Json
} finally {
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
