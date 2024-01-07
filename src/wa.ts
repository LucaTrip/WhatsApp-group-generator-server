import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Client, LocalAuth, RemoteAuth } from "whatsapp-web.js";
import { IKrossReservationUser, IUser } from "./models/models";
import {
  SocketEmitEvents,
  SocketListenEvents,
  WaListenEvents,
} from "./models/types";
import getWelcomeWaGroupMessage from "./utils/utils";

const sessionName = "umbrianconcierge";

interface ICreateWhatsAppGroup {
  groupName: string;
  adminList: IUser[];
  guestInfo: IKrossReservationUser;
}

export async function createWhatsappSession(
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  store: any
) {
  /* const waClient = new Client({
    puppeteer: {
      args: ["--no-sandbox"],
    },
    authStrategy: new RemoteAuth({
      store,
      clientId: sessionName,
      backupSyncIntervalMs: 300000,
    }),
  }); */

  const waClient = new Client({});

  waClient.on(WaListenEvents.remote_session_saved, () => {
    console.log("remote session exist");
    socket.emit(SocketEmitEvents.wa_ready);
  });

  waClient.on(WaListenEvents.qr, (qr) => {
    console.log("generated qr-code");
    socket.emit(SocketEmitEvents.wa_qrcode, qr);
  });

  waClient.on(WaListenEvents.authenticated, async () => {
    console.log("authenticated on WhatsApp");
    socket.emit(SocketEmitEvents.wa_authenticated, true);
  });

  waClient.on(WaListenEvents.disconnected, async () => {
    console.log("disconnected from WhatsApp");
    socket.emit(SocketEmitEvents.wa_authenticated, false);
  });

  waClient.on(WaListenEvents.ready, () => {
    console.log("Client is ready!");
    socket.emit(SocketEmitEvents.wa_ready);
  });

  socket.on(
    SocketListenEvents.wa_create_group,
    ({ groupName, adminList, guestInfo }: ICreateWhatsAppGroup) => {
      console.log("creating whatsapp group");

      waClient
        .createGroup(groupName, [
          ...adminList.map(({ phoneNumber }: any) => {
            const number = phoneNumber.substring(1);
            return `${number}@c.us`;
          }),
          `${guestInfo.phone.trim().substring(1)}@c.us`,
        ])
        .then((res: any) => {
          console.log("whatsapp group created!", res);
          socket.emit(SocketEmitEvents.wa_group_created, true);

          return waClient.sendMessage(
            res.gid._serialized,
            getWelcomeWaGroupMessage(
              guestInfo.rooms[0].name_room_type,
              guestInfo.label,
              adminList,
              guestInfo.tag
            )
          );
        })
        .then((res) => {
          socket.emit(SocketEmitEvents.wa_group_created, true);
        })
        .catch((err) => {
          console.log("whatsapp group creation error", err);
          socket.emit(SocketEmitEvents.wa_group_created, false);
        });
    }
  );

  waClient.initialize();
}
