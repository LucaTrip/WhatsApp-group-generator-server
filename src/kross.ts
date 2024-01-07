import axios from "axios";
import { Request, Response } from "express";

export async function kross(req: Request, res: Response) {
  try {
    const dayToCheck = req.query.date;

    const baseUrl = process.env.KROSS_API_URL;

    const getTokenResponse = await axios.post(`${baseUrl}/auth/get-token`, {
      api_key: process.env.KROSS_API_KEY,
      hotel_id: process.env.KROSS_HOTEL_ID,
      username: process.env.KROSS_USERNAME,
      password: process.env.KROSS_PASSWORD,
    });

    const getListResponse = await axios.post(
      `${baseUrl}/reservations/get-list`,
      {
        auth_token: getTokenResponse.data.data.auth_token,
        data: {
          date_reservation_from: `${dayToCheck} 00:00`,
          date_reservation_to: `${dayToCheck} 23:59`,
          cod_reservation_status: "CONF",
          with_rooms: true,
        },
      }
    );

    res.status(200).json(getListResponse.data);
  } catch (error) {
    // console.log(error);
    res.status(500).json(error.message);
  }
}
