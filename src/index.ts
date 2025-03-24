import { ByteLengthParser, ReadlineParser, SerialPort } from "serialport";

export function initializeScale(
  path: string,
  onWeight: (weight: number) => void,
  onError?: (error: unknown) => void
) {
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

  scale.on("data", (data) => {
    const lastBuffer = dataline[dataline.length - 1];
    if (
      lastBuffer &&
      lastBuffer.toString() === Buffer.from("0d", "hex").toString()
    ) {
      const second = dataline[1].toString();
      const isError = second === Buffer.from("3f", "hex").toString();

      if (isError) {
        onWeight(0); // 무게 읽기 실패는 0으로 처리
      } else {
        const weight = dataline
          .map((bf) => bf.toString())
          .slice(1, 6)
          .join("")
          .replaceAll(",", "");

        onWeight(Number(weight) / 1000); // kg 단위
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

  // 주기적으로 무게 요청
  setInterval(() => {
    scale.write("W", "ascii");
  }, 1000);
}
