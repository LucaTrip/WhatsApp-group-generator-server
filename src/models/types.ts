export enum SocketEmitEvents {
  "wa_ready" = "wa_ready",
  "wa_qrcode" = "wa_qrcode",
  "wa_authenticated" = "wa_authenticated",
  "wa_group_created" = "wa_group_created",
}

export enum SocketListenEvents {
  "connection" = "connection",
  "disconnect" = "disconnect",
  "wa_create_group" = "wa_create_group",
}

export enum WaListenEvents {
  "qr" = "qr",
  "ready" = "ready",
  "disconnected" = "disconnected",
  "authenticated" = "authenticated",
  "remote_session_saved" = "remote_session_saved",
}
