// services/auth.services.ts
import { authKey } from "@/constants/authKey";
import { setToLocalStorage } from "@/utils/local-storage";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

type DecodedUser = {
  userName: string;
  role: string;
  [key: string]: any;
};

export const loginUser = async (userName: string, password: string) => {
  const res = await fetch("https://bm24api.xyz/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, password }),
  });
  //   console.log(res)
  if (!res.ok) throw new Error("Login failed");

  const data = await res.json();

  const token = data.data.accessToken;
  console.log(token);
  setToLocalStorage(authKey, token);
  if (!token) throw new Error("Token not found");

  const user = jwtDecode<DecodedUser>(token);
  console.log(user)
  return { accessToken: token, user };
};

export const refreshAccessToken = async () => {
  const res = await fetch("https://bm24api.xyz/api/v1/refresh-token");
  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  const user = jwtDecode<DecodedUser>(data.accessToken);

  return { accessToken: data.accessToken, user };
};
