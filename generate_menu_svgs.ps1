# PowerShell generator for 92 distinct dish SVGs in images/menu/
$ErrorActionPreference = "Stop"
$outDir = "c:\Users\khale\Downloads\مطعم\images\menu"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$menuJsPath = "c:\Users\khale\Downloads\مطعم\menu.js"
$content = [System.IO.File]::ReadAllText($menuJsPath, [System.Text.Encoding]::UTF8)

# Parse items from menu.js
$regex = [regex]'id:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)",[\s\S]*?name:\s*"([^"]+)",'
$matches = $regex.Matches($content)
Write-Output "Parsed $($matches.Count) items from menu.js"

$categoryThemes = @{
  "sandwiches" = @{ bg = "#FBF4ED"; border = "#E8D5C4"; badge = "#C8553D"; badgeText = "#FFFDF9"; accent = "#C8553D" }
  "burgers"    = @{ bg = "#FDF6EA"; border = "#EAD9C0"; badge = "#B85D19"; badgeText = "#FFFDF9"; accent = "#D4772C" }
  "meals"      = @{ bg = "#FAF4EE"; border = "#E5D2C2"; badge = "#9B3822"; badgeText = "#FFFDF9"; accent = "#B3472F" }
  "appetizers" = @{ bg = "#F8F6EE"; border = "#DFDEC6"; badge = "#7A8A4C"; badgeText = "#FFFDF9"; accent = "#8A9A5B" }
  "manakish"   = @{ bg = "#FCF6ED"; border = "#E8DCBE"; badge = "#B8860B"; badgeText = "#FFFDF9"; accent = "#D4A338" }
  "salads"     = @{ bg = "#F5F8F0"; border = "#D2DFCA"; badge = "#557A3E"; badgeText = "#FFFDF9"; accent = "#6B8F52" }
  "crepes"     = @{ bg = "#FCF5F2"; border = "#EBD8D0"; badge = "#A0522D"; badgeText = "#FFFDF9"; accent = "#B8653F" }
  "drinks"     = @{ bg = "#F3F7F8"; border = "#CDE0E4"; badge = "#2E8B99"; badgeText = "#FFFDF9"; accent = "#3BA3B2" }
  "desserts"   = @{ bg = "#FCF4F6"; border = "#EBD2D9"; badge = "#A84364"; badgeText = "#FFFDF9"; accent = "#C25779" }
}

