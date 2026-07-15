import { Client, IMessage } from "@stomp/stompjs";

let client: Client | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

function getWebSocketUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  const baseUrl = apiUrl.replace("/api", "");
  return baseUrl.replace(/^http/, "ws") + "/ws";
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function connect(): Client {
  if (client?.active) return client;

  const token = getAuthToken();
  client = new Client({
    brokerURL: getWebSocketUrl(),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    debug: () => {},
    reconnectDelay: 5000,
    onConnect: () => {
      reconnectAttempts = 0;
    },
    onStompError: () => {
      reconnectAttempts++;
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        client?.deactivate();
      }
    },
  });

  client.activate();
  return client;
}

export function disconnect() {
  client?.deactivate();
  client = null;
}

export function subscribeToUserQueue(
  destination: string,
  callback: (message: IMessage) => void
) {
  const stompClient = connect();
  return stompClient.subscribe(`/user/${destination}`, callback);
}

export function subscribeToTopic(
  topic: string,
  callback: (message: IMessage) => void
) {
  const stompClient = connect();
  return stompClient.subscribe(topic, callback);
}

export function send(destination: string, body?: object) {
  const stompClient = connect();
  stompClient.publish({
    destination: `/app${destination}`,
    body: body ? JSON.stringify(body) : "",
  });
}
