import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "3 saat önce" tarzı Türkçe göreli zaman. */
export function zamanOnce(iso: string): string {
  const saniye = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (saniye < 60) return "az önce";
  const dakika = Math.floor(saniye / 60);
  if (dakika < 60) return `${dakika} dk önce`;
  const saat = Math.floor(dakika / 60);
  if (saat < 24) return `${saat} saat önce`;
  const gun = Math.floor(saat / 24);
  if (gun < 30) return `${gun} gün önce`;
  const ay = Math.floor(gun / 30);
  if (ay < 12) return `${ay} ay önce`;
  return `${Math.floor(ay / 12)} yıl önce`;
}

/** "#" ve boşlukları temizleyip küçük harfe indirger. */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, "")
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, "-")
    .slice(0, 40);
}
