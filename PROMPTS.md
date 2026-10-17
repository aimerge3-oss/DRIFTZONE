# Промпты для фото машин

Каждое фото сохраняй как `img/cars_src/<id>.png`, затем запусти `python tools/prepare_photos.py <id>` — скрипт вырежет фон и положит `img/cars/<id>.webp`.

**Требования к картинке:**
- машина строго **сбоку**, смотрит **вправо**, видна целиком
- фон любой однотонный (скрипт вырежет сам)
- пропорции примерно **2.4 : 1** (например 1200×500), машина занимает почти всю ширину
- одинаковый ракурс и свет у всех машин — так коллекция выглядит цельно

**Шаблон промпта:**

```
Photorealistic studio photo of a <CAR>, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, no text, no people, no reflections on floor, high detail, 3:1 wide composition
```

| id (имя файла) | Машина | Промпт |
|---|---|---|
| `vaz2101.png` | ВАЗ-2101 | Photorealistic studio photo of a **ВАЗ-2101**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `moskvich412.png` | Москвич-412 | Photorealistic studio photo of a **Москвич-412**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `vaz2106.png` | ВАЗ-2106 | Photorealistic studio photo of a **ВАЗ-2106**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `vaz2107.png` | ВАЗ-2107 | Photorealistic studio photo of a **ВАЗ-2107**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `vaz2109.png` | ВАЗ-2109 | Photorealistic studio photo of a **ВАЗ-2109**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `priora.png` | Лада Приора | Photorealistic studio photo of a **Лада Приора**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `niva.png` | Лада Нива | Photorealistic studio photo of a **Лада Нива**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `volga24.png` | ГАЗ-24 Волга | Photorealistic studio photo of a **ГАЗ-24 Волга**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `aurus.png` | Aurus Senat | Photorealistic studio photo of a **Aurus Senat**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `corolla.png` | Toyota Corolla E110 | Photorealistic studio photo of a **Toyota Corolla E110**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `markii.png` | Toyota Mark II JZX100 | Photorealistic studio photo of a **Toyota Mark II JZX100**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `ae86.png` | Toyota AE86 Trueno | Photorealistic studio photo of a **Toyota AE86 Trueno**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `wrxsti.png` | Subaru Impreza WRX STI | Photorealistic studio photo of a **Subaru Impreza WRX STI**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `evo9.png` | Mitsubishi Lancer Evo IX | Photorealistic studio photo of a **Mitsubishi Lancer Evo IX**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `s15.png` | Nissan Silvia S15 | Photorealistic studio photo of a **Nissan Silvia S15**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `rx7.png` | Mazda RX-7 FD | Photorealistic studio photo of a **Mazda RX-7 FD**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `supra.png` | Toyota Supra A80 | Photorealistic studio photo of a **Toyota Supra A80**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `nsx.png` | Honda NSX NA1 | Photorealistic studio photo of a **Honda NSX NA1**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `gtr35.png` | Nissan GT-R R35 | Photorealistic studio photo of a **Nissan GT-R R35**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `lfa.png` | Lexus LFA | Photorealistic studio photo of a **Lexus LFA**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `golf2.png` | Volkswagen Golf II | Photorealistic studio photo of a **Volkswagen Golf II**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `e36.png` | BMW 3 E36 | Photorealistic studio photo of a **BMW 3 E36**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `w124.png` | Mercedes-Benz W124 | Photorealistic studio photo of a **Mercedes-Benz W124**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `golfgti.png` | Volkswagen Golf GTI | Photorealistic studio photo of a **Volkswagen Golf GTI**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `m3e46.png` | BMW M3 E46 | Photorealistic studio photo of a **BMW M3 E46**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `m3e30.png` | BMW M3 E30 | Photorealistic studio photo of a **BMW M3 E30**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `m5f90.png` | BMW M5 F90 | Photorealistic studio photo of a **BMW M5 F90**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `rs6.png` | Audi RS6 Avant | Photorealistic studio photo of a **Audi RS6 Avant**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `g63.png` | Mercedes-AMG G63 | Photorealistic studio photo of a **Mercedes-AMG G63**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `p911ts.png` | Porsche 911 Turbo S | Photorealistic studio photo of a **Porsche 911 Turbo S**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `amgone.png` | Mercedes-AMG ONE | Photorealistic studio photo of a **Mercedes-AMG ONE**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `fiat500.png` | Fiat 500 (1957) | Photorealistic studio photo of a **Fiat 500 (1957)**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `giuliaqv.png` | Alfa Romeo Giulia QV | Photorealistic studio photo of a **Alfa Romeo Giulia QV**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `mc20.png` | Maserati MC20 | Photorealistic studio photo of a **Maserati MC20**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `huracan.png` | Lamborghini Huracán | Photorealistic studio photo of a **Lamborghini Huracán**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `svj.png` | Lamborghini Aventador SVJ | Photorealistic studio photo of a **Lamborghini Aventador SVJ**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `f40.png` | Ferrari F40 | Photorealistic studio photo of a **Ferrari F40**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `laferrari.png` | Ferrari LaFerrari | Photorealistic studio photo of a **Ferrari LaFerrari**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `crownvic.png` | Ford Crown Victoria | Photorealistic studio photo of a **Ford Crown Victoria**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `wrangler.png` | Jeep Wrangler | Photorealistic studio photo of a **Jeep Wrangler**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `camaro.png` | Chevrolet Camaro SS | Photorealistic studio photo of a **Chevrolet Camaro SS**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `mustang67.png` | Ford Mustang 1967 | Photorealistic studio photo of a **Ford Mustang 1967**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `hellcat.png` | Dodge Challenger Hellcat | Photorealistic studio photo of a **Dodge Challenger Hellcat**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `plaid.png` | Tesla Model S Plaid | Photorealistic studio photo of a **Tesla Model S Plaid**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `c8.png` | Chevrolet Corvette C8 | Photorealistic studio photo of a **Chevrolet Corvette C8**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `viper.png` | Dodge Viper ACR | Photorealistic studio photo of a **Dodge Viper ACR**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `fordgt.png` | Ford GT | Photorealistic studio photo of a **Ford GT**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `mclarenf1.png` | McLaren F1 | Photorealistic studio photo of a **McLaren F1**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `jesko.png` | Koenigsegg Jesko | Photorealistic studio photo of a **Koenigsegg Jesko**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `chiron.png` | Bugatti Chiron | Photorealistic studio photo of a **Bugatti Chiron**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `vestasport.png` | Лада Веста Sport | Photorealistic studio photo of a **Лада Веста Sport**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `civictyper.png` | Honda Civic Type R | Photorealistic studio photo of a **Honda Civic Type R**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `r34.png` | Nissan Skyline GT-R R34 | Photorealistic studio photo of a **Nissan Skyline GT-R R34**, exact side profile view, car facing right, entire car visible, plain white background, no text |


