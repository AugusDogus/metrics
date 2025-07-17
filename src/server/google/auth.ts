import { JWT } from "google-auth-library";
import { env } from "~/env";

export const auth = new JWT({
  email: env.CLIENT_EMAIL,
  key: env.PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ],
});
