import OsAppPage from "@/components/os/OsAppPage";
import SavingsEstimator from "@/components/os/savings/SavingsEstimator";
import SavingsMessaging from "@/components/os/savings/SavingsMessaging";

/**
 * The Cost Savings app: the cost-savings narrative and a self-service
 * estimator where a Nation sets the assumptions behind each area and receives
 * an estimated annual saving, with the formula shown plainly.
 */
export default function SavingsAppPage() {
  return (
    <OsAppPage appKey="savings">
      <div className="space-y-8">
        <div className="space-y-2">
          <p className="text-stamp text-accent">Cost Savings</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Estimate what self-hosting could save
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Integrated digital governance can reduce duplicated administrative
            work. Set the assumptions behind each area to see an estimated
            annual saving — the inputs and the formula are shown in full.
          </p>
        </div>

        <SavingsMessaging />
        <SavingsEstimator />
      </div>
    </OsAppPage>
  );
}
