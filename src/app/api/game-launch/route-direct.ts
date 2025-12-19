import { NextResponse } from "next/server";
import CryptoJS from "crypto-js";

const AES_KEY = "4b5dd9df7e1f4a1c64c937ba38629c0f"; // Must be 32 chars for AES-256

function encryptPayload(payload: any) {
  const key = CryptoJS.enc.Utf8.parse(AES_KEY);

  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // Base64 ciphertext
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Extract *your* original request payload
    const {
      agency_uid,
      game_uid,
      member_account,
      timestamp,
      credit_amount,
      currency_code,
      language,
      platform,
      home_url,
      transfer_id,
    } = body;

    // 2. Build inner payload (the part to encrypt)
    const innerPayload = {
      agency_uid,
      game_uid,
      member_account,
      credit_amount,
      currency_code,
      language,
      platform,
      home_url,
      transfer_id,
    };

    // 3. Encrypt inner payload
    const encryptedPayload = encryptPayload(innerPayload);

    // 4. Final request object according to the API doc
    const finalRequest = {
      agency_uid,
      timestamp,
      payload: encryptedPayload,
    };

    // 5. Send to third-party API
    const response = await fetch("https://jsgame.live/game/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(finalRequest),
    });

    const result = await response.json().catch(() => null);

    // Forward result
    return NextResponse.json(result ?? {}, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Server error",
      },
      { status: 500 }
    );
  }
}



// import { NextResponse } from "next/server";

// interface ApiResponse {
//   message?: string;
//   error?: string;
//   [key: string]: any;
// }

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const response = await fetch("https://loginapi.24gameapi.org/api/gameLaunch.php", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     // Try parsing JSON safely
//     const data: ApiResponse | null = await response.json().catch(() => null);

//     // Handle API error responses
//     if (!response.ok) {
//       return NextResponse.json(
//         {
//           error: data?.message || data?.error || `Remote server error: ${response.statusText}`,
//           status: response.status,
//         },
//         { status: response.status }
//       );
//     }

//     // ✅ Success
//     return NextResponse.json(data, { status: 200 });
//   } catch (error: any) {
//     console.error("Proxy error:", error);

//     // Network or unexpected errors
//     return NextResponse.json(
//       {
//         error: error?.message || "Something went wrong while launching the game",
//       },
//       { status: 500 }
//     );
//   }
// }


// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const response = await fetch("https://member.24serverhost.com/api/gameLaunch.php", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     const data = await response.json();

//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {
//     console.error("Proxy error:", error);
//     return NextResponse.json({ error: "Failed to launch game" }, { status: 500 });
//   }
// }

