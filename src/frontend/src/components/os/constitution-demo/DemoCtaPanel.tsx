import { Link } from "@tanstack/react-router";
import { ArrowRight, Rocket } from "lucide-react";

/**
 * The closing call to action of the guided demonstration. It restates the
 * promise — your organization, your rules — and ends the demo with Deploy Your
 * Own DAO as the single next step.
 */
export default function DemoCtaPanel() {
  return (
    <section
      data-ocid="constitution_demo.cta"
      aria-labelledby="constitution-demo-cta-heading"
      className="gov-cta-panel space-y-4 p-6 text-center sm:p-8"
    >
      <p className="text-stamp opacity-90">Ready to make it real</p>
      <h3
        id="constitution-demo-cta-heading"
        className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
      >
        Your organization. Your rules. Build your DAO.
      </h3>
      <p className="mx-auto max-w-xl text-sm leading-relaxed opacity-90">
        This was a demonstration with fictional data. Deploy your own Nation to
        write your real rules and put them to work.
      </p>
      <div className="flex justify-center">
        <Link
          to="/deploy"
          data-ocid="constitution_demo.deploy_button"
          className="gov-cta-inverse os-focus-ring inline-flex min-h-[44px] max-w-full flex-wrap items-center justify-center gap-2 rounded-lg px-6 py-3 text-center text-sm font-semibold transition-smooth hover:opacity-90"
        >
          <Rocket className="size-4" aria-hidden="true" />
          Deploy Your Own DAO
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
