import QRCode from "qrcode";

/** PNG data URI for a QR code of `url`, using the style of the promotional card. */
export function qrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M", margin: 4, scale: 6,
    color: { dark: "#000000", light: "#ffffff" },
  });
}