# Промпты для фото деталей

Фото сохраняй как `img/parts_src/<id>.png`, затем `python tools/prepare_photos.py parts` — фон вырежется, результат ляжет в `img/parts/<id>.webp`. Пока фото нет, в игре стоят эмодзи.

**Требования:** деталь целиком, по центру, квадратный кадр (1:1), однотонный светлый фон, тот же студийный свет, что у машин.

| id (имя файла) | Деталь | Промпт |
|---|---|---|
| `engine.png` | Двигатель | Photorealistic studio product photo of **a high-performance car engine block (V8 style) with intake manifold**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |
| `turbo.png` | Турбина | Photorealistic studio product photo of **a car turbocharger with polished compressor housing**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |
| `gearbox.png` | КПП | Photorealistic studio product photo of **a car manual gearbox / transmission unit**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |
| `exhaust.png` | Выхлоп | Photorealistic studio product photo of **a sports car exhaust system with muffler and chrome tips**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |
| `suspension.png` | Подвеска | Photorealistic studio product photo of **a car coilover suspension strut with red spring**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |
| `wheels.png` | Диски и шины | Photorealistic studio product photo of **a sports car wheel: alloy rim with tire, side view**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |
| `brakes.png` | Тормоза | Photorealistic studio product photo of **a big brake kit: drilled brake disc with red caliper**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |
| `bodykit.png` | Обвес | Photorealistic studio product photo of **a carbon fiber car rear spoiler wing**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |

# Промпты для секретных машин (класс X)

Сохраняй как `img/cars_src/<id>.png`, затем `python tools/prepare_photos.py <id>` — как обычные машины.

| id (имя файла) | Машина | Промпт |
|---|---|---|
| `marussia.png` | Marussia B2 | Photorealistic studio photo of a **Marussia B2**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `grgt3.png` | Toyota GR GT3 Concept | Photorealistic studio photo of a **Toyota GR GT3 Concept**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `p918.png` | Porsche 918 Spyder | Photorealistic studio photo of a **Porsche 918 Spyder**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `zondar.png` | Pagani Zonda R | Photorealistic studio photo of a **Pagani Zonda R**, exact side profile view, car facing right, entire car visible, plain white background, no text |
| `tuatara.png` | SSC Tuatara | Photorealistic studio photo of a **SSC Tuatara**, exact side profile view, car facing right, entire car visible, plain white background, no text |

## Новые машины (добавлены позже)