function Get-DishSvgSnippet($id, $cat, $name) {
  # Return category/dish-specific graphic shapes
  if ($cat -eq "burgers") {
    return @"
    <g transform="translate(300, 210)">
      <!-- Burger bun shadow -->
      <ellipse cx="0" cy="85" rx="140" ry="24" fill="#E8D5BE" opacity="0.6"/>
      <!-- Bottom Bun -->
      <path d="M-115,55 Q0,75 115,55 Q125,75 110,80 Q0,92 -110,80 Q-125,75 -115,55 Z" fill="#DDB075"/>
      <!-- Sauce layer -->
      <path d="M-110,50 Q-60,58 -20,52 Q40,62 110,52" stroke="#E63946" stroke-width="8" stroke-linecap="round"/>
      <!-- Burger Patty -->
      <rect x="-122" y="28" width="244" height="26" rx="13" fill="#58311B"/>
      <path d="M-110,38 L110,38" stroke="#3D2010" stroke-width="3" stroke-dasharray="12,10"/>
      <!-- Melted Cheddar Cheese -->
      <path d="M-125,26 L-80,26 L-70,48 L-55,26 L10,26 L25,49 L40,26 L125,26 Q128,34 115,36 L-115,36 Z" fill="#F4A226"/>
      <!-- Lettuce -->
      <path d="M-128,18 Q-105,4 -80,18 Q-55,2 -30,18 Q0,0 30,18 Q60,3 90,18 Q115,5 128,18 Q120,28 110,24 Q-10,32 -128,18 Z" fill="#70A045"/>
      <!-- Tomato slices -->
      <ellipse cx="-45" cy="8" rx="42" ry="12" fill="#D63031"/>
      <ellipse cx="45" cy="8" rx="42" ry="12" fill="#D63031"/>
      <!-- Top Bun -->
      <path d="M-120,6 C-125,-75 125,-75 120,6 C100,14 -100,14 -120,6 Z" fill="#E8BE84"/>
      <!-- Sesame seeds -->
      <ellipse cx="-40" cy="-35" rx="3.5" ry="2" fill="#FFF2DC" transform="rotate(-15,-40,-35)"/>
      <ellipse cx="-10" cy="-48" rx="3.5" ry="2" fill="#FFF2DC" transform="rotate(5,-10,-48)"/>
      <ellipse cx="25" cy="-42" rx="3.5" ry="2" fill="#FFF2DC" transform="rotate(25,25,-42)"/>
      <ellipse cx="60" cy="-28" rx="3.5" ry="2" fill="#FFF2DC" transform="rotate(-10,60,-28)"/>
      <ellipse cx="-70" cy="-20" rx="3.5" ry="2" fill="#FFF2DC" transform="rotate(35,-70,-20)"/>
      <ellipse cx="0" cy="-25" rx="3.5" ry="2" fill="#FFF2DC"/>
    </g>
"@
  } elseif ($cat -eq "sandwiches") {
    # Distinguish falafel, shawarma, halloumi, labneh, fajita, fries
    $wrapColor = if ($name -match "صاج|عربي") { "#E2BA84" } else { "#F1D2A4" }
    $fillingColor = if ($name -match "دجاج|طاووق|كريسبي|زنجر") { "#F4A261" } elseif ($name -match "فلافل|حمص|فول") { "#9A7B56" } elseif ($name -match "حلوم|لبنة|جبنة") { "#FFFFFF" } else { "#6B3E26" }
    return @"
    <g transform="translate(300, 205)">
      <!-- Plate shadow -->
      <ellipse cx="0" cy="90" rx="160" ry="26" fill="#E2D5C4" opacity="0.6"/>
      <!-- Saj/Pita Wrap Cut in Half (left half angled) -->
      <g transform="rotate(-14, -60, 20)">
        <ellipse cx="-60" cy="20" rx="35" ry="58" fill="#FBF3E4" stroke="#D1A76E" stroke-width="4"/>
        <!-- Inner filling cross-section -->
        <ellipse cx="-60" cy="20" rx="28" ry="50" fill="$fillingColor"/>
        <path d="M-75,0 Q-55,-15 -45,5 Q-40,25 -65,35" fill="#749B45" opacity="0.9"/>
        <circle cx="-62" cy="12" r="7" fill="#E63946"/>
        <circle cx="-54" cy="28" r="6" fill="#F4A226"/>
        <ellipse cx="-66" cy="-8" rx="5" ry="8" fill="#FFFFFF" opacity="0.85"/>
        <!-- Bread body roll -->
        <path d="M-60,-38 C-12,-48 30,-30 40,20 C45,65 0,72 -60,78 Z" fill="$wrapColor" stroke="#C89655" stroke-width="3"/>
        <path d="M-15,-25 Q15,0 5,45" stroke="#9A6930" stroke-width="2.5" fill="none" opacity="0.5"/>
        <path d="M-35,-15 Q-5,10 -15,55" stroke="#9A6930" stroke-width="2.5" fill="none" opacity="0.5"/>
      </g>
      <!-- Saj Wrap Right half -->
      <g transform="rotate(18, 55, 30)">
        <path d="M30,-40 C90,-35 125,-10 120,40 C115,80 75,85 25,75 Z" fill="$wrapColor" stroke="#C89655" stroke-width="3"/>
        <ellipse cx="25" cy="18" rx="28" ry="52" fill="$fillingColor"/>
        <circle cx="28" cy="12" r="8" fill="#749B45"/>
        <circle cx="20" cy="30" r="6" fill="#FFFFFF"/>
        <circle cx="34" cy="-5" r="7" fill="#E63946"/>
      </g>
      <!-- Garnish mint & pickles on the side -->
      <path d="M-115,75 Q-95,60 -80,75 Q-95,90 -115,75 Z" fill="#588157"/>
      <ellipse cx="-130" cy="80" rx="14" ry="7" fill="#8A9A5B" transform="rotate(20,-130,80)"/>
    </g>
"@
  } elseif ($cat -eq "manakish") {
    $topping = if ($name -match "زعتر") { "#4A5D33" } elseif ($name -match "لحمة") { "#7A3E26" } elseif ($name -match "كشك") { "#B35A38" } else { "#FFF8DE" }
    return @"
    <g transform="translate(300, 205)">
      <ellipse cx="0" cy="85" rx="160" ry="24" fill="#E2D5C4" opacity="0.6"/>
      <!-- Wooden baker board -->
      <ellipse cx="0" cy="25" rx="165" ry="85" fill="#D9A76A" stroke="#B88648" stroke-width="4"/>
      <!-- Oval Manousheh Dough -->
      <ellipse cx="0" cy="20" rx="145" ry="70" fill="#F4D39B" stroke="#D9A55B" stroke-width="4"/>
      <!-- Crust rim -->
      <ellipse cx="0" cy="20" rx="128" ry="56" fill="$topping"/>
      <!-- Baked blisters and oil sheen -->
      <ellipse cx="-45" cy="5" rx="20" ry="10" fill="#382215" opacity="0.25"/>
      <ellipse cx="50" cy="25" rx="16" ry="8" fill="#382215" opacity="0.25"/>
      <circle cx="-10" cy="32" r="3.5" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="20" cy="10" r="3" fill="#FFFFFF" opacity="0.7"/>
      <circle cx="65" cy="5" r="3.5" fill="#FFFFFF" opacity="0.7"/>
    </g>
"@
  } elseif ($cat -eq "meals") {
    return @"
    <g transform="translate(300, 205)">
      <!-- Oval Serving Platter -->
      <ellipse cx="0" cy="80" rx="170" ry="30" fill="#E2D5C4" opacity="0.5"/>
      <ellipse cx="0" cy="20" rx="170" ry="85" fill="#FFFFFF" stroke="#E2D5C4" stroke-width="4"/>
      <ellipse cx="0" cy="20" rx="145" ry="70" fill="#F9F6F0"/>
      <!-- Grilled meat/chicken skewers & fries arrangement -->
      <!-- Fries stack on the left -->
      <rect x="-120" y="5" width="45" height="10" rx="3" fill="#F4A226" transform="rotate(-25,-120,5)"/>
      <rect x="-110" y="20" width="45" height="10" rx="3" fill="#F4A226" transform="rotate(-10,-110,20)"/>
      <rect x="-125" y="32" width="48" height="10" rx="3" fill="#F4A226" transform="rotate(15,-125,32)"/>
      <!-- Grilled skewers in center -->
      <line x1="-50" y1="-25" x2="90" y2="45" stroke="#9E6B38" stroke-width="4"/>
      <circle cx="-25" cy="-10" r="14" fill="#75391D"/>
      <circle cx="5" cy="5" r="14" fill="#75391D"/>
      <circle cx="35" cy="20" r="14" fill="#75391D"/>
      <circle cx="65" cy="35" r="14" fill="#75391D"/>
      <!-- Garlic toum small bowl on top right -->
      <ellipse cx="75" cy="-20" rx="30" ry="18" fill="#ECE5DA" stroke="#D5C7B5" stroke-width="2"/>
      <ellipse cx="75" cy="-22" rx="24" ry="13" fill="#FFFFFF"/>
      <!-- Pickles & grilled tomato -->
      <circle cx="-10" cy="45" r="16" fill="#D63031"/>
      <ellipse cx="35" cy="52" rx="12" ry="6" fill="#8A9A5B"/>
    </g>
"@
  } elseif ($cat -eq "appetizers") {
    return @"
    <g transform="translate(300, 205)">
      <ellipse cx="0" cy="85" rx="150" ry="24" fill="#E2D5C4" opacity="0.5"/>
      <!-- Bowl or Basket -->
      <ellipse cx="0" cy="30" rx="135" ry="70" fill="#FFFFFF" stroke="#E2D5C4" stroke-width="4"/>
      <!-- Golden crispy items (Fries / Sambousek / Kibbeh / Mozzarella balls) -->
      <g transform="translate(0, 10)">
        <rect x="-65" y="-35" width="22" height="75" rx="5" fill="#F4A226" transform="rotate(-20,-65,-35)"/>
        <rect x="-35" y="-45" width="22" height="85" rx="5" fill="#E79215" transform="rotate(-5,-35,-45)"/>
        <rect x="-5" y="-50" width="22" height="90" rx="5" fill="#F4A226" transform="rotate(8,-5,-50)"/>
        <rect x="25" y="-40" width="22" height="80" rx="5" fill="#E79215" transform="rotate(22,25,-40)"/>
        <rect x="55" y="-30" width="22" height="70" rx="5" fill="#F4A226" transform="rotate(35,55,-30)"/>
        <!-- Sauce ramekin in front -->
        <ellipse cx="0" cy="45" rx="42" ry="22" fill="#E8DEC8" stroke="#D4C3A6" stroke-width="2"/>
        <ellipse cx="0" cy="43" rx="34" ry="16" fill="#C8553D"/>
      </g>
    </g>
"@
  } elseif ($cat -eq "salads") {
    return @"
    <g transform="translate(300, 205)">
      <ellipse cx="0" cy="85" rx="155" ry="25" fill="#E2D5C4" opacity="0.5"/>
      <!-- Ceramic Salad Bowl -->
      <ellipse cx="0" cy="25" rx="145" ry="75" fill="#FFFFFF" stroke="#E2D5C4" stroke-width="4"/>
      <ellipse cx="0" cy="22" rx="130" ry="62" fill="#F2EFE8"/>
      <!-- Fresh Greens (Parsley / Lettuce / Mint) -->
      <path d="M-80,0 Q-60,-25 -40,0 Q-20,-20 0,0 Q20,-25 40,0 Q60,-20 80,0 Q60,30 0,40 Q-60,30 -80,0 Z" fill="#6B8F52"/>
      <!-- Red Diced Tomatoes -->
      <rect x="-45" y="5" width="14" height="12" rx="3" fill="#D63031"/>
      <rect x="15" y="-5" width="14" height="12" rx="3" fill="#D63031"/>
      <rect x="-10" y="22" width="14" height="12" rx="3" fill="#D63031"/>
      <rect x="42" y="18" width="14" height="12" rx="3" fill="#D63031"/>
      <!-- Crispy Pita Squares (for Fattoush) / Chickpeas (for Hummus) -->
      <polygon points="-60,18 -45,10 -48,26" fill="#DDA15E"/>
      <polygon points="28,25 42,15 40,32" fill="#DDA15E"/>
      <circle cx="-15" cy="-2" r="7" fill="#FCEADE"/>
      <circle cx="5" cy="8" r="7" fill="#FCEADE"/>
      <!-- Olive Oil gloss -->
      <path d="M-30,10 Q0,25 30,5" stroke="#C4A832" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>
    </g>
"@
  } elseif ($cat -eq "crepes") {
    return @"
    <g transform="translate(300, 205)">
      <ellipse cx="0" cy="85" rx="150" ry="24" fill="#E2D5C4" opacity="0.5"/>
      <ellipse cx="0" cy="25" rx="145" ry="75" fill="#FFFFFF" stroke="#E2D5C4" stroke-width="4"/>
      <!-- Folded Crepe Triangle -->
      <polygon points="0,-40 -110,45 105,45" fill="#E8C388" stroke="#D4A764" stroke-width="3"/>
      <!-- Chocolate Drizzle Lines -->
      <path d="M-80,30 Q-50,-10 0,25 Q50,-5 80,30" stroke="#4A2810" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M-60,40 Q-20,10 20,40" stroke="#4A2810" stroke-width="5" fill="none" stroke-linecap="round"/>
      <!-- Strawberry slices & Banana -->
      <circle cx="-35" cy="15" r="14" fill="#E63946"/>
      <circle cx="-35" cy="15" r="8" fill="#F4A261"/>
      <circle cx="35" cy="20" r="14" fill="#FFF2DC"/>
      <circle cx="0" cy="35" r="13" fill="#E63946"/>
    </g>
"@
  } elseif ($cat -eq "drinks") {
    return @"
    <g transform="translate(300, 200)">
      <ellipse cx="0" cy="90" rx="80" ry="18" fill="#D5E4E8" opacity="0.5"/>
      <!-- Glass or Cup with Refreshing Beverage -->
      <path d="M-50,-70 L-40,75 Q0,90 40,75 L50,-70 Z" fill="#E8F4F8" stroke="#B0D2DC" stroke-width="3" opacity="0.85"/>
      <!-- Liquid Fill -->
      <path d="M-44,-35 L-37,70 Q0,82 37,70 L44,-35 Q0,-25 -44,-35 Z" fill="#E76F51" opacity="0.9"/>
      <!-- Ice cubes floating -->
      <rect x="-22" y="-15" width="22" height="22" rx="4" fill="#FFFFFF" opacity="0.75" transform="rotate(15,-11,-4)"/>
      <rect x="5" y="10" width="20" height="20" rx="4" fill="#FFFFFF" opacity="0.7" transform="rotate(-20,15,20)"/>
      <!-- Lemon slice on rim -->
      <circle cx="-48" cy="-65" r="22" fill="#F4A226"/>
      <circle cx="-48" cy="-65" r="18" fill="#FFE382"/>
      <!-- Paper Straw -->
      <line x1="20" y1="-85" x2="-15" y2="65" stroke="#C8553D" stroke-width="7" stroke-linecap="round"/>
      <!-- Fresh Mint Leaves -->
      <path d="M-30,-75 Q-15,-95 -10,-75 Q-15,-60 -30,-75 Z" fill="#52796F"/>
    </g>
"@
  } elseif ($cat -eq "desserts") {
    return @"
    <g transform="translate(300, 205)">
      <ellipse cx="0" cy="85" rx="145" ry="24" fill="#E2D5C4" opacity="0.5"/>
      <!-- Round Serving Plate -->
      <ellipse cx="0" cy="25" rx="140" ry="70" fill="#FFFFFF" stroke="#E2D5C4" stroke-width="4"/>
      <!-- Kunafa/Sweet golden crust -->
      <ellipse cx="0" cy="20" rx="115" ry="50" fill="#E76F51" stroke="#D45A3C" stroke-width="3"/>
      <!-- Cheese/Cream core peaking -->
      <ellipse cx="0" cy="18" rx="85" ry="34" fill="#FCEADE"/>
      <!-- Crushed Pistachio topping in center & rim -->
      <ellipse cx="0" cy="16" rx="40" ry="18" fill="#52796F"/>
      <circle cx="-18" cy="14" r="3" fill="#84A98C"/>
      <circle cx="15" cy="18" r="3" fill="#84A98C"/>
      <circle cx="2" cy="12" r="2.5" fill="#84A98C"/>
      <!-- Glossy Sugar Syrup Droplets -->
      <circle cx="-45" cy="22" r="5" fill="#FFEAA7" opacity="0.85"/>
      <circle cx="50" cy="20" r="4.5" fill="#FFEAA7" opacity="0.85"/>
    </g>
"@
  } else {
    return @"
    <g transform="translate(300, 205)">
      <ellipse cx="0" cy="85" rx="140" ry="24" fill="#E2D5C4" opacity="0.5"/>
      <ellipse cx="0" cy="25" rx="135" ry="65" fill="#FFFFFF" stroke="#E2D5C4" stroke-width="4"/>
      <circle cx="0" cy="15" r="42" fill="#C8553D"/>
      <text x="0" y="25" text-anchor="middle" font-size="32" fill="#FFFFFF">🍽️</text>
    </g>
"@
  }
}

