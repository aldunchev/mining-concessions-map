# Bulgarian Mining Concessions Map - Development Notes

## 📁 Project Structure

```
/
├── index.html              # Password protection landing page
├── map.html               # Main interactive map (password protected)
├── mining_deposits.json   # Extracted and geocoded concession data
├── extractor.py          # Python script for PDF extraction and geocoding
├── requirements.txt      # Python dependencies
├── README.md            # User documentation
└── CLAUDE.md           # This development documentation
```

## 🔧 Technical Architecture

### Frontend
- **Framework**: Vanilla HTML/CSS/JavaScript
- **Mapping Library**: Leaflet.js 1.9.4
- **Map Tiles**: OpenStreetMap
- **Hosting**: GitHub Pages (Static)

### Data Processing
- **Language**: Python 3
- **PDF Extraction**: PyMuPDF + tabula-py
- **Geocoding**: OpenStreetMap Nominatim API
- **Data Format**: JSON with 331 geocoded locations

### Security
- **Authentication**: Client-side JavaScript password check
- **Password**: `ConcessionsBG2024`
- **Protection Method**: Redirect-based (index.html → map.html)

## 📊 Data Overview

- **Total Concessions**: 338 extracted from PDF
- **Successfully Geocoded**: 331 locations (97.9% success rate)
- **Coordinate Accuracy**: 47% high, 50% medium, 1% low precision
- **Source**: Official Bulgarian mining concessions PDF document

## 🛠️ Development Commands

### Python Environment Setup
```bash
pip install -r requirements.txt
```

### Data Extraction
```bash
python extractor.py
```

### Local Development
```bash
# Serve locally (to handle CORS for JSON loading)
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Deployment
```bash
git add .
git commit -m "Update files"
git push origin main
# Auto-deploys to: https://aldunchev.github.io/mining-concessions-map/
```

## 🗺️ Map Features

### Interactive Elements
- **Zoom and Pan**: Navigate around Bulgaria
- **Clickable Markers**: Detailed concession information
- **Color-Coded Markers**: Different colors for material types
- **Responsive Design**: Works on desktop, tablet, mobile

### Filtering System
- **Region Filter**: Filter by Bulgarian oblast
- **Material Type Filter**: Filter by extracted materials
- **Coordinate Accuracy Filter**: Filter by GPS precision
- **Company Search**: Search for specific concession holders

### Material Types & Colors
- 🔴 Construction Materials (`#e74c3c`)
- 🔵 Rock-Facing Materials (`#3498db`)
- 🟠 Industrial Minerals (`#f39c12`)
- 🟣 Metal Ores (`#9b59b6`)
- 🟢 Solid Fuels (`#2ecc71`)
- 🟢 Oil and Natural Gas (`#1abc9c`)

## 🔍 Data Processing Logic

### Geocoding Strategy (Fallback)
1. **High Accuracy**: Exact location + municipality + region
2. **Medium Accuracy**: Municipality + region only
3. **Low Accuracy**: Regional coordinates fallback

### PDF Extraction Methods
1. **Primary**: tabula-py for structured table extraction
2. **Fallback**: PyMuPDF with regex pattern matching

## 🌐 URLs and Access

- **Main Site**: https://aldunchev.github.io/mining-concessions-map/
- **Direct Map**: https://aldunchev.github.io/mining-concessions-map/map.html
- **Repository**: https://github.com/aldunchev/mining-concessions-map

## 🔐 Security Considerations

- **Client-side protection**: Suitable for business data, not highly sensitive
- **No server-side authentication**: Static hosting limitation
- **Password in JavaScript**: Visible in source code (acceptable for this use case)
- **HTTPS**: Provided by GitHub Pages

## 🐛 Common Issues & Solutions

### CORS Errors
- **Problem**: Loading JSON locally fails
- **Solution**: Use GitHub Pages or local HTTP server

### JavaScript Errors
- **Problem**: Syntax errors in template literals
- **Solution**: Simplified redirect-based authentication

### Geocoding Rate Limits
- **Problem**: Nominatim API rate limiting
- **Solution**: 1.1-second delay between requests

## 🚀 Future Improvements

- [ ] Server-side authentication for better security
- [ ] Batch geocoding improvements
- [ ] Additional data visualization features
- [ ] Export functionality for filtered results
- [ ] Multi-language support

## 📝 Development History

1. **Data Extraction**: Used extractor.py to process PDF → JSON
2. **Map Creation**: Built interactive Leaflet.js map
3. **Hosting**: Deployed to GitHub Pages
4. **Protection**: Implemented password authentication
5. **Optimization**: Fixed errors and improved UX

## 🤝 Client Requirements Met

- ✅ Extract data from Bulgarian PDF document
- ✅ Geocode all locations with high success rate
- ✅ Create interactive map with filtering
- ✅ Password-protect for business use
- ✅ Host on free platform (GitHub Pages)
- ✅ Mobile-responsive design
- ✅ Clean, professional interface

---

*Last updated: August 29, 2024*
*Developed using Claude Code*