import { afterAll, afterEach, beforeAll, expect, test } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { z } from "zod";
import { AgentCard } from "@/components/agents/agent-card";
import type { AgentProfile } from "@/lib/agents/queries";

beforeAll(() => GlobalRegistrator.register());
afterEach(cleanup);
afterAll(() => GlobalRegistrator.unregister());

function renderCard(overrides: Partial<AgentProfile> = {}) {
  const agent: AgentProfile = {
    id: "research-agent",
    name: "Research partner",
    title: "Company knowledge",
    roleDescription: "Find answers in company documents with citations.",
    avatarSeed: "research",
    visibility: "private",
    endpoint: null,
    builtIn: true,
    hasAuth: false,
    hasCallbackToken: false,
    hidden: false,
    systemOwned: false,
    canManage: true,
    mine: true,
    ...overrides,
  };
  const root = createRootRoute({
    component: () => <AgentCard agent={agent} />,
  });
  const search = z.object({ agent: z.string().optional() });
  const routeTree = root.addChildren([
    createRoute({
      getParentRoute: () => root,
      path: "/agents",
      validateSearch: search,
    }),
    createRoute({
      getParentRoute: () => root,
      path: "/channel/new",
      validateSearch: search,
    }),
  ]);
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return { ...render(<RouterProvider router={router} />), router };
}

test("cards explain the agent and start a conversation with the correct recipient", async () => {
  const view = renderCard();
  await view.findByText("Research partner");
  expect(view.getByText("Company knowledge")).toBeTruthy();
  expect(view.getByText("Private")).toBeTruthy();
  fireEvent.click(
    view.getByRole("button", {
      name: "Start conversation with Research partner",
    }),
  );
  await waitFor(() =>
    expect(view.router.state.location.pathname).toBe("/channel/new"),
  );
  expect(view.router.state.location.search).toEqual({
    agent: "research-agent",
  });
});

test("shared cards offer details without exposing management actions", async () => {
  const view = renderCard({
    canManage: false,
    mine: false,
    visibility: "public",
  });
  await view.findByText("Research partner");
  expect(view.getByText("Public")).toBeTruthy();
  expect(
    view.queryByRole("button", { name: "Actions for Research partner" }),
  ).toBeNull();
  fireEvent.click(
    view.getByRole("link", { name: "View details for Research partner" }),
  );
  await waitFor(() =>
    expect(view.router.state.location.pathname).toBe("/agents"),
  );
  expect(view.router.state.location.search).toEqual({
    agent: "research-agent",
  });
});

test("management is available to permitted users without nesting interactive controls", async () => {
  const view = renderCard();
  await view.findByText("Research partner");
  // Base UI's layout effects are disabled when imported before this suite's DOM
  // registration. Menu opening is checked in the browser; here we cover access
  // to the trigger and valid interactive markup.
  expect(
    view
      .getByRole("button", { name: "Actions for Research partner" })
      .getAttribute("aria-haspopup"),
  ).toBe("menu");
  expect(
    view.container.querySelector("a a, a button, button a, button button"),
  ).toBeNull();
});