$createdCount = 0
foreach ($m in $matches) {
  $id = $m.Groups[1].Value
  $cat = $m.Groups[2].Value
  $name = $m.Groups[3].Value

  $theme = if ($categoryThemes.ContainsKey($cat)) { $categoryThemes[$cat] } else { $categoryThemes["sandwiches"] }
  $dishSnippet = Get-DishSvgSnippet $id $cat $name

  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450" dir="rtl">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="$($theme.bg)"/>
    </radialGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#3B2A20" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="600" height="450" fill="url(#bgGrad)"/>
  <rect x="12" y="12" width="576" height="426" rx="20" fill="none" stroke="$($theme.border)" stroke-width="1.5"/>

  <!-- Subtle Decorative Corner Accents -->
  <circle cx="36" cy="36" r="4" fill="$($theme.accent)" opacity="0.35"/>
  <circle cx="564" cy="36" r="4" fill="$($theme.accent)" opacity="0.35"/>

  <!-- Main Food Graphic -->
  <g filter="url(#softShadow)">
    $dishSnippet
  </g>

  <!-- Arabic Dish Title Badge (Calm, legible, elegant) -->
  <g transform="translate(300, 400)">
    <rect x="-190" y="-22" width="380" height="40" rx="20" fill="#FFFFFF" stroke="$($theme.border)" stroke-width="1.5"/>
    <text x="0" y="5" text-anchor="middle" font-family="'Cairo', system-ui, sans-serif" font-weight="700" font-size="17" fill="#3B2A20">$name</text>
  </g>

  <!-- Small Brand Watermark Top Left -->
  <text x="36" y="44" font-family="'Cairo', system-ui, sans-serif" font-weight="600" font-size="12" fill="#7A685D">سناك الضيعة • طرابلس</text>
</svg>
"@

  $fileName = "$id.svg"
  $filePath = Join-Path $outDir $fileName
  [System.IO.File]::WriteAllText($filePath, $svg, [System.Text.Encoding]::UTF8)
  $createdCount++
}

Write-Output "Successfully generated $createdCount distinct SVGs in $outDir"

