"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { almarai } from "@/lib/fonts";


export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#D7CCC8] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <svg
          className="w-20 h-20 mx-auto mb-6 text-[#6D4C41]"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 10 C35 30 20 55 20 70 C20 85 35 95 50 95 C65 95 80 85 80 70 C80 55 65 30 50 10Z"
            fill="#558B2F"
            opacity="0.8"
          />
          <path
            d="M50 25 C40 40 30 60 30 70 C30 80 40 88 50 88 C60 88 70 80 70 70 C70 60 60 40 50 25Z"
            fill="#2E7D32"
            opacity="0.6"
          />
          <path
            d="M50 40 C45 50 40 62 40 68 C40 76 45 80 50 80 C55 80 60 76 60 68 C60 62 55 50 50 40Z"
            fill="#D7CCC8"
            opacity="0.9"
          />
          <line x1="50" y1="10" x2="50" y2="5" stroke="#6D4C41" strokeWidth="3" strokeLinecap="round" />
          <line x1="50" y1="5" x2="45" y2="0" stroke="#6D4C41" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="5" x2="55" y2="0" stroke="#6D4C41" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <h1 className={`${almarai.className} text-8xl font-bold text-[#3E2723] mb-4`}>
          404
        </h1>

        <h2 className={`${almarai.className} fluid-2xl font-bold text-[#6D4C41] mb-3`}>
          Page Not Found
        </h2>
        <p className="text-[#6D4C41] fluid-lg mb-1">الصفحة غير موجودة</p>

        <p className="text-[#616161] mt-4 mb-8 leading-relaxed">
          The page you are looking for might have been removed or is temporarily
          unavailable.
        </p>

        <Link href="/">
          <Button className="bg-[#6D4C41] hover:bg-[#3E2723] text-white px-8 py-6 fluid-base">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
