# SAME (PSI-101) TEM particle-size analysis

Scale-bar values are read from each image's burned-in banner
(signature clusters verified visually; PDF page labels were
found unreliable on some pages and are kept only as reference).

- TEM images processed: 113 (111 with a verified bar)
- Individual particles measured: **4283**
- Large soot deposits/clouds flagged separately: 0 (excluded from the size distribution)
- Particle diameter range: 0.027-1.8 um
- Median diameter: 0.126 um (approximate, image-derived)
Visual verification crops for every signature cluster: `datasets/tem_bar_sigs/`.

Scale-bar signature clusters:

| bar um | images | span px (median) | spread |
|---|---|---|---|
| 2.0 | 4 | 188 | 188-188 |
| 2.0 | 12 | 148 | 148-148 |
| 2.0 | 3 | 206 | 206-206 |
| 2.0 | 9 | 207 | 207-207 |
| 2.0 | 15 | 162 | 162-162 |
| 2.0 | 1 | 152 | 152-152 |
| 2.0 | 1 | 153 | 153-153 |
| 2.0 | 5 | 196 | 196-196 |
| 2.0 | 1 | 196 | 196-196 |
| 2.0 | 1 | 196 | 196-196 |
| 5.0 | 20 | 206 | 206-206 |
| 5.0 | 3 | 163 | 163-163 |
| 5.0 | 1 | 163 | 163-163 |
| 5.0 | 1 | 164 | 164-164 |
| 10.0 | 7 | 138 | 138-138 |
| 10.0 | 6 | 137 | 137-137 |
| 10.0 | 6 | 126 | 126-126 |
| 10.0 | 4 | 130 | 130-130 |
| 10.0 | 9 | 130 | 130-130 |
| 50.0 | 2 | 158 | 158-158 |

Caveats (honesty): automated blob detection on local contrast
(background sigma 8.0, threshold 3.0 sigma);
faint particles are detected at their darker cores, so their
diameters skew small; surround-adjacent and border-touching
blobs are excluded; components spanning >20% of the image
width are classed as soot deposits rather than individual
particles; sizes are image-derived approximations, not lab
measurements.

## Per-image particle counts

