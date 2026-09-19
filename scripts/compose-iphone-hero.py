"""Rebuild the supplied iPhone film with the supplied PRO artwork behind it.
Requires Python: opencv-python, numpy, imageio-ffmpeg. No runtime web dependency.
Run from repository root: python3 scripts/compose-iphone-hero.py
"""
from pathlib import Path
import subprocess
import cv2
import numpy as np
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / 'public/media/iphone-18-pro'
KEYS = np.array([
    [0,305,207,950,760], [1,354,205,939,760], [1.5,380,200,891,760],
    [2,440,201,858,760], [2.5,482,207,824,760], [3,501,213,788,757],
    [3.5,523,218,770,717], [4,534,220,744,693],
    [4.5,535,227,735,683], [5.1,538,229,734,680],
])


def encoder(name, width, height, fps):
    return subprocess.Popen([
        imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error',
        '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{width}x{height}',
        '-r', str(fps), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'slow',
        '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
        str(MEDIA / name),
    ], stdin=subprocess.PIPE)


def main():
    cv2.setNumThreads(2)
    capture = cv2.VideoCapture(str(MEDIA / 'source.mp4'))
    fps = capture.get(cv2.CAP_PROP_FPS)
    background = cv2.resize(cv2.imread(str(MEDIA / 'background.png')), (1280,720))
    mobile_bg = np.zeros((900,720,3), np.uint8)
    mobile_bg[100:505] = cv2.resize(background,(720,405))
    desktop_encoder = encoder('hero.mp4',1280,720,fps)
    mobile_encoder = encoder('hero-mobile.mp4',720,900,fps)
    mobile_transform = np.float32([[1.15,0,(720-1280*1.15)/2],[0,1.15,0]])
    index = 0
    previous_gray = None
    previous_distance = None
    grid_x, grid_y = np.meshgrid(np.arange(1280, dtype=np.float32), np.arange(720, dtype=np.float32))
    try:
        while True:
            ok, frame = capture.read()
            if not ok: break
            time = index/fps
            x,y,right,bottom = [int(np.interp(time,KEYS[:,0],KEYS[:,j])) for j in range(1,5)]
            mask = np.zeros((720,1280),np.uint8)
            mask[max(0,y-22):min(bottom+30,720),max(0,x-22):min(right+22,1280)] = cv2.GC_PR_FGD
            width = right-x
            mask[y+40:min(bottom-30,720),x+int(width*.25):right-int(width*.2)] = cv2.GC_FGD
            cv2.setRNGSeed(42)
            cv2.grabCut(frame,mask,None,np.zeros((1,65)),np.zeros((1,65)),4,cv2.GC_INIT_WITH_MASK)
            matte = np.uint8((mask==1)|(mask==3))*255
            contours,_ = cv2.findContours(matte,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
            matte[:]=0
            cv2.drawContours(matte,[max(contours,key=cv2.contourArea)],-1,255,-1)
            # Remove single-pixel notches without blurring the phone's lenses or body.
            matte = cv2.morphologyEx(matte, cv2.MORPH_CLOSE, np.ones((3,3),np.uint8))
            matte = cv2.morphologyEx(matte, cv2.MORPH_OPEN, np.ones((3,3),np.uint8))
            distance = cv2.distanceTransform(matte,cv2.DIST_L2,5) - cv2.distanceTransform(255-matte,cv2.DIST_L2,5)
            gray = cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
            if previous_gray is not None:
                # Backward optical flow aligns the preceding matte to this frame.
                # This reduces edge chatter without trailing a moving silhouette.
                flow = cv2.calcOpticalFlowFarneback(gray,previous_gray,None,.5,3,21,3,5,1.2,0)
                aligned = cv2.remap(previous_distance,grid_x+flow[:,:,0],grid_y+flow[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
                reliable = np.abs(aligned-distance) < 5
                distance = np.where(reliable,.7*distance+.3*aligned,distance).astype(np.float32)
            previous_gray, previous_distance = gray, distance
            distance = cv2.GaussianBlur(distance,(0,0),.85)
            alpha = np.clip(.5+distance/2.4,0,1)

            # Recover edge color from the original dark backdrop before compositing.
            # Simply feathering already antialiased pixels creates a dark cutout rim.
            dx = cv2.Sobel(distance,cv2.CV_32F,1,0,ksize=3)
            dy = cv2.Sobel(distance,cv2.CV_32F,0,1,ksize=3)
            length = np.maximum(np.sqrt(dx*dx+dy*dy),.001)
            old_bg = cv2.remap(frame,grid_x-6*dx/length,grid_y-6*dy/length,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
            a = alpha[:,:,None]
            recovered = np.clip((frame.astype(np.float32)-(1-a)*old_bg)/np.maximum(a,.15),0,255)
            edge = ((alpha>.02)&(alpha<.98))[:,:,None]
            foreground = np.where(edge,recovered,frame).astype(np.float32)

            def composite(fg, opacity, plate):
                # A restrained soft shadow and reflected plate light join the two planes.
                shifted = cv2.warpAffine(opacity,np.float32([[1,0,0],[0,1,3]]),(plate.shape[1],plate.shape[0]))
                shadow = cv2.GaussianBlur(shifted,(0,0),5)*.16
                base = plate.astype(np.float32)*(1-shadow[:,:,None])
                rim = np.maximum(opacity-cv2.erode(opacity,np.ones((5,5),np.uint8)),0)*.09
                reflection = cv2.GaussianBlur(plate.astype(np.float32),(0,0),5)
                lit = fg*(1-rim[:,:,None])+reflection*rim[:,:,None]
                return np.uint8(np.clip(lit*opacity[:,:,None]+base*(1-opacity[:,:,None]),0,255))

            desktop = composite(foreground,alpha,background)
            mobile_alpha = cv2.warpAffine(alpha,mobile_transform,(720,900))
            mobile_phone = cv2.warpAffine(foreground,mobile_transform,(720,900))
            mobile = composite(mobile_phone,mobile_alpha,mobile_bg)
            if index == 0:
                cv2.imwrite(str(MEDIA/'poster-start.jpg'),desktop,[cv2.IMWRITE_JPEG_QUALITY,94])
                cv2.imwrite(str(MEDIA/'poster-mobile-start.jpg'),mobile,[cv2.IMWRITE_JPEG_QUALITY,94])
            desktop_encoder.stdin.write(desktop.tobytes())
            mobile_encoder.stdin.write(mobile.tobytes())
            index += 1
            if index % 24 == 0: print(f'Composited {index} frames',flush=True)
        cv2.imwrite(str(MEDIA/'poster.jpg'),desktop,[cv2.IMWRITE_JPEG_QUALITY,94])
        cv2.imwrite(str(MEDIA/'poster-mobile.jpg'),mobile,[cv2.IMWRITE_JPEG_QUALITY,94])
    finally:
        capture.release()
        for process in [desktop_encoder,mobile_encoder]:
            process.stdin.close()
            if process.wait() != 0: raise RuntimeError('Video encoding failed')
    print(f'Done: {index} frames, {index/fps:.2f} seconds',flush=True)

if __name__ == '__main__': main()
