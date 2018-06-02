# -*- coding:utf-8 -*-
#import socket,stackless
import socket
import threading
import time
import datetime
import os
import struct
timeout = 300
socket.setdefaulttimeout(timeout)
t = datetime.datetime.utcnow() - datetime.datetime(1970,1,1)
tseconds = int(t.total_seconds())

conn = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
#conn.connect(("localhost", 9990))
conn.connect(("61.143.60.84", 63667))
guid = '{123-4656-789}'
## === heartbeat
msg = ('Command=HeartBeat\r\nGuid='+guid+'\r\nTime=' +
     str(tseconds) +"\r\n")
conn.send(struct.pack('>h', len(msg)))
conn.send(msg)
data = conn.recv(1024)
print(data)
data = conn.recv(1024)
print(data)
print("---->")
os.exit(0)

## === heartbeat
fileInfo = 'FileName=1233123.json\r\nguid='+guid+'\r\n'
msg = 'Command=FileUpload\r\n' + fileInfo
conn.send(struct.pack('>h', len(msg)))
conn.send(msg)
data = conn.recv(1024)
print(data)
data = conn.recv(1024)
print("---->")
items = data.split("\r\n")
sid = [x for x in items if x.startswith("FileSession")][0]
print sid
msg = 'Command=FileData\r\n'+sid+'\r\nPosition=0\r\n\r\nABC'
print msg
print conn.send(struct.pack('>h', len(msg)))
print conn.send(msg)
print '---->'
msg = 'Command=FileEof\r\n'+sid+'\r\n'+fileInfo+'FileSize=3\r\n\r\n'
print msg
print conn.send(struct.pack('>h', len(msg)))
print conn.send(msg)
data = conn.recv(2)
print(data)
data = conn.recv(1024)
print(data)
print("---->")

time.sleep(10)
conn.close()

