import api from "@/lib/api";
import { unwrap } from "@/lib/utils";

interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

const serviceWorkerUrl =
  process.env.NODE_ENV === "production" ? "/sw.js" : "/push-sw.js";

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const registration = await navigator.serviceWorker.register(serviceWorkerUrl);
  return registration.pushManager.getSubscription();
}

export async function enablePushNotifications(): Promise<PushSubscription> {
  if (!pushSupported()) throw new Error("Push notifications are not supported");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Push permission was not granted");

  const response = await api.get<{ publicKey: string | null }>(
    "/notifications/push/public-key",
  );
  const publicKey = unwrap<{ publicKey: string | null }>(response).publicKey;
  if (!publicKey) throw new Error("Push notifications are not configured");

  const registration = await navigator.serviceWorker.register(serviceWorkerUrl);
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        publicKey,
      ) as unknown as ArrayBuffer,
    }));
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Browser returned an incomplete push subscription");
  }

  try {
    await api.post("/notifications/push/subscriptions", {
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: navigator.userAgent,
    } satisfies PushSubscriptionPayload & { user_agent: string });
  } catch (error) {
    if (!existing) await subscription.unsubscribe();
    throw error;
  }
  return subscription;
}

export async function disablePushNotifications(): Promise<void> {
  const subscription = await getPushSubscription();
  if (!subscription) return;
  await api.delete("/notifications/push/subscriptions", {
    data: { endpoint: subscription.endpoint },
  });
  await subscription.unsubscribe();
}
