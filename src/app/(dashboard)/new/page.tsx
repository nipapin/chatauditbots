import { DashboardHeader } from "@/components/dashboard/layout/DashboardHeader";
import { CreateBotPageContent } from "@/components/dashboard/bots/CreateBotPageContent";

export default function NewBotPage() {
  return (
    <>
      <DashboardHeader />
      <div className="dash-app">
        <div className="dash-content" style={{ maxWidth: 640, margin: "0 auto" }}>
          <CreateBotPageContent />
        </div>
      </div>
    </>
  );
}
