import zlib, struct, os
def tri(px,py,a,b,c):
    def s(p1,p2,p3): return (p1[0]-p3[0])*(p2[1]-p3[1])-(p2[0]-p3[0])*(p1[1]-p3[1])
    p=(px,py); d1,d2,d3=s(p,a,b),s(p,b,c),s(p,c,a)
    return not ((d1<0 or d2<0 or d3<0) and (d1>0 or d2>0 or d3>0))
def bg(u,v):
    t=(u+v)/2
    return (int(255*(1-t)+92*t),int(120*(1-t)+110*t),int(150*(1-t)+255*t))
def pixel(u,v):
    base=bg(u,v)
    r=.06; dx=max(abs(u-.5)-(.2-r),0); dy=max(abs(v-.5)-(.2-r),0)
    if dx*dx+dy*dy<=r*r:
        if (u-.58)**2+(v-.42)**2<.04**2: return base
        if tri(u,v,(.31,.69),(.45,.47),(.59,.69)) or tri(u,v,(.45,.69),(.57,.54),(.70,.69)): return base
        return (255,255,255)
    return base
size=1024; rows=[]
for y in range(size):
    row=bytearray([0])
    for x in range(size):
        acc=[0,0,0]
        for ox,oy in ((.25,.25),(.75,.75)):
            c=pixel((x+ox)/size,(y+oy)/size)
            for i in range(3): acc[i]+=c[i]
        row+=bytes(a//2 for a in acc)
    rows.append(bytes(row))
def ch(t,d):
    c=struct.pack('>I',len(d))+t+d
    return c+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
os.makedirs('assets',exist_ok=True)
open('assets/icon-only.png','wb').write(b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',size,size,8,2,0,0,0))+ch(b'IDAT',zlib.compress(b''.join(rows),9))+ch(b'IEND',b''))
