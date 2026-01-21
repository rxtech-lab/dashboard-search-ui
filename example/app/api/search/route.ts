import { NextRequest, NextResponse } from "next/server";

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  score: number;
  metadata?: {
    fileType: string;
    path: string;
  };
}

const MOCK_DATA: SearchResult[] = [
  {
    id: "1",
    title: "README.md",
    snippet:
      "A React component library for building AI-powered search interfaces with streaming chat support.",
    score: 1.0,
    metadata: { fileType: "markdown", path: "/" },
  },
  {
    id: "2",
    title: "SearchCommand.tsx",
    snippet:
      "A search command dialog with optional AI agent mode. Supports quick search results or AI-powered conversations.",
    score: 0.95,
    metadata: {
      fileType: "typescript",
      path: "/src/components/search/SearchCommand",
    },
  },
  {
    id: "3",
    title: "SearchAgent.tsx",
    snippet:
      "An AI-powered search agent component with streaming chat support, fully customizable with render props.",
    score: 0.9,
    metadata: {
      fileType: "typescript",
      path: "/src/components/search/SearchAgent",
    },
  },
  {
    id: "4",
    title: "SearchTrigger.tsx",
    snippet:
      "A trigger button to open the search dialog with customizable icon and keyboard shortcut.",
    score: 0.85,
    metadata: {
      fileType: "typescript",
      path: "/src/components/search/SearchTrigger",
    },
  },
  {
    id: "5",
    title: "useSearchAgent.ts",
    snippet:
      "React hook for managing AI chat state with the Vercel AI SDK. Provides message extraction and status tracking.",
    score: 0.8,
    metadata: { fileType: "typescript", path: "/src/hooks" },
  },
  {
    id: "6",
    title: "MessageBubble.tsx",
    snippet:
      "Renders individual chat messages with support for custom content and tool results.",
    score: 0.75,
    metadata: {
      fileType: "typescript",
      path: "/src/components/search/SearchAgent/components",
    },
  },
  {
    id: "7",
    title: "FileResultCard.tsx",
    snippet:
      "A clickable card for displaying file results in tool outputs with animated hover effects.",
    score: 0.7,
    metadata: {
      fileType: "typescript",
      path: "/src/components/search/SearchAgent/components",
    },
  },
  {
    id: "8",
    title: "package.json",
    snippet:
      "Package configuration with dependencies: react, tailwindcss, framer-motion, shadcn/ui components.",
    score: 0.65,
    metadata: { fileType: "json", path: "/" },
  },
  {
    id: "9",
    title: "vite.config.ts",
    snippet:
      "Vite configuration for library mode build with single JS output and CSS injection.",
    score: 0.6,
    metadata: { fileType: "typescript", path: "/" },
  },
  {
    id: "10",
    title: "styles.css",
    snippet:
      "Tailwind CSS entry file with theme configuration and custom CSS variables.",
    score: 0.55,
    metadata: { fileType: "css", path: "/src" },
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.toLowerCase() || "";
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!query) {
    return NextResponse.json([]);
  }

  // Filter results based on query matching title or snippet
  const filtered = MOCK_DATA.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.snippet.toLowerCase().includes(query),
  )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json(filtered);
}
