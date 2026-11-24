import { ClipboardList, Flag, ListChecks, TrendingUp } from "lucide-react";

import OsAppPage from "@/components/os/OsAppPage";
import RecordAttachments from "@/components/os/attachments/RecordAttachments";
import { projectTarget } from "@/components/os/attachments/attachmentTargets";
import { sampleAttachmentsFor } from "@/components/os/attachments/sampleAttachments";
import { useActiveNation } from "@/components/os/attachments/useActiveNation";
import PreviewBanner from "@/components/os/preview/PreviewBanner";
import PreviewCapabilities from "@/components/os/preview/PreviewCapabilities";
import type { PreviewCapability } from "@/components/os/preview/PreviewCapabilities";
import PreviewExampleCard from "@/components/os/preview/PreviewExampleCard";
import { sampleProjects } from "@/data/sampleNation";

const capabilities: PreviewCapability[] = [
  {
    key: "tracking",
    title: "Project tracking",
    description:
      "Keep every research and community initiative in one place, with an owner and a current stage.",
    icon: ClipboardList,
  },
  {
    key: "milestones",
    title: "Milestones",
    description:
      "Break a project into dated milestones so the community can see what is due and what is done.",
    icon: Flag,
  },
  {
    key: "tasks",
    title: "Task assignment",
    description:
      "Assign tasks to members and track who is responsible for each piece of work.",
    icon: ListChecks,
  },
  {
    key: "progress",
    title: "Progress reporting",
    description:
      "Report progress against each milestone and share a plain-language status with the Nation.",
    icon: TrendingUp,
  },
];

/**
 * The Projects app (Preview): a clearly labelled preview of the intended
 * project-tracking feature, with illustrative example content.
 */
export default function ProjectsAppPage() {
  const { nationId, readOnly } = useActiveNation();

  return (
    <OsAppPage appKey="projects">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-stamp text-accent">Projects · Preview</p>
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Research and initiatives
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The Nation's research and community projects and where each one
            stands.
          </p>
          <div className="rule-accent" />
        </header>

        <PreviewBanner
          appKey="projects"
          appLabel="Projects"
          summary="The Projects app will let a Nation track its research and community initiatives from first idea to completion."
        />

        <PreviewCapabilities
          appKey="projects"
          heading="What this app will do"
          capabilities={capabilities}
        />

        <section
          data-ocid="os.preview.examples.projects"
          aria-label="Illustrative example projects"
          className="space-y-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
              Illustrative examples
            </h3>
            <span className="text-stamp text-muted-foreground">
              Not real projects
            </span>
          </div>
          <ul className="space-y-3">
            {sampleProjects.map((project, index) => {
              const target = projectTarget(BigInt(project.id));
              return (
                <PreviewExampleCard
                  key={project.id}
                  appKey="projects"
                  index={index + 1}
                  title={project.title}
                  description={project.description}
                  meta={`Example stage · ${project.status}`}
                >
                  <RecordAttachments
                    nation={nationId}
                    target={target}
                    readOnly={readOnly}
                    sampleAttachments={sampleAttachmentsFor(target)}
                  />
                </PreviewExampleCard>
              );
            })}
          </ul>
        </section>
      </div>
    </OsAppPage>
  );
}