Все — в **глянцевом белом** цвете (Glossy White / Pure White): по светлому кузову потом строится маска перекраски (`python tools/paint_masks.py <id>`). Тёмные машины перекрашивать нельзя — маска выходит пятнами.

| id (имя файла) | Машина | Промпт |
|---|---|---|
| `cresta.png` | Toyota Cresta JZX100 | Photorealistic studio photo of a **1999 Toyota Cresta JZX100 Roulant G sedan in glossy pearl white**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `polo.png` | Volkswagen Polo (лифтбек 2020, для России) | Photorealistic studio photo of a **2021 Volkswagen Polo liftback (Russian market, Skoda Rapid based) in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `rs7.png` | Audi RS7 Sportback Performance | Photorealistic studio photo of a **2024 Audi RS7 Sportback Performance (C8 facelift) in glossy Glacier White metallic**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `urus.png` | Lamborghini Urus SE | Photorealistic studio photo of a **2025 Lamborghini Urus SE in glossy Bianco Monocerus white**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, no text, no people, no reflections on floor, high detail, 3:1 wide composition |


## Новые машины релизного обновления (19 шт., белые — под перекраску)
| id (имя файла) | Машина | Промпт |
|---|---|---|
| `jolion.png` | Haval Jolion | Photorealistic studio photo of a **2024 Haval Jolion compact SUV in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `tiggo7.png` | Chery Tiggo 7 Pro Max | Photorealistic studio photo of a **2024 Chery Tiggo 7 Pro Max SUV in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `monjaro.png` | Geely Monjaro | Photorealistic studio photo of a **2024 Geely Monjaro SUV in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `bydhan.png` | BYD Han | Photorealistic studio photo of a **2024 BYD Han EV sedan in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `mini.png` | Mini Cooper S | Photorealistic studio photo of a **2023 Mini Cooper S 3-door hatch with black roof in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `impala64.png` | Chevrolet Impala 1964 | Photorealistic studio photo of a **1964 Chevrolet Impala SS hardtop coupe in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `lil9.png` | Li Auto L9 | Photorealistic studio photo of a **2024 Li Auto L9 full-size SUV in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `zeekr001.png` | Zeekr 001 | Photorealistic studio photo of a **2024 Zeekr 001 shooting brake in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `rangerover.png` | Range Rover | Photorealistic studio photo of a **2024 Range Rover (L460) long wheelbase SUV in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `escalade.png` | Cadillac Escalade | Photorealistic studio photo of a **2024 Cadillac Escalade SUV in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `raptor.png` | Ford F-150 Raptor | Photorealistic studio photo of a **2024 Ford F-150 Raptor pickup truck in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `charger70.png` | Dodge Charger 1970 | Photorealistic studio photo of a **1970 Dodge Charger R/T in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `sclass.png` | Mercedes-Benz S-класс W223 | Photorealistic studio photo of a **2024 Mercedes-Benz S 580 4MATIC (W223) long sedan in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `taycan.png` | Porsche Taycan Turbo S | Photorealistic studio photo of a **2024 Porsche Taycan Turbo S sedan in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `r8.png` | Audi R8 V10 | Photorealistic studio photo of a **2023 Audi R8 V10 performance coupe in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `db11.png` | Aston Martin DB11 | Photorealistic studio photo of a **2023 Aston Martin DB11 V12 coupe in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `gt500.png` | Shelby GT500 | Photorealistic studio photo of a **2022 Ford Mustang Shelby GT500 in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `cullinan.png` | Rolls-Royce Cullinan | Photorealistic studio photo of a **2024 Rolls-Royce Cullinan SUV in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `f812.png` | Ferrari 812 Superfast | Photorealistic studio photo of a **2021 Ferrari 812 Superfast in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |

## Контейнер для аукционов (img/cont_src/container.png → img/container.webp)
Photorealistic studio photo of a single 20-foot steel shipping container seen strictly from the front, showing the closed double cargo doors with four vertical locking bars, handles and a padlock. Neutral matte dark-red paint, slightly worn, subtle scratches. Centered, the whole container fully visible, straight-on view (no perspective), soft studio lighting, pure white background, no text, no logos, no shadows on the background, square 1:1 image, high detail.

## Контейнер сбоку — окно аукциона (img/cont_src/container_side.png → img/container_side.webp)
Photorealistic studio photo of a single 20-foot steel shipping container seen exactly from the long side, perfectly straight-on orthographic view with no perspective, corrugated side wall, corner castings visible at all four corners. Neutral matte dark-red paint, slightly worn, subtle scratches. The whole container fully visible and centered, soft studio lighting, pure white background, no text, no logos, no shadow on the background, wide 21:9 image, high detail.


