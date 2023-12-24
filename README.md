# Humidity logger

### About
The server.py finds any connects to any Tellstick Net device found in the local network. It doesn't need to have an Internet connection. 
It then logs humidity and temp readings from connected sensors into a sqlite3 database with 15 minutes interval.

The webpage display each sensor with its current temperature and RH reading. When a sensor is clicked a chart will show up. 
One can save a short text label for each sensor by clicking in the top-left field of the sensor display.

### Installation
Preferably run the server.py as a service and use any web server to host the web page. 