| pdf | page | img | pdf label | bar um | bar px | particles |
|---|---|---|---|---|---|---|
| 52-5P Pyrell.pdf | 1 | 1 | 1350X | 10.0 | 138.0 | 5 particles |
| 52-5P Pyrell.pdf | 1 | 2 | 1350X | 10.0 | 138.0 | 4 particles |
| 52-5P Pyrell.pdf | 2 | 1 | 1350X | 10.0 | 138.0 | 6 particles |
| 52-5P Pyrell.pdf | 2 | 2 | 1350X | 10.0 | 138.0 | 4 particles |
| 52-5P Pyrell.pdf | 3 | 1 | 1350X | 10.0 | 138.0 | 4 particles |
| 52-5P Pyrell.pdf | 3 | 2 | 1350X | 10.0 | 137.0 | 7 particles |
| 54 7L Lampwick.pdf | 1 | 1 | 340X | 10.0 | 126.0 | 2 particles |
| 54 7L Lampwick.pdf | 1 | 2 | 340X | 50.0 | 158.0 | 18 particles |
| 54 7L Lampwick.pdf | 2 | 1 | 1350X | 10.0 | 126.0 | 164 particles |
| 54 7L Lampwick.pdf | 2 | 2 | 1350X | 10.0 | 126.0 | 170 particles |
| 54 7L Lampwick.pdf | 3 | 1 | 4400X | 5.0 | 206.0 | 41 particles |
| 54 7L Lampwick.pdf | 3 | 2 | 4400X | 5.0 | 206.0 | 25 particles |
| 54 7L Lampwick.pdf | 4 | 1 | 4400X | 5.0 | 206.0 | 46 particles |
| 54 7L Lampwick.pdf | 4 | 2 | 4400X | 5.0 | 206.0 | 18 particles |
| 54 7L Lampwick.pdf | 5 | 1 | 4400X | 5.0 | 206.0 | 87 particles |
| 54 7L Lampwick.pdf | 5 | 2 | 4400X | 5.0 | 206.0 | 92 particles |
| 54 7L Lampwick.pdf | 6 | 1 | 10000X | 2.0 | 188.0 | 23 particles |
| 54 7L Lampwick.pdf | 6 | 2 | 10000X | 2.0 | 188.0 | 46 particles |
| 55 8L Lampwick.pdf | 1 | 1 | 4400X | 5.0 | 206.0 | 26 particles |
| 55 8L Lampwick.pdf | 1 | 2 | 4400X | 5.0 | 206.0 | 29 particles |
| 55 8L Lampwick.pdf | 2 | 1 | 4400X | 5.0 | 206.0 | 15 particles |
| 55 8L Lampwick.pdf | 2 | 2 | 4400X | 5.0 | 206.0 | 20 particles |
| 55 8L Lampwick.pdf | 3 | 1 | 4400X | 5.0 | 206.0 | 44 particles |
| 55 8L Lampwick.pdf | 3 | 2 | 4400X | 5.0 | 206.0 | 38 particles |
| 55 8L Lampwick.pdf | 4 | 1 | 4400X | 5.0 | 206.0 | 36 particles |
| 55 8L Lampwick.pdf | 4 | 2 | 4400X | 5.0 | 206.0 | 37 particles |
| 55 8L Lampwick.pdf | 5 | 1 | 4400X | 5.0 | 206.0 | 37 particles |
| 55 8L Lampwick.pdf | 5 | 2 | 4400X | 5.0 | 206.0 | 45 particles |
| 55 8L Lampwick.pdf | 6 | 1 | 4400X | 5.0 | 206.0 | 39 particles |
| 55 8L Lampwick.pdf | 6 | 2 | 4400X | 5.0 | 206.0 | 25 particles |
| 55 8L Lampwick.pdf | 7 | 1 | 7800X | 2.0 | 148.0 | 16 particles |
| 55 8L Lampwick.pdf | 7 | 2 | 7800X | 2.0 | 148.0 | 10 particles |
| 55 8L Lampwick.pdf | 8 | 1 | 7800X | 2.0 | 148.0 | 11 particles |
| 55 8L Lampwick.pdf | 8 | 2 | 7800X | 2.0 | 148.0 | 11 particles |
| 55 8L Lampwick.pdf | 9 | 1 | 7800X | 2.0 | 148.0 | 9 particles |
| 55 8L Lampwick.pdf | 9 | 2 | 7800X | 2.0 | 148.0 | 9 particles |
| 55 8L Lampwick.pdf | 10 | 1 | 7800X | 2.0 | 148.0 | 6 particles |
| 55 8L Lampwick.pdf | 10 | 2 | 7800X | 2.0 | 148.0 | 14 particles |
| 55 8L Lampwick.pdf | 11 | 1 | 7800X | 2.0 | 148.0 | 7 particles |
| 55 8L Lampwick.pdf | 11 | 2 | 7800X | 2.0 | 148.0 | 7 particles |
| 55 8L Lampwick.pdf | 12 | 1 | 7800X | 2.0 | 148.0 | 8 particles |
| 55 8L Lampwick.pdf | 12 | 2 | 7800X | 2.0 | 148.0 | 4 particles |
| 62 pre 15K Kapton.pdf | 1 | 1 | 340X | 10.0 | 126.0 | 2 particles |
| 62 pre 15K Kapton.pdf | 1 | 2 | 340X | 50.0 | 158.0 | 4 particles |
| 62 pre 15K Kapton.pdf | 2 | 1 | 1350X | 10.0 | 126.0 | 52 particles |
| 62 pre 15K Kapton.pdf | 2 | 2 | 1350X | 10.0 | 126.0 | 220 particles |
| 62 pre 15K Kapton.pdf | 3 | 1 | 4400X | 5.0 | 206.0 | 170 particles |
| 62 pre 15K Kapton.pdf | 3 | 2 | 4400X | 5.0 | 206.0 | 89 particles |
| 62 pre 15K Kapton.pdf | 4 | 1 | 10000X | 2.0 | 188.0 | 57 particles |
| 62 pre 15K Kapton.pdf | 4 | 2 | 10000X | 2.0 | 188.0 | 72 particles |
| 68 21L Lampwick.pdf | 1 | 1 | 1350X | 10.0 | 138.0 | 4 particles |
| 68 21L Lampwick.pdf | 1 | 2 | 1350X | 10.0 | 138.0 | 17 particles |
| 68 21L Lampwick.pdf | 2 | 1 | 10000X | 2.0 | 206.0 | 11 particles |
| 68 21L Lampwick.pdf | 2 | 2 | 10000X | 2.0 | 206.0 | 5 particles |
| 68 21L Lampwick.pdf | 3 | 1 | 10000X | 2.0 | 207.0 | 125 particles |
| 68 21L Lampwick.pdf | 3 | 2 | 10000X | 2.0 | 207.0 | 117 particles |
| 68 21L Lampwick.pdf | 4 | 1 | 10000X | 2.0 | 206.0 | 23 particles |
| 68 21L Lampwick.pdf | 4 | 2 | 10000X | 2.0 | 207.0 | 35 particles |
| 70-23K Kapton.pdf | 1 | 1 | 1350X | 10.0 | 137.0 | 5 particles |
| 70-23K Kapton.pdf | 1 | 2 | 1350X | 10.0 | 137.0 | 8 particles |
| 70-23K Kapton.pdf | 2 | 1 | 1350X | 10.0 | 137.0 | 10 particles |
| 70-23K Kapton.pdf | 2 | 2 | 1350X | 10.0 | 137.0 | 6 particles |
| 70-23K Kapton.pdf | 3 | 1 | 1350X | 10.0 | 137.0 | 17 particles |
| 70-23K Kapton.pdf | 3 | 2 | 1350X | 2.0 | 207.0 | 97 particles |
| 70-23K Kapton.pdf | 4 | 1 | 10000X | 2.0 | 207.0 | 20 particles |
| 70-23K Kapton.pdf | 4 | 2 | 10000X | 2.0 | 207.0 | 27 particles |
| 70-23K Kapton.pdf | 5 | 1 | 10000X | 2.0 | 207.0 | 67 particles |
| 70-23K Kapton.pdf | 5 | 2 | 10000X | 2.0 | 207.0 | 12 particles |
| K01-4K images.pdf | 1 | 1 | 1350X | 2.0 | 162.0 | 11 particles |
| K01-4K images.pdf | 1 | 2 | 1350X | 2.0 | 162.0 | 16 particles |
| K01-4K images.pdf | 2 | 1 | 1350X | 2.0 | 162.0 | 10 particles |
| K01-4K images.pdf | 2 | 2 | 1350X | 2.0 | 162.0 | 8 particles |
| K01-4K images.pdf | 3 | 1 | 1350X | 2.0 | 162.0 | 14 particles |
| K01-4K images.pdf | 4 | 1 | 10000X | 2.0 | 162.0 | 33 particles |
| K01-4K images.pdf | 4 | 2 | 10000X | 2.0 | 162.0 | 12 particles |
| K01-4K images.pdf | 5 | 1 | 10000X | 2.0 | 162.0 | 49 particles |
| K01-4K images.pdf | 5 | 2 | 10000X | 2.0 | 162.0 | 16 particles |
| K01-4K images.pdf | 6 | 1 | 10000X | 2.0 | 152.0 | 42 particles |
| K01-4K images.pdf | 6 | 2 | 10000X | 2.0 | 162.0 | 24 particles |
| K01-4K images.pdf | 7 | 1 | 10000X | 2.0 | 162.0 | 45 particles |
| K01-4K images.pdf | 7 | 2 | 10000X | 2.0 | 162.0 | 26 particles |
| K01-4K images.pdf | 8 | 1 | 10000X | 2.0 | 162.0 | 34 particles |
| K01-4K images.pdf | 8 | 2 | 10000X | 2.0 | 162.0 | 17 particles |
| K01-4K images.pdf | 9 | 1 | 10000X | 2.0 | 153.0 | 105 particles |
| K01-4K images.pdf | 9 | 2 | 10000X | 2.0 | 162.0 | 13 particles |
| L13 images.pdf | 1 | 1 | 1350X | 10.0 | 130.0 | 6 particles |
| L13 images.pdf | 1 | 2 | 1350X | 10.0 | 130.0 | 0 particles |
| L13 images.pdf | 2 | 1 | 1350X | 10.0 | 130.0 | 1 particles |
| L13 images.pdf | 2 | 2 | 1350X | 10.0 | 130.0 | 39 particles |
| L13 images.pdf | 3 | 1 | 1350X | 10.0 | 130.0 | 3 particles |
| L13 images.pdf | 3 | 2 | 1350X | 10.0 | 130.0 | 5 particles |
| L13 images.pdf | 4 | 1 | 1350X | 10.0 | 130.0 | 2 particles |
| L13 images.pdf | 4 | 2 | 1350X | 10.0 | 130.0 | 3 particles |
| L13 images.pdf | 5 | 1 | 1350X | 10.0 | 130.0 | 9 particles |
| L13 images.pdf | 5 | 2 | 1350X | 10.0 | 130.0 | 3 particles |
| L13 images.pdf | 6 | 1 | 1350X | 10.0 | 130.0 | 9 particles |
| L13 images.pdf | 6 | 2 | 1350X | 10.0 | 130.0 | 2 particles |
| L13 images.pdf | 7 | 1 | 1350X | 10.0 | 130.0 | 4 particles |
| L13 images.pdf | 8 | 1 | 3400X | 5.0 | 163.0 | 84 particles |
| L13 images.pdf | 8 | 2 | 3400X | 5.0 | 163.0 | 45 particles |
| L13 images.pdf | 9 | 1 | 3400X | 5.0 | 163.0 | 48 particles |
| L13 images.pdf | 9 | 2 | 3400X | 5.0 | 163.0 | 46 particles |
| L13 images.pdf | 10 | 1 | 3400X | 5.0 | 164.0 | 52 particles |
| L13 images.pdf | 11 | 1 | 10000X | 2.0 | 196.0 | 86 particles |
| L13 images.pdf | 11 | 2 | 10000X | 2.0 | 196.0 | 105 particles |
| L13 images.pdf | 12 | 1 | 10000X | 2.0 | 196.0 | 102 particles |
| L13 images.pdf | 12 | 2 | 10000X | 2.0 | 196.0 | 113 particles |
| L13 images.pdf | 13 | 1 | 10000X | 2.0 | 196.0 | 114 particles |
| L13 images.pdf | 13 | 2 | 10000X | 2.0 | 207.0 | 188 particles |
| L13 images.pdf | 14 | 1 | 10000X | 2.0 | 196.0 | 93 particles |
| L13 images.pdf | 14 | 2 | 10000X | 2.0 | 196.0 | 109 particles |
| L13 images.pdf | 15 | 1 | 10X | - | nan | no-bar |
| L13 images.pdf | 15 | 2 | 10X | - | nan | no-bar |
