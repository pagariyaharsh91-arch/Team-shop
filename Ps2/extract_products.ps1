Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.Xml.Linq

$excelPath = "C:\Users\pagar\Desktop\Ps2\STOCK.xlsx"

function Read-Excel {
    param([string]$Path)
    
    # Open the xlsx file as a zip
    $zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
    
    # Read the first worksheet
    $worksheetEntry = $zip.Entries | Where-Object { $_.Name -match "sheet1.xml" } | Select-Object -First 1
    $worksheetStream = $worksheetEntry.Open()
    $reader = New-Object System.IO.StreamReader($worksheetStream)
    $xmlContent = $reader.ReadToEnd()
    $reader.Close()
    $worksheetStream.Close()
    
    # Read the shared strings file
    $stringsEntry = $zip.Entries | Where-Object { $_.Name -eq "sharedStrings.xml" }
    $stringsStream = $stringsEntry.Open()
    $stringsReader = New-Object System.IO.StreamReader($stringsStream)
    $stringsXml = $stringsReader.ReadToEnd()
    $stringsReader.Close()
    $stringsStream.Close()
    
    $zip.Dispose()
    
    # Parse XML
    [xml]$worksheet = $xmlContent
    [xml]$strings = $stringsXml
    
    # Extract shared strings
    $sharedStrings = @()
    $strings.sst.si | ForEach-Object { $sharedStrings += $_.t.InnerText }
    
    # Extract cell values
    $rows = @()
    $worksheet.worksheet.sheetData.row | ForEach-Object {
        $row = @()
        $_.c | ForEach-Object {
            $cell = $_
            if ($cell.t -eq "s") {
                # String reference
                $stringIndex = [int]$cell.v
                $row += $sharedStrings[$stringIndex]
            } elseif ($cell.v) {
                $row += $cell.v
            } else {
                $row += ""
            }
        }
        $rows += ,$row
    }
    
    return $rows
}

try {
    $rows = Read-Excel -Path $excelPath
    
    if ($rows.Count -gt 0) {
        $headers = $rows[0]
        $products = @()
        $grouped = @{}
        
        for ($i = 1; $i -lt $rows.Count; $i++) {
            $row = $rows[$i]
            
            $name = if ($row.Count -gt 0) { $row[0] } else { "" }
            $category = if ($row.Count -gt 1) { $row[1] } else { "" }
            $price = if ($row.Count -gt 2) { $row[2] } else { "" }
            $quantity = if ($row.Count -gt 3) { $row[3] } else { "" }
            
            if ([string]::IsNullOrWhiteSpace($name)) { continue }
            
            # Clean price
            if ($price -match "₹") {
                $price = $price -replace "₹", "" | ForEach-Object { $_.Trim() }
            }
            $priceValue = 0
            if (![string]::IsNullOrWhiteSpace($price)) {
                if ([double]::TryParse($price, [ref]$priceValue)) {
                    $priceValue = [double]$price
                }
            }
            
            # Handle quantity
            $quantityValue = 0
            if (![string]::IsNullOrWhiteSpace($quantity)) {
                if ([int]::TryParse($quantity, [ref]$quantityValue)) {
                    $quantityValue = [int]$quantity
                }
            }
            
            $product = @{
                name = [string]$name
                category = [string]$category
                price = $priceValue
                quantity = $quantityValue
            }
            
            $products += $product
            
            $catKey = [string]$category
            if (-not $grouped.ContainsKey($catKey)) {
                $grouped[$catKey] = @()
            }
            $grouped[$catKey] += $product
        }
        
        $result = @{
            products = $products
            grouped = $grouped
            total_products = $products.Count
            total_categories = $grouped.Count
        }
        
        $result | ConvertTo-Json -Depth 10
    }
} catch {
    @{ error = $_.Exception.Message } | ConvertTo-Json
}
