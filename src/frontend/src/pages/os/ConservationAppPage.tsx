import { Droplets, FileBarChart, Leaf, PawPrint } from "lucide-react";

import OsAppPage from "@/components/os/OsAppPage";
import PreviewBanner from "@/components/os/preview/PreviewBanner";
import PreviewCapabilities from "@/components/os/preview/PreviewCapabilities";
import type { PreviewCapability } from "@/components/os/preview/PreviewCapabilities";
import PreviewExampleCard from "@/components/os/preview/PreviewExampleCard";
import { sampleConservationRecords } from "@/data/sampleNation";

const capabilities: PreviewCapability[] = [
  {
    key: "monitoring",
    title: "Land and water monitoring",
    description:
      "Record observations for the Nation's lands and waters, from water quality to forest health.",
    icon: Droplets,
  },
  {
    key: "species",
    title: "Species and habitat records",
    description:
      "Keep community-controlled records of species, habitats and protected areas.",
    icon: PawPrint,
  },
  {
    key: "stewardship",
    title: "Stewardship reporting",
    description:
      "Turn monitoring into plain-language stewardship reports the community can review.",
    icon: FileBarChart,
  },
  {
    key: "protection",
    title: "Protected areas",
    description:
      "Mark areas under community stewardship and track their protection status over time.",
    icon: Leaf,
  },
];

/**
 * The Conservation app (Preview): a clearly labelled preview of the intended
 * land and water stewardship feature, with illustrative example content.
 */
export default function ConservationAppPage() {
  return (
    <OsAppPage appKey="conservation">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Conservation · Preview</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Land and water stewardship
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Stewardship records for the Nation's lands, waters and protected
            areas.
          </p>
          <div className="rule-accent" />
        </header>

        <PreviewBanner
          appKey="conservation"
          appLabel="Conservation"
          summary="The Conservation app will let a Nation monitor its lands and waters and keep community-controlled records of species, habitats and stewardship."
        />

        <PreviewCapabilities
          appKey="conservation"
          heading="What this app will do"
          capabilities={capabilities}
        />

        <section
          data-ocid="os.preview.examples.conservation"
          aria-label="Illustrative example conservation records"
          className="space-y-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
              Illustrative examples
            </h3>
            <span className="text-stamp text-muted-foreground">
              Not real records
            </span>
          </div>
          <ul className="space-y-3">
            {sampleConservationRecords.map((record, index) => (
              <PreviewExampleCard
                key={record.id}
                appKey="conservation"
                index={index + 1}
                title={record.title}
                description={record.description}
                meta={`Example status · ${record.status}`}
              />
            ))}
          </ul>
        </section>
      </div>
    </OsAppPage>
  );
}
