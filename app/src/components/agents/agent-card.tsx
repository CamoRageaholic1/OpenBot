import { IconDots, IconPencil } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useId } from "react";
import { AbstractAvatar } from "@/components/agents/abstract-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AgentProfile } from "@/lib/agents/queries";
import { cn } from "@/lib/utils";

export function AgentCard({
  agent,
  selected = false,
}: {
  agent: AgentProfile;
  selected?: boolean;
}) {
  const headingId = useId();
  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "flex h-[264px] w-full min-w-0 flex-col gap-3 rounded-2xl border bg-card p-4 text-card-foreground transition-[border-color,box-shadow] hover:border-foreground/25 hover:shadow-sm focus-within:border-ring",
        selected ? "border-ring ring-1 ring-ring/30" : "border-border",
      )}
    >
      <div className="flex items-start gap-2">
        <Link
          to="/agents"
          search={{ agent: agent.id }}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span aria-hidden="true">
            <AbstractAvatar
              name={agent.name}
              seed={agent.avatarSeed}
              size={40}
            />
          </span>
          <div className="min-w-0">
            <h3
              id={headingId}
              className="line-clamp-2 break-words text-sm font-semibold leading-5"
              title={agent.name}
            >
              {agent.name}
            </h3>
            {agent.title ? (
              <p
                className="mt-0.5 truncate text-xs text-muted-foreground"
                title={agent.title}
              >
                {agent.title}
              </p>
            ) : null}
          </div>
        </Link>
        {agent.canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions for ${agent.name}`}
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground"
                />
              }
            >
              <IconDots />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem
                render={<Link to="/agents" search={{ agent: agent.id }} />}
              >
                <IconPencil />
                Manage agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      <p className="line-clamp-3 break-words text-sm leading-5 text-muted-foreground">
        {agent.roleDescription}
      </p>
      <div className="mt-auto flex items-center gap-2">
        <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
          {agent.visibility === "private" ? "Private" : "Public"}
        </span>
      </div>
      <div className="flex items-center gap-2 border-t border-border pt-3">
        <Button
          className="h-9 flex-1 text-xs"
          aria-label={`Start conversation with ${agent.name}`}
          render={<Link to="/channel/new" search={{ agent: agent.id }} />}
        >
          Start conversation
        </Button>
        <Link
          to="/agents"
          search={{ agent: agent.id }}
          aria-label={`View details for ${agent.name}`}
          className="inline-flex h-9 items-center rounded-lg px-2 text-xs font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
