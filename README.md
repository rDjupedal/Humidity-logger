# Humidity logger

### About
The server.py finds any connects to any Tellstick Net device found in the local network. It doesn't need to have an Internet connection. 
It then logs humidity and temp readings from connected sensors into a sqlite3 database with 15 minutes interval.

The original is to display a graph over time with temp and RH readings. So far only a simple mobile-friendly webpage has been implemented.

### Installation
Preferably run the server.py as a service and use any web server to host the web page. 
