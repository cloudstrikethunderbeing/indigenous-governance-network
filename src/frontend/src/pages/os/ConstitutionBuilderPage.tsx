import OsAppPage from "@/components/os/OsAppPage";
import GuidedConstitutionDemo from "@/components/os/constitution-demo/GuidedConstitutionDemo";

/**
 * The guided "Build Your DAO Constitution" demonstration, reachable from inside
 * Governance. It is a self-contained, clearly-labelled demo: a visitor walks
 * through six fictional scenarios that show how governance choices become
 * permissions, voting and membership workflows, then ends at Deploy Your Own
 * DAO. Nothing is saved and no real organization is affected.
 */
export default function ConstitutionBuilderPage() {
  return (
    <OsAppPage appKey="constitution">
      <GuidedConstitutionDemo />
    </OsAppPage>
  );
}
