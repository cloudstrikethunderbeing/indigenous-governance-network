import { Linkedin, X as XIcon } from "lucide-react";

export default function DiscussSection() {
  return (
    <section
      data-ocid="section.discuss"
      className="bg-card border-b border-hairline"
    >
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24 text-center">
        <p className="text-stamp text-accent">Get In Touch</p>
        <div className="rule-accent mx-auto mt-4 mb-6" />
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
          Discuss the Raise
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          Questions, feedback, or interest in partnering — reach out directly.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.linkedin.com/in/justinjackbear"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="link.discuss_linkedin"
            className="inline-flex items-center gap-2 rounded-md border border-input px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-smooth hover:border-primary hover:text-primary hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            Discuss on LinkedIn
          </a>
          <a
            href="https://x.com/jackbearsupply"
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="link.discuss_x"
            className="inline-flex items-center gap-2 rounded-md border border-input px-6 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-smooth hover:border-primary hover:text-primary hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <XIcon className="h-4 w-4" aria-hidden="true" />
            Discuss on X
          </a>
        </div>
      </div>
    </section>
  );
}
