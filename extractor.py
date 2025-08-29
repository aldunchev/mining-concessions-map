#!/usr/bin/env python3
"""
Bulgarian Mining Deposits PDF Extractor and Geocoder
Extracts all mining deposit data and geocodes locations to JSON output.

Usage: python extract_deposits.py
Requirements: pip install PyMuPDF requests pandas tabula-py
"""

import json
import re
import time
import requests
import pandas as pd
import fitz  # PyMuPDF
import tabula
from typing import Dict, List, Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BulgarianGeocoder:
    """Simple geocoder for Bulgarian locations using OpenStreetMap Nominatim"""

    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.cache = {}
        self.delay = 1.1  # Rate limit for Nominatim

        # Bulgarian administrative centers (approximate coordinates)
        self.region_coords = {
            "софия": (42.6977, 23.3219), "столична": (42.6977, 23.3219),
            "пловдив": (42.1354, 24.7453), "варна": (43.2141, 27.9147),
            "бургас": (42.5048, 27.4626), "русе": (43.8564, 25.9704),
            "стара загора": (42.4258, 25.6342), "плевен": (43.4170, 24.6067),
            "сливен": (42.6824, 26.3150), "добрич": (43.5736, 27.8287),
            "шумен": (43.2706, 26.9248), "перник": (42.6000, 23.0333),
            "ямбол": (42.4833, 26.5167), "хасково": (41.9344, 25.5553),
            "пазарджик": (42.1887, 24.3319), "благоевград": (42.0116, 23.0958),
            "велико търново": (43.0757, 25.6172), "монтана": (43.4091, 23.2203),
            "враца": (43.2050, 23.5486), "видин": (43.9859, 22.8777),
            "кюстендил": (42.2858, 22.6952), "кърджали": (41.6303, 25.3732),
            "силистра": (44.1194, 27.2608), "разград": (43.5258, 26.5169),
            "търговище": (43.2500, 26.5667), "габрово": (42.8746, 25.3188),
            "смолян": (41.5743, 24.7010), "ловеч": (43.1359, 24.7143)
        }

    def geocode(self, location: str, municipality: str, region: str) -> Tuple[Optional[Tuple[float, float]], str]:
        """
        Geocode location with fallback strategy
        Returns: (coordinates, confidence_level)
        """
        location = location.lower().strip()
        municipality = municipality.lower().strip()
        region = region.lower().strip()

        # Strategy 1: Try exact location
        coords = self._query_nominatim(f"{location}, {municipality}, {region}, Bulgaria")
        if coords:
            return coords, "high"

        # Strategy 2: Try municipality
        coords = self._query_nominatim(f"{municipality}, {region}, Bulgaria")
        if coords:
            return coords, "medium"

        # Strategy 3: Use region fallback
        if region in self.region_coords:
            return self.region_coords[region], "low"

        return None, "none"

    def _query_nominatim(self, query: str) -> Optional[Tuple[float, float]]:
        """Query Nominatim API with caching and rate limiting"""
        if query in self.cache:
            return self.cache[query]

        time.sleep(self.delay)

        try:
            params = {
                'q': query,
                'format': 'json',
                'limit': 1,
                'countrycodes': 'bg',
                'addressdetails': 1
            }

            headers = {'User-Agent': 'Bulgarian Mining Deposits Extractor 1.0'}

            response = requests.get(self.base_url, params=params, headers=headers, timeout=10)
            response.raise_for_status()

            data = response.json()
            if data:
                lat, lon = float(data[0]['lat']), float(data[0]['lon'])
                self.cache[query] = (lat, lon)
                return (lat, lon)

        except Exception as e:
            logger.warning(f"Geocoding failed for '{query}': {e}")

        self.cache[query] = None
        return None

