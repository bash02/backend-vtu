import { create } from "apisauce";

const expoApi = create({
  baseURL: "https://exp.host/--/api/v2/push",
  headers: { Accept: "application/json" },
});

export async function sendExpoNotification(
  expoPushToken: string,
  title: string,
  body: string
) {
  return expoApi.post("/send", {
    to: expoPushToken,
    sound: "default",
    title,
    body,
  });
}
