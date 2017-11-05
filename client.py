
import serial
from socketIO_client_nexus import SocketIO, LoggingNamespace
# Init serial port
ser = serial.Serial('/dev/ttyUSB0', 9600)

def on_pd():
    ser.write(b'1')
    msg = ser.readline()[:-2]
    if msg == b'im_alive':
        socketIO.emit('ressurection')

def on_get_role():
    socketIO.emit('get_role_aproved', {'role': 'arduino'})

# Init socket
socketIO = SocketIO('62.75.159.242', 2000)
socketIO.on('get_role', on_get_role)
socketIO.on("pd", on_pd)

socketIO.wait()
