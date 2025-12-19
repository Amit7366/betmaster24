import { NextResponse } from "next/server";

interface ApiResponse {
    message?: string;
    error?: string;
    [key: string]: any;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch("https://txserver.site/newGameLaunch.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        // Try parsing JSON safely
        const data: ApiResponse | null = await response.json().catch(() => null);

        // Handle API error responses
        if (!response.ok) {
            return NextResponse.json(
                {
                    error: data?.message || data?.error || `Remote server error: ${response.statusText}`,
                    status: response.status,
                },
                { status: response.status }
            );
        }

        // ✅ Success
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Proxy error:", error);

        // Network or unexpected errors
        return NextResponse.json(
            {
                error: error?.message || "Something went wrong while launching the game",
            },
            { status: 500 }
        );
    }
}


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