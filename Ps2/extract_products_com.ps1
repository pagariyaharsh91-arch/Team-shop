$excelPath = "C:\Users\pagar\Desktop\Ps2\STOCK.xlsx"

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    
    $workbook = $excel.Workbooks.Open($excelPath, [System.Type]::Missing, $true)
    $worksheet = $workbook.Sheets.Item(1)
    
    $usedRange = $worksheet.UsedRange
    $rows = $usedRange.Rows.Count
    $cols = $usedRange.Columns.Count
    
    $products = @()
    $grouped = @{}
    
    # Read header
    $headers = @()
    for ($c = 1; $c -le $cols; $c++) {
        $headers += $worksheet.Cells.Item(1, $c).Value2
    }
    
    # Read data rows
    for ($r = 2; $r -le $rows; $r++) {
        $name = $worksheet.Cells.Item($r, 1).Value2
        $category = $worksheet.Cells.Item($r, 2).Value2
        $price = $worksheet.Cells.Item($r, 3).Value2
        $quantity = $worksheet.Cells.Item($r, 4).Value2
        
        if ([string]::IsNullOrWhiteSpace($name)) { continue }
        
        # Clean price
        $priceValue = 0
        if ($price) {
            $priceStr = [string]$price -replace "₹", "" | ForEach-Object { $_.Trim() }
            if ([double]::TryParse($priceStr, [ref]$priceValue)) {
                $priceValue = [double]$priceStr
            }
        }
        
        # Handle quantity
        $quantityValue = 0
        if ($quantity) {
            if ([int]::TryParse([string]$quantity, [ref]$quantityValue)) {
                $quantityValue = [int][string]$quantity
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
    
    $workbook.Close($false)
    $excel.Quit()
    
    $result | ConvertTo-Json -Depth 10
} catch {
    @{ error = $_.Exception.Message } | ConvertTo-Json
} finally {
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    [GC]::Collect()
}
