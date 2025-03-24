# @kortoaus/cas-scale

A lightweight TypeScript library for interfacing with CAS PD-II electronic weighing scales over RS-232 serial communication.  
Automatically requests and parses weight data from the scale, using the `serialport` package under the hood.

> ✅ **Tested and confirmed to work with CAS PD-II in ECR-TYPE 2 (STX/ETX protocol mode) only.**

---

## ✨ Features

- ✅ Automatically sends weight request commands (`W`)
- ✅ Parses 7-byte responses from CAS PD-II scale
- ✅ Emits weight in kilograms via callback
- ✅ Works with Node.js & TypeScript
- ✅ Tiny, dependency-light wrapper

---

## 📦 Installation

```bash
npm install @kortoaus/cas-scale
```

---

## 🚀 Usage

```ts
import { initializeScale } from "@kortoaus/cas-scale";

initializeScale("/dev/tty.usbserial-B002EF3X", (weight) => {
  console.log("Weight:", weight, "kg");
});
```

Optional error callback:

```ts
initializeScale(
  "/dev/tty.usbserial-B002EF3X",
  (weight) => {
    console.log("Weight:", weight);
  },
  (err) => {
    console.error("Scale error:", err);
  }
);
```

---

## ⚙️ Scale Setup Instructions

> Ensure your CAS PD-II scale is configured as follows:

| Setting      | Value  |
| ------------ | ------ |
| **ECR Type** | `2`    |
| Baud Rate    | `9600` |
| Data Bits    | `7`    |
| Parity       | `Even` |
| Stop Bits    | `1`    |

To change ECR Type:

1. Turn off the scale
2. Hold `ZERO` + `TARE` and power on to enter setup mode
3. Navigate to `Ecr` setting and set to `2`
4. Use `TARE` (long press) to save and proceed

---

## 🧪 Tested On

- CAS PD-II with firmware version supporting ECR-TYPE 2
- macOS + USB-to-Serial adapter (FTDI, CH340 confirmed)
- Node.js 18+

---

## 📝 License

MIT — © kortoaus
