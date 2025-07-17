import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Home() {
  // Get all sheet metadata to find the first sheet
  const sheets = await api.metrics.getAllSheets();

  if (sheets.length === 0) {
    // If no sheets, show empty state on the root page
    return (
      <div className="bg-background min-h-screen">
        <main className="container mx-auto px-4 py-8">
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
        </main>
      </div>
    );
  }

  // Redirect to the first sheet's URL
  const firstSheetTitle = sheets[0]!.title;
  const encodedTitle = btoa(firstSheetTitle);

  redirect(`/${encodedTitle}`);
}