class PDFExtractor:
    """Extract mining deposits data from Bulgarian PDF"""

    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path

    def extract_all_deposits(self) -> List[Dict]:
        """Extract all deposits using multiple methods"""

        # Method 1: Try tabula for structured table extraction
        deposits = self._extract_with_tabula()
        if deposits:
            logger.info(f"Tabula extracted {len(deposits)} deposits")
            return deposits

        # Method 2: Fallback to text parsing
        logger.info("Tabula failed, trying text extraction...")
        deposits = self._extract_with_text_parsing()
        logger.info(f"Text parsing extracted {len(deposits)} deposits")
        return deposits

    def _extract_with_tabula(self) -> List[Dict]:
        """Extract using tabula-py for table detection"""
        try:
            # Read all tables from PDF
            tables = tabula.read_pdf(
                self.pdf_path,
                pages='all',
                multiple_tables=True,
                pandas_options={'header': None}
            )

            all_deposits = []

            for table in tables:
                deposits = self._parse_table_data(table)
                all_deposits.extend(deposits)

            return all_deposits

        except Exception as e:
            logger.warning(f"Tabula extraction failed: {e}")
            return []

    def _parse_table_data(self, df: pd.DataFrame) -> List[Dict]:
        """Parse DataFrame into deposit dictionaries"""
        deposits = []

        for idx, row in df.iterrows():
            try:
                # Skip empty or header rows
                if len(row) < 6 or pd.isna(row.iloc[1]):
                    continue

                # Extract data based on expected column structure
                deposit = {
                    "id": str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else "",
                    "koncesioner": str(row.iloc[2]).strip().strip('"') if pd.notna(row.iloc[2]) else "",
                    "nahodishte": str(row.iloc[3]).strip() if pd.notna(row.iloc[3]) else "",
                    "obshtina": str(row.iloc[4]).strip() if pd.notna(row.iloc[4]) else "",
                    "oblast": str(row.iloc[5]).strip() if pd.notna(row.iloc[5]) else "",
                    "grupa_bogatstvo": str(row.iloc[6]).strip() if len(row) > 6 and pd.notna(row.iloc[6]) else "",
                    "vid_bogatstvo": str(row.iloc[7]).strip() if len(row) > 7 and pd.notna(row.iloc[7]) else "",
                    "srok_koncesiya": str(row.iloc[8]).strip() if len(row) > 8 and pd.notna(row.iloc[8]) else "",
                    "status": str(row.iloc[9]).strip() if len(row) > 9 and pd.notna(row.iloc[9]) else "съгласуван"
                }

                # Only add if we have essential data
                if deposit["id"] and deposit["nahodishte"]:
                    deposits.append(deposit)

            except Exception as e:
                logger.warning(f"Failed to parse row {idx}: {e}")

        return deposits

    def _extract_with_text_parsing(self) -> List[Dict]:
        """Fallback text extraction using PyMuPDF and regex"""
        deposits = []

        try:
            doc = fitz.open(self.pdf_path)

            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()

                # Multiple regex patterns to catch different formatting
                patterns = [
                    # Pattern 1: Standard format with quoted company names
                    r'(\d+)\s+([D\-\d]+)\s+"([^"]+)"\s+([^\t\n]+?)\s+([^\t\n]+?)\s+([^\t\n]+?)\s+([^\t\n]+?)\s+([^\t\n]+?)\s+(\d+\s*г\.?\s*[\+\-]?\s*\d*\s*г\.?|[а-яА-Я\s]+)',

                    # Pattern 2: Alternative format without quotes
                    r'(\d+)\s+([D\-O\d]+)\s+([^"\n]+?ООД|[^"\n]+?АД|[^"\n]+?ЕООД|[^"\n]+?ЕАД)\s+([^\n]+?)\s+([^\n]+?)\s+([^\n]+?)\s+([^\n]+?)\s+([^\n]+?)\s+(\d+\s*г\.?|[а-яА-Я\s]+)',

                    # Pattern 3: More flexible pattern
                    r'(\d+)\s+([D\-O\d\-]+)\s+(.+?)\s+([А-Я][а-я\s\-]+)\s+([А-Я][а-я\s\-]+)\s+(Строителни материали|Скално-облицовъчни материали|Метални полезни изкопаеми|Индустриални минерали|Твърди горива|Нефт и природен газ)'
                ]

                for pattern in patterns:
                    matches = re.findall(pattern, text, re.MULTILINE)

                    for match in matches:
                        try:
                            deposit = {
                                "id": match[1].strip(),
                                "koncesioner": match[2].strip().strip('"'),
                                "nahodishte": match[3].strip(),
                                "obshtina": match[4].strip(),
                                "oblast": match[5].strip(),
                                "grupa_bogatstvo": match[6].strip() if len(match) > 6 else "",
                                "vid_bogatstvo": match[7].strip() if len(match) > 7 else "",
                                "srok_koncesiya": match[8].strip() if len(match) > 8 else "",
                                "status": "съгласуван"
                            }

                            # Validate essential fields
                            if deposit["id"] and deposit["nahodishte"] and len(deposit["id"]) > 2:
                                deposits.append(deposit)

                        except Exception as e:
                            logger.warning(f"Failed to parse match: {e}")

            doc.close()

        except Exception as e:
            logger.error(f"Text extraction failed: {e}")

        # Remove duplicates based on ID
        seen_ids = set()
        unique_deposits = []
        for deposit in deposits:
            if deposit["id"] not in seen_ids:
                seen_ids.add(deposit["id"])
                unique_deposits.append(deposit)

        return unique_deposits

