import { MessageSquare } from "lucide-react";

import { workspaceMetric, workspaceTasks } from "@/data/demoData";

/** Example workspace tasks with tags and a metric count. */
export default function WorkspacePanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span
          data-ocid="dashboard.workspace_metric"
          className="font-display text-2xl font-medium text-foreground"
        >
          {workspaceMetric.value}
        </span>
        <span className="text-xs text-muted-foreground">
          {workspaceMetric.label}
        </span>
      </div>
      <ul data-ocid="dashboard.workspace_tasks" className="flex flex-col gap-3">
        {workspaceTasks.map((task, index) => (
          <li
            key={task.id}
            data-ocid={`dashboard.workspace_task.${index + 1}`}
            className="ledger-row flex items-start justify-between gap-3 pb-3 last:border-b-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">{task.title}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="size-3.5" aria-hidden="true" />
              {task.count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
