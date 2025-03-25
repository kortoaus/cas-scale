import { ByteLengthParser, ReadlineParser, SerialPort } from "serialport";
import type { PortInfo } from "@serialport/bindings-interface";

export function initializeScale(
  path: string,
  onWeight: (weight: number) => void,
  onError?: (error: unknown) => void
): { close: () => void } {
  const scale = new SerialPort({
    path,
    baudRate: 9600,
    dataBits: 7,
    stopBits: 1,
    parity: "even",
  });

  scale.pipe(new ReadlineParser({ delimiter: "\r\n" }));
  scale.pipe(new ByteLengthParser({ length: 7 }));

  let dataline: Buffer[] = [];
  let interval: NodeJS.Timeout;

  scale.on("data", (data) => {
    const lastBuffer = dataline[dataline.length - 1];
    if (
      lastBuffer &&
      lastBuffer.toString() === Buffer.from("0d", "hex").toString()
    ) {
      const second = dataline[1].toString();
      const isError = second === Buffer.from("3f", "hex").toString();

      if (isError) {
        onWeight(0);
      } else {
        const weight = dataline
          .map((bf) => bf.toString())
          .slice(1, 6)
          .join("")
          .replaceAll(",", "");

        onWeight(Number(weight) / 1000);
      }

      dataline = [];
    }

    let sliced = data.toString().split("");
    sliced = sliced.map((s: string) => Buffer.from(s));
    sliced.forEach((s: Buffer) => dataline.push(s));
  });

  scale.on("error", (err) => {
    onError?.(err);
  });

  // 무게 요청 인터벌 시작
  interval = setInterval(() => {
    scale.write("W", "ascii");
  }, 1000);

  // 🔧 close 함수 추가
  const close = () => {
    clearInterval(interval);
    if (scale.isOpen) {
      scale.close((err) => {
        if (err) {
          console.error("Failed to close serial port:", err);
        }
      });
    }
  };

  return { close };
}

export async function listSerialPorts(): Promise<PortInfo[]> {
  const ports = await SerialPort.list();

  // 필요하면 필터링 추가 가능:
  // return ports.filter((port) => port.manufacturer?.toLowerCase().includes("ftdi"));

  return ports;
}
