import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ====== CONFIG ======
const AES_KEY = "4107b4a060fd8533b77ce95fcc9e27ec"; // same as PHP
const AGENCY_UID = "7d343533d514abb11a9afe12b3cd38b6";
const VENDOR_URL = "https://jsgame.live/game/v2";

// ====== AES-256-ECB Encryption ======
function encryptAES256ECB(data: string, key: string): string {
  let keyBin: Buffer;

  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    keyBin = Buffer.from(key, "hex");
  } else {
    const buf = Buffer.alloc(32);
    const inputBuf = Buffer.from(key, "utf8");
    inputBuf.copy(buf, 0, 0, Math.min(inputBuf.length, 32));
    keyBin = buf;
  }

  const cipher = crypto.createCipheriv("aes-256-ecb", keyBin, null);
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  return encrypted.toString("base64");
}

// ====== API Route ======
export async function POST(req: NextRequest) {
  try {
    const input = await req.json();

    // STEP 1: Basic field validation
    const requiredFields = [
      "agency_uid",
      "member_account",
      "timestamp",
      "credit_amount",
      "currency_code",
      "language",
      "platform",
      "home_url",
      "transfer_id",
      "game_uid",
    ];

    for (const field of requiredFields) {
      if (field === "credit_amount") continue; // optional validation
      if (!input[field]) {
        return NextResponse.json(
          { status: false, message: `Missing field: ${field}` },
          { status: 400 }
        );
      }
    }

    // STEP 2: Prepare payload (inner)
    const innerPayload = {
      agency_uid: AGENCY_UID,
      // member_account: input.member_account,
      member_account: 'hfb20f_test1_bm24a',
      game_uid: input.game_uid,
      timestamp: input.timestamp,
      // credit_amount: input.credit_amount,
      credit_amount: (input.credit_amount).toString() || "0",
      currency_code: input.currency_code,
      language: input.language,
      platform: input.platform,
      home_url: input.home_url,
      transfer_id: input.transfer_id,
    };
console.log(innerPayload)
    // STEP 3: Encrypt payload (AES-256-ECB)
    const encryptedPayload = encryptAES256ECB(
      JSON.stringify(innerPayload),
      AES_KEY
    );

    // STEP 4: Create outer wrapper (to vendor)
    const outerPayload = {
      agency_uid: AGENCY_UID,
      timestamp: input.timestamp.toString(),
      payload: encryptedPayload,
    };

    // STEP 5: POST directly to vendor API
    const vendorRes = await fetch(VENDOR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(outerPayload),
    });

    const data = await vendorRes.json();

    // STEP 6: Return vendor response to frontend
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Game launch error:", err);
    return NextResponse.json(
      { status: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
