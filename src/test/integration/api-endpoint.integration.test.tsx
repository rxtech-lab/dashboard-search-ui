import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Fastify, { type FastifyInstance } from "fastify";
import { SearchAgent } from "@/components/search/SearchAgent";

// Mock framer-motion for test stability
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

interface RecordedRequest {
  url: string;
  method: string;
  body: unknown;
}

describe("SearchAgent API Endpoint Integration", () => {
  let server: FastifyInstance;
  let serverPort: number;
  let receivedRequests: RecordedRequest[];

  beforeAll(async () => {
    server = Fastify({ logger: false });
    receivedRequests = [];

    // Register content type parser for JSON
    server.addContentTypeParser(
      "application/json",
      { parseAs: "string" },
      (_req, body, done) => {
        try {
          done(null, JSON.parse(body as string));
        } catch {
          done(null, body);
        }
      },
    );

    // Wildcard route to capture all POST requests
    server.post("/*", async (request, reply) => {
      receivedRequests.push({
        url: request.url,
        method: request.method,
        body: request.body,
      });

      // Return minimal AI SDK compatible response
      reply.header("Content-Type", "text/plain; charset=utf-8");
      return reply.send("");
    });

    // Listen on dynamic port
    await server.listen({ port: 0, host: "127.0.0.1" });
    const address = server.addresses()[0];
    serverPort = typeof address === "string" ? 3456 : address.port;
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    receivedRequests = [];
  });

  it("sends requests to the configured custom apiEndpoint", async () => {
    const user = userEvent.setup();
    const customEndpoint = `http://127.0.0.1:${serverPort}/my/custom/endpoint`;

    render(<SearchAgent apiEndpoint={customEndpoint} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "Hello test");

    const sendButton = screen.getByRole("button", { name: /send/i });
    await user.click(sendButton);

    await waitFor(
      () => {
        expect(receivedRequests.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );

    expect(receivedRequests[0].url).toBe("/my/custom/endpoint");
  });

  it("sends requests to different endpoints based on prop value", async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <SearchAgent apiEndpoint={`http://127.0.0.1:${serverPort}/endpoint-a`} />,
    );

    const input1 = screen.getByRole("textbox");
    await user.type(input1, "Message A");
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(
      () => {
        expect(receivedRequests.some((r) => r.url === "/endpoint-a")).toBe(
          true,
        );
      },
      { timeout: 5000 },
    );

    unmount();
    receivedRequests = [];

    const user2 = userEvent.setup();
    render(
      <SearchAgent apiEndpoint={`http://127.0.0.1:${serverPort}/endpoint-b`} />,
    );

    const input2 = screen.getByRole("textbox");
    await user2.type(input2, "Message B");
    await user2.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(
      () => {
        expect(receivedRequests.some((r) => r.url === "/endpoint-b")).toBe(
          true,
        );
      },
      { timeout: 5000 },
    );
  });

  it("includes user message in the request body", async () => {
    const user = userEvent.setup();
    const testMessage = "Find documents about TypeScript";

    render(<SearchAgent apiEndpoint={`http://127.0.0.1:${serverPort}/chat`} />);

    const input = screen.getByRole("textbox");
    await user.type(input, testMessage);
    await user.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(
      () => {
        expect(receivedRequests.length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );

    const requestBody = JSON.stringify(receivedRequests[0].body);
    expect(requestBody).toContain(testMessage);
  });
});
