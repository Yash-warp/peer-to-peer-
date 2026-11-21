"use client";

import React, { useState } from "react";
import { X, Copy, Check, QrCode, Smartphone, ExternalLink } from "lucide-react";
import { formatRupees, generateUpiUrl } from "@/lib/utils";

interface UpiQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  upiId: string;
  payeeName: string;
  amount: number;
  itemTitle: string;
  onConfirmPaid: () => void;
}

export function UpiQRCodeModal({
  isOpen,
  onClose,
  upiId,
  payeeName,
  amount,
  itemTitle,
  onConfirmPaid,
}: UpiQRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const upiIntentUrl = generateUpiUrl({
    upiId,
    payeeName,
    amount,
    itemTitle,
  });

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(
    upiIntentUrl
  )}`;

  function handleCopy() {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b101f] border border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center text-slate-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-11 h-11 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 rounded-2xl mb-3 shadow-sm shadow-cyan-500/10">
          <QrCode className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-extrabold text-white">Scan UPI QR Code</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Scan with GPay, PhonePe, Paytm, or BHIM
        </p>

        {/* Deposit Badge */}
        <div className="my-3 py-2 px-3.5 bg-cyan-950/40 border border-cyan-500/20 rounded-xl inline-block">
          <span className="text-xs font-semibold text-cyan-300">Refundable Deposit: </span>
          <span className="text-base font-black text-cyan-200">{formatRupees(amount)}</span>
        </div>

        {/* QR Code Container */}
        <div className="flex justify-center my-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-lg shadow-black/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt="UPI Payment QR Code"
              width={190}
              height={190}
              className="rounded-xl object-contain"
            />
          </div>
        </div>

        {/* Payee Info */}
        <div className="bg-[#070b16] border border-white/[0.06] rounded-xl p-3 text-left mb-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Payee Name:</span>
            <span className="font-bold text-white">{payeeName}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">UPI ID:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-cyan-400">
              <span className="truncate max-w-[140px]">{upiId}</span>
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                title="Copy UPI ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <a
            href={upiIntentUrl}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-cyan-300 bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Open in UPI App (Mobile Only)</span>
            <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
          </a>

          <button
            onClick={() => {
              onConfirmPaid();
              onClose();
            }}
            className="btn-cyan w-full py-2.5 px-4 rounded-xl text-xs transition-all"
          >
            I Have Completed The Payment
          </button>
        </div>
      </div>
    </div>
  );
}