## Перегенерация 11 тёмных машин белыми (для покраски; старые фото заменить)
| файл | Промпт |
|---|---|
| `aurus.png` | Photorealistic studio photo of a **2023 Aurus Senat luxury sedan in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `e36.png` | Photorealistic studio photo of a **1995 BMW 325i E36 sedan in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `g63.png` | Photorealistic studio photo of a **2024 Mercedes-AMG G63 SUV in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `chiron.png` | Photorealistic studio photo of a **2020 Bugatti Chiron hypercar in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `plaid.png` | Photorealistic studio photo of a **2023 Tesla Model S Plaid sedan in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `rs6.png` | Photorealistic studio photo of a **2023 Audi RS6 Avant performance wagon in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `rx7.png` | Photorealistic studio photo of a **1997 Mazda RX-7 FD3S coupe in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `mustang67.png` | Photorealistic studio photo of a **1967 Ford Mustang fastback in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `moskvich412.png` | Photorealistic studio photo of a **1975 Moskvich-412 Soviet sedan in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `vaz2107.png` | Photorealistic studio photo of a **2005 VAZ-2107 Lada sedan in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |
| `evo9.png` | Photorealistic studio photo of a **2006 Mitsubishi Lancer Evolution IX sedan in glossy pure white with dark tinted black windows**, exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, stock wheels, no text, no people, no reflections on floor, high detail, 3:1 wide composition |

## Эксклюзивные машины (только из контейнеров)

Сначала обычное фото → `img/cars_src/<id>.png`, потом в том же чате приложи его и попроси розовую версию → `img/paint_src/<id>.png`. Cybertruck не красится (голая сталь) — розовая версия не нужна.

| id | Промпт (обычное фото) |
|---|---|
| `m3touring` | Generate an image: Photorealistic studio photo of a white BMW M3 Competition Touring (G81 wagon, 2023), exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, no text, no people, high detail, wide 2.4:1 composition |
| `m4g82` | Generate an image: Photorealistic studio photo of a white BMW M4 Competition coupe (G82, 2022), exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, no text, no people, high detail, wide 2.4:1 composition |
| `m5g90` | Generate an image: Photorealistic studio photo of a white BMW M5 sedan (G90, 2025), exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, no text, no people, high detail, wide 2.4:1 composition |
| `gt63` | Generate an image: Photorealistic studio photo of a white Mercedes-AMG GT 63 S 4-Door Coupe (2022), exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, no text, no people, high detail, wide 2.4:1 composition |
| `cybertruck` | Generate an image: Photorealistic studio photo of a Tesla Cybertruck (2024, brushed stainless steel), exact side profile view, car facing right, entire vehicle visible, centered, neutral soft studio lighting, plain white background, no text, no people, high detail, wide 2.4:1 composition |

**Розовая версия** (приложить готовое фото): Repaint ONLY the painted metal body panels of this car in glossy bright magenta pink paint (#FF00FF), keeping the same realistic reflections, highlights and shading as the original paint. Keep everything else exactly the same: windows, tires, wheels, lights, grille, badges, trim, camera angle and white background.

## Детали электромобилей

Сохраняй как `img/parts_src/<id>.png` → `python tools/prepare_photos.py parts`.

| id | Деталь | Промпт |
|---|---|---|
| `motor.png` | Электромотор | Photorealistic studio product photo of **a high-performance electric vehicle motor (cylindrical aluminium housing with orange high-voltage cable connectors and cooling fins)**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |
| `battery.png` | Батарея | Photorealistic studio product photo of **an electric car high-voltage battery pack module (flat rectangular aluminium case with visible cell rows, orange high-voltage connectors)**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |
| `reducer.png` | Редуктор | Photorealistic studio product photo of **an electric vehicle single-speed reduction gearbox (compact cast aluminium housing with output shaft flanges)**, isolated, centered, entire object visible, 3/4 view, soft studio lighting, plain light grey background, no text, square 1:1 |

## Бета-машина (подарок участникам беты)

Сохрани как `img/cars_src/r34beta.png` → `python tools/prepare_photos.py r34beta`. Не перекрашивается — розовая версия не нужна.

| id | Промпт |
|---|---|
| `r34beta` | Generate an image: Photorealistic studio photo of a Nissan Skyline GT-R R34 (1999) with a custom racing livery: matte black body, neon lime-green (#9BE15D) racing stripes along the side and over the hood, large white-and-lime "DROPZONE" lettering along the side, smaller "BETA TESTER" text on the door, a lime "β" symbol on the hood, black wheels with lime rim stripe, subtle lime neon underglow. Exact side profile view, car facing right, entire car visible, centered, neutral soft studio lighting, plain white background, no people, high detail, wide 2.4:1 composition |
