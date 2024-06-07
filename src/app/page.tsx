'use client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import Webcam from 'react-webcam';

type Device = {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
};

export default function Home() {
  const [img, setImg] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  const webcamRef = useRef<Webcam>(null);

  const handleDevices = useCallback(
    (mediaDevices: Device[]) => {
      const videoInput = mediaDevices.find(
        ({ kind, label }) => kind === 'videoinput' && label
      );

      setDevices(mediaDevices.filter(({ kind }) => kind === 'videoinput'));
      setDeviceId(videoInput?.deviceId || '');
      setDeviceName(videoInput?.label || '');
    },
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const handleChangeDevice = useCallback(
    ({ deviceId, deviceName }: { deviceId: string; deviceName: string }) => {
      setDeviceId(deviceId);
      setDeviceName(deviceName);
    },
    [setDeviceId]
  );

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImg(imageSrc);
    }
  }, [webcamRef]);

  return (
    <main className="flex flex-col justify-center items-center min-h-dvh gap-5 py-10">
      <div className="flex flex-col lg:flex-row gap-10 px-5">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            deviceId: { exact: deviceId },
            width: 390,
            height: 390,
            facingMode: 'user',
          }}
        />
        {img && (
          <div>
            <Image src={img} alt="captured-image" width={390} height={390} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 w-full sm:w-1/2 lg:w-1/4 px-5">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={deviceName} />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device, key) => (
              <option
                key={key}
                role="button"
                value={device.deviceId}
                onClick={() =>
                  handleChangeDevice({
                    deviceId: device.deviceId,
                    deviceName: device.label,
                  })
                }
              >
                {device.label || `Device ${key + 1}`}
              </option>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={capture}>Capture</Button>
        {img && (
          <>
            <Button>
              <a href={img} download="captured-image.jpeg">
                Download
              </a>
            </Button>
            <Button onClick={() => setImg(null)}>Close</Button>
          </>
        )}
      </div>
    </main>
  );
}
