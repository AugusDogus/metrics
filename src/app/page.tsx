import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Home() {
  // Get all sheet metadata to find the first sheet
  const sheets = await api.metrics.getAllSheets();

  if (sheets.length === 0) {
    // If no sheets, show empty state
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="text-muted-foreground text-lg font-medium">
            No sheets found
          </h3>
          <p className="text-muted-foreground text-sm">
            Make sure your Google Sheets contain lighthouse metrics data.
          </p>
        </div>
      </div>
    );
  }

  // Redirect to the first sheet's URL
  const firstSheetTitle = sheets[0]!.title;
  const encodedTitle = btoa(firstSheetTitle);

  redirect(`/${encodedTitle}`);
}
