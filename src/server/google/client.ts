import { GoogleSpreadsheet } from "google-spreadsheet";
import { env } from "~/env";
import { auth } from "~/server/google/auth";

export const doc = new GoogleSpreadsheet(env.SPREADSHEET_ID, auth);
