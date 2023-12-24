# https://linuxhint.com/send_receive_udp_python/
# https://realpython.com/python-sockets/
# 2021-03-13 Hardcoded for reading RH & Temp from a certain Tellstick sensor..

import socket
import _sqlite3
from _sqlite3 import Error
from datetime import datetime

# Tellstick port
port = 42314

# Tellstick broadcast port
bcport = 30303

# Log to path
filePath = "/var/www/html/tellstick/sensorlog.log"
#filePath = "sensorlog.log"

def mytime():
    now = datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S")

def mytime2():
    # Returns date and time separated for database storage
    now = datetime.now()
    return int(now.strftime("%Y%m%d")), int(now.strftime("%H")), int(now.strftime("%M"))

def logToFile(logme):
    f = open(filePath, "a")
    f.writelines(mytime() + '\t ' + logme + '\n')
    f.close

def createConnection():
    # Create connection to database file
    db = None
    try:
        db = _sqlite3.connect('/var/www/html/tellstick/tell.db')
    except Error as e:
        print(e)
    return db

def createTable(db, cursor):
    try:
        cursor.execute('''
                CREATE TABLE IF NOT EXISTS measurements(
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                date INTEGER, 
                time TEXT, 
                device INTEGER, 
                temp FLOAT, 
                RH INTEGER)
            ''')
        db.commit()

    except Error as e:
        print(e)

def storeData(id, date, hour, minute, temp, rh):
    # Add data to database

    if len(str(hour)) == 1:
        hour = '0' + str(hour)

    if len(str(minute)) == 1:
        minute = '0' + str(minute)

    time = str(hour) + ':' + str(minute)
    params = (date, time, id, temp, rh)

    print('Storing into db: ', params)
    logToFile('Storing into db: ' + str(params))

    cursor.execute("INSERT INTO measurements VALUES (NULL, ?, ?, ?, ?, ?)", params)
    database.commit()

def addtoDb(id, temp, rh):
    # Check if we should store this data

    date, hour, minute = mytime2()

    # Make sure that the array doesn't grow too big.
    if len(stored) > 100:
        stored.pop(0);

    # Only store one measurement for each 15 minutes
    if minute >= 0 and minute < 15:
        if str(id) + '.' + str(hour) + ':00' not in stored:
            storeData(id, date, hour, '00', temp, rh)
            stored.append(str(id) + '.' + str(hour) + ':00')
    if minute >= 15 and minute < 30:
        if str(id) + '.' + str(hour) + ':15' not in stored:
            stored.append(str(id) + '.' + str(hour) + ':15')
            storeData(id, date, hour, '15', temp, rh)
    if minute >= 30 and minute < 45:
        if str(id) + '.' + str(hour) + ':30' not in stored:
            stored.append(str(id) + '.' + str(hour) + ':30')
            storeData(id, date, hour, '30', temp, rh)
    if minute >= 45:
        if str(id) + '.' + str(hour) + ':45' not in stored:
            stored.append(str(id) + '.' + str(hour) + ':45')
            storeData(id, date, hour, '45', temp, rh)

def findTellstick(bcport):
    # Send 'D' to broadcast, port 30303

    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, 0)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, bcport)
    send_data = 'D'
    timeout = 2

    while True:
        s.settimeout(timeout)
        s.sendto(send_data.encode('utf-8'), ("255.255.255.255", bcport))
        print(mytime(), 'Sent broadcast to port 30303, waiting for reply...')
        try:
            data, address = s.recvfrom(512)
            s.close()
            break
        except socket.timeout:
            print(mytime(), 'No Tellstick replied withing ', timeout, ' seconds, trying again..')
            # Double the timeout for each try up to max 256 s
            if timeout < 256: timeout *= 2
            s.close

    data_string = str(data)
    print(mytime(), 'Got reply from ', address, '  ', data)
    logToFile('Found it! ' + str(address) + data_string)

    # Return IP-address of Tellstick
    return address[0]

def register(ip, port, s):
    send_data = 'B:reglistener'
    print(mytime(), "Sending registration packet ", send_data, " to ", ip, port)
    s.sendto(send_data.encode('utf-8'), (ip, port))

def parseData(data):

    data_string = str(data)

    #if "protocolA" in data_string:
    if "RawDatah5:class6:sensor8:protocolA:fineoffset4:datai" in data_string:
        # Get the last part of the received data
        x = data_string.split(":")[6]

        # Convert data from hex
        id = int( x[6:8], 16 )
        temp = ( int( x[9:11], 16 )) / 10
        rh = int( x[11:13], 16 )

        # If there's an 8 at index no 8 it means minus degrees..
        if int( x[8] ) == 8:
            temp *= -1

        print(mytime(), "\tSensor id: ", id, "  Temp: ", temp, "  RH: ", rh)
        logToFile("ID: " + str(id) + "\t Temp: " + str(temp) + "\t RH: " + str(rh))

        # Write to database
        addtoDb(id, temp, rh)

    else:
        print("\n", mytime(), ' got something else..', data_string)
        logToFile("Got something else.." + data_string)

def server():
    while True:
        # Get the IP of the Tellstick
        ip = findTellstick(bcport)
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, 0)

        # Send registration packet
        register(ip, port, s)
        s.settimeout(35)
        counter = 0
        reset = False

        # Repeat forever unless we should start over looking for tellstick..
        while True:
            try:
                data, address = s.recvfrom(512)
                parseData(data)
                counter = 0
            except socket.timeout:
                counter += 1
                # If we haven't heard anything for 10 retries, send a new broadcast
                if counter > 9:
                    print(mytime(), 'total timeout.. start over..')
                    reset = True
                    break
                register(ip, port, s)

            if reset: break

def main():
    logToFile('Program started..')
    server()


if __name__ == '__main__':

    database = createConnection()
    cursor = database.cursor()
    stored = ['']

    if database != None:
        createTable(database, cursor)
    main()