def main():
    """Main extraction and geocoding pipeline"""

    # Configuration
    PDF_PATH = "docs/koncesii_public_proekti.pdf"  # Update this path
    OUTPUT_PATH = "mining_deposits.json"

    print("Bulgarian Mining Deposits Extractor")
    print("="*50)

    # Step 1: Extract from PDF
    print(f"Extracting data from: {PDF_PATH}")
    extractor = PDFExtractor(PDF_PATH)
    deposits = extractor.extract_all_deposits()

    if not deposits:
        print("❌ No deposits extracted from PDF. Check file path and format.")
        return

    print(f"✓ Extracted {len(deposits)} deposits")

    # Step 2: Geocode locations
    print("Starting geocoding...")
    geocoder = BulgarianGeocoder()

    geocoded_count = 0
    confidence_stats = {"high": 0, "medium": 0, "low": 0, "none": 0}

    for i, deposit in enumerate(deposits):
        print(f"Geocoding {i+1}/{len(deposits)}: {deposit['nahodishte']}", end=" ")

        coords, confidence = geocoder.geocode(
            deposit['nahodishte'],
            deposit['obshtina'],
            deposit['oblast']
        )

        deposit['coordinates'] = coords
        deposit['coordinate_confidence'] = confidence

        if coords:
            geocoded_count += 1
            print(f"-> {coords} ({confidence})")
        else:
            print("-> Failed")

        confidence_stats[confidence] += 1

        # Progress update every 25 items
        if (i + 1) % 25 == 0:
            print(f"Progress: {i+1}/{len(deposits)} processed ({geocoded_count} successful)")

    # Step 3: Generate output
    output_data = {
        "metadata": {
            "total_deposits": len(deposits),
            "geocoded_deposits": geocoded_count,
            "success_rate": round(geocoded_count / len(deposits) * 100, 1),
            "confidence_distribution": confidence_stats,
            "extraction_date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "source_file": PDF_PATH
        },
        "deposits": deposits
    }

    # Save to JSON
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    # Final summary
    print("\n" + "="*50)
    print("EXTRACTION COMPLETE")
    print("="*50)
    print(f"Total deposits: {len(deposits)}")
    print(f"Successfully geocoded: {geocoded_count} ({geocoded_count/len(deposits)*100:.1f}%)")
    print(f"Output saved to: {OUTPUT_PATH}")
    print("\nConfidence levels:")
    for level, count in confidence_stats.items():
        print(f"  {level:10}: {count:3d} ({count/len(deposits)*100:.1f}%)")

    # Sample some results for verification
    print("\nSample results:")
    for i, deposit in enumerate(deposits[:5]):
        coords = deposit['coordinates']
        conf = deposit['coordinate_confidence']
        coord_str = f"{coords[0]:.4f}, {coords[1]:.4f}" if coords else "No coordinates"
        print(f"  {deposit['nahodishte']} -> {coord_str} ({conf})")

if __name__ == "__main__":
    main()
