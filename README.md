# searching-ui

A React component library for building AI-powered search interfaces with streaming chat support.

## Features

- **SearchTrigger** - Customizable search trigger button
- **SearchCommand** - Command palette dialog with instant search results
- **SearchAgent** - AI-powered chat interface with streaming responses
- **useSearchAgent** - React hook for managing chat state
- Full TypeScript support
- Tailwind CSS v4 styling
- shadcn/ui components included
- Framer Motion animations

## Installation

```bash
npm install @rx-lab/dashboard-searching-ui
# or
bun add @rx-lab/dashboard-searching-ui
```

### Peer Dependencies

If you plan to use the AI agent features, you'll also need:

```bash
npm install @ai-sdk/react ai
```

## Quick Start

### Basic Search Command

```tsx
import { useState } from "react";
import { SearchTrigger, SearchCommand } from "@rx-lab/dashboard-searching-ui";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SearchTrigger onClick={() => setOpen(true)} />

      <SearchCommand
        open={open}
        onOpenChange={setOpen}
        onSearch={async ({ query, limit }) => {
          // Your search implementation
          const results = await fetch(`/api/search?q=${query}&limit=${limit}`);
          return results.json();
        }}
        onResultSelect={(result) => {
          // Handle result selection
          console.log("Selected:", result);
        }}
      />
    </>
  );
}
```

### With AI Agent Mode

```tsx
import { useState } from "react";
import { SearchTrigger, SearchCommand } from "@rx-lab/dashboard-searching-ui";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SearchTrigger onClick={() => setOpen(true)} />

      <SearchCommand
        open={open}
        onOpenChange={setOpen}
        onSearch={async ({ query }) => {
          const results = await fetch(`/api/search?q=${query}`);
          return results.json();
        }}
        enableAgentMode
        agentConfig={{
          apiEndpoint: "/api/search-agent",
        }}
      />
    </>
  );
}
```

## Components

### SearchTrigger

A trigger button for opening the search dialog.

```tsx
import { SearchTrigger } from "@rx-lab/dashboard-searching-ui";

// Basic usage
<SearchTrigger onClick={() => setOpen(true)} />

// Custom placeholder
<SearchTrigger
  onClick={() => setOpen(true)}
  placeholder="Find documents..."
/>

// Custom shortcut
<SearchTrigger
  onClick={() => setOpen(true)}
  shortcut={{ key: "P", modifier: "Ctrl" }}
/>

// Completely custom content
<SearchTrigger onClick={() => setOpen(true)}>
  <span>Custom Search Button</span>
</SearchTrigger>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClick` | `() => void` | required | Click handler to open search |
| `placeholder` | `string` | `"Search files..."` | Placeholder text |
| `shortcut` | `ShortcutConfig \| null` | `{ key: "K", modifier: "⌘" }` | Keyboard shortcut display |
| `icon` | `ComponentType` | `Search` | Icon component |
| `children` | `ReactNode` | - | Custom content (replaces default) |
| `variant` | `string` | `"outline"` | Button variant |
| `className` | `string` | - | Additional class name |

### SearchCommand

A search command dialog with optional AI agent mode.

```tsx
import { SearchCommand } from "@rx-lab/dashboard-searching-ui";

<SearchCommand
  open={open}
  onOpenChange={setOpen}
  onSearch={async ({ query, searchType, limit }) => {
    const results = await searchAPI(query, { type: searchType, limit });
    return results;
  }}
  onResultSelect={(result) => {
    router.push(`/files/${result.id}`);
  }}
  searchTypes={[
    { id: "all", label: "All" },
    { id: "documents", label: "Documents" },
    { id: "images", label: "Images" },
  ]}
  renderResult={(result, onSelect) => (
    <div onClick={onSelect} className="p-2 cursor-pointer hover:bg-accent">
      <h3>{result.title}</h3>
      <p>{result.snippet}</p>
    </div>
  )}
  enableAgentMode
  agentConfig={{
    apiEndpoint: "/api/search-agent",
    header: { title: "AI Assistant" },
  }}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Whether dialog is open |
| `onOpenChange` | `(open: boolean) => void` | required | Open state handler |
| `onSearch` | `(params: SearchParams) => Promise<TResult[]>` | required | Search function |
| `onResultSelect` | `(result: TResult) => void` | - | Result selection handler |
| `searchTypes` | `SearchTypeConfig[]` | - | Available search types |
| `debounceMs` | `number` | `300` | Debounce delay |
| `limit` | `number` | `10` | Max results |
| `renderResult` | `(result, onSelect) => ReactNode` | - | Custom result renderer |
| `renderEmpty` | `(query, hasResults) => ReactNode` | - | Custom empty state |
| `renderLoading` | `() => ReactNode` | - | Custom loading state |
| `enableAgentMode` | `boolean` | `false` | Enable AI agent mode |
| `agentConfig` | `Partial<SearchAgentProps>` | - | Agent configuration |
| `placeholder` | `string` | `"Search..."` | Input placeholder |

#### Customizing the AI Loading Indicator

When using agent mode, you can customize the loading indicator shown while the AI is processing:

```tsx
import { Brain } from "lucide-react";

<SearchCommand
  open={open}
  onOpenChange={setOpen}
  onSearch={onSearch}
  enableAgentMode
  agentConfig={{
    apiEndpoint: "/api/search-agent",
    input: {
      streamingText: "Thinking...",
      streamingIcon: Brain,
    },
  }}
/>
```

### SearchAgent

An AI-powered search agent component with streaming chat support.

```tsx
import { SearchAgent } from "@rx-lab/dashboard-searching-ui";

<SearchAgent
  initialQuery="Find all PDF documents"
  apiEndpoint="/api/search-agent"
  onBack={() => setMode("quick")}
  onClose={() => setOpen(false)}
  header={{
    title: "AI Search Assistant",
    showBackButton: true,
    showClearButton: true,
  }}
  toolResultRenderers={{
    display_files: ({ output, onAction }) => (
      <div>
        {output.files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onClick={() => onAction({ type: "navigate", payload: `/files/${file.id}` })}
          />
        ))}
      </div>
    ),
  }}
  renderAssistantContent={(content) => (
    <CustomMarkdown>{content}</CustomMarkdown>
  )}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialQuery` | `string` | `""` | Initial query to send |
| `initialMessages` | `UIMessage[]` | - | Initial messages |
| `apiEndpoint` | `string` | `"/api/search-agent"` | Chat API endpoint |
| `chatInstance` | `Chat<UIMessage>` | - | Custom Chat instance |
| `toolResultRenderers` | `ToolResultRenderers` | `{}` | Custom tool renderers |
| `onToolAction` | `(action: ToolAction) => void` | - | Tool action handler |
| `renderMessage` | `(props) => ReactNode` | - | Custom message renderer |
| `renderUserContent` | `(content: string) => ReactNode` | - | Custom user content |
| `renderAssistantContent` | `(content: string) => ReactNode` | - | Custom assistant content |
| `renderStreamingIndicator` | `() => ReactNode` | - | Custom loading indicator |
| `onNavigate` | `(path: string) => void` | - | Navigation handler |
| `onBack` | `() => void` | - | Back button handler |
| `onClose` | `() => void` | - | Close handler |
| `onClearHistory` | `() => void` | - | Clear history handler |
| `header` | `SearchAgentHeaderConfig` | - | Header configuration |
| `input` | `SearchAgentInputConfig` | - | Input configuration |
| `enableMessageActions` | `boolean` | `true` | Show action buttons on messages (Copy, Regenerate) |
| `onMessageRegenerate` | `(messageId, content) => void` | - | Called when user regenerates a message |

#### Message Actions

By default, action buttons appear when hovering over messages. The buttons are:

| Action | Available On | Description |
|--------|-------------|-------------|
| **Copy** | All messages | Copy message content to clipboard |
| **Regenerate** | All messages | For user messages: removes this and all subsequent messages, then resends. For assistant messages: regenerates this response |

To disable the action buttons:

```tsx
<SearchAgent
  apiEndpoint="/api/search-agent"
  enableMessageActions={false}
/>
```

To handle regenerate events:

```tsx
<SearchAgent
  apiEndpoint="/api/search-agent"
  onMessageRegenerate={(messageId, content) => {
    console.log("Regenerating:", messageId, content);
  }}
/>
```

#### Input Configuration

The `input` prop accepts an `SearchAgentInputConfig` object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placeholder` | `string` | `"Ask a follow-up question..."` | Input placeholder when ready |
| `placeholderProcessing` | `string` | `"Generating..."` | Input placeholder when processing |
| `streamingText` | `ReactNode` | `"Searching..."` | Text or component shown in loading indicator |
| `streamingIcon` | `ComponentType \| null` | `Loader2` | Custom spinner icon, or `null` to hide |

**Example with custom streaming indicator:**

```tsx
import { Brain } from "lucide-react";

<SearchAgent
  apiEndpoint="/api/search-agent"
  input={{
    placeholder: "Ask me anything...",
    streamingText: "Thinking...",
    streamingIcon: Brain,
  }}
/>
```

**Example with fully custom content:**

```tsx
<SearchAgent
  apiEndpoint="/api/search-agent"
  input={{
    streamingText: (
      <span className="flex items-center gap-1">
        <Brain className="h-3 w-3 animate-pulse" />
        Analyzing your request...
      </span>
    ),
    streamingIcon: null, // Hide default spinner since we include our own
  }}
/>
```

## Hooks

### useSearchAgent

A hook for managing AI chat state with the Vercel AI SDK.

```tsx
import { useSearchAgent } from "@rx-lab/dashboard-searching-ui";

function CustomChatInterface() {
  const {
    messages,
    isProcessing,
    sendMessage,
    stop,
    clearMessages,
    getTextContent,
    hasContent,
  } = useSearchAgent({
    apiEndpoint: "/api/search-agent",
    onMessagesChange: (messages) => {
      // Persist messages
      sessionStorage.setItem("chat", JSON.stringify(messages));
    },
    onToolCall: ({ toolName, args }) => {
      console.log("Tool called:", toolName, args);
    },
  });

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          {getTextContent(message)}
        </div>
      ))}

      <button onClick={() => sendMessage("Hello!")}>
        Send
      </button>

      {isProcessing && (
        <button onClick={stop}>Stop</button>
      )}
    </div>
  );
}
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `apiEndpoint` | `string` | API endpoint for chat |
| `initialMessages` | `UIMessage[]` | Initial messages |
| `chatInstance` | `Chat<UIMessage>` | Custom Chat instance |
| `onMessagesChange` | `(messages) => void` | Messages change callback |
| `initialQuery` | `string` | Auto-send query on mount |
| `onToolCall` | `(toolCall) => void` | Tool call callback |
| `onFinish` | `(message) => void` | Completion callback |
| `onError` | `(error) => void` | Error callback |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `messages` | `UIMessage[]` | Current messages |
| `status` | `string` | Current status |
| `isProcessing` | `boolean` | Whether processing |
| `error` | `Error \| undefined` | Current error |
| `sendMessage` | `(text: string) => void` | Send a message |
| `stop` | `() => void` | Stop generation |
| `clearMessages` | `() => void` | Clear messages |
| `setMessages` | `function` | Set messages directly |
| `chat` | `Chat<UIMessage>` | Underlying Chat instance |
| `getTextContent` | `(message) => string` | Extract text content |
| `getToolCalls` | `(message) => ToolCallInfo[]` | Extract tool calls |
| `hasContent` | `(message) => boolean` | Check if has content |

## Sub-components

### MessageBubble

Renders a single chat message with support for tool results.

```tsx
import { MessageBubble } from "@rx-lab/dashboard-searching-ui";

<MessageBubble
  message={message}
  toolResultRenderers={{
    search_files: MyFileResultRenderer,
  }}
  renderUserContent={(content) => <span>{content}</span>}
  renderAssistantContent={(content) => <Markdown>{content}</Markdown>}
/>
```

### StreamingIndicator

Shows a loading indicator while the AI is generating.

```tsx
import { StreamingIndicator } from "@rx-lab/dashboard-searching-ui";

// Basic usage
<StreamingIndicator text="Thinking..." />

// Custom icons
<StreamingIndicator
  text="Processing..."
  botIcon={CustomBotIcon}
  loadingIcon={CustomSpinner}
/>

// Hide the spinner (when text includes its own)
<StreamingIndicator
  text={
    <span className="flex items-center gap-1">
      <Brain className="h-3 w-3 animate-pulse" />
      Analyzing...
    </span>
  }
  loadingIcon={null}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `ReactNode` | `"Searching..."` | Text or component to display |
| `botIcon` | `ComponentType` | `Bot` | Bot avatar icon |
| `loadingIcon` | `ComponentType \| null` | `Loader2` | Spinner icon, or `null` to hide |
| `className` | `string` | - | Additional class name |

### FileResultCard

A card component for displaying file results.

```tsx
import { FileResultCard } from "@rx-lab/dashboard-searching-ui";

<FileResultCard
  file={{
    id: "123",
    title: "Document.pdf",
    fileType: "document",
    mimeType: "application/pdf",
    folderName: "My Folder",
  }}
  description="A sample document"
  onClick={() => navigate(`/files/123`)}
  renderIcon={(fileType, mimeType) => (
    <FileIcon type={fileType} />
  )}
/>
```

## Custom Rendering

The library provides flexible customization options for rendering messages and tool results.

### Custom User Message Rendering

Use `renderUserContent` to customize how user messages are displayed:

```tsx
<SearchAgent
  apiEndpoint="/api/search-agent"
  renderUserContent={(content) => (
    <div className="font-medium text-blue-600">
      {content}
    </div>
  )}
/>
```

### Custom Assistant Message Rendering

Use `renderAssistantContent` to customize assistant responses (e.g., with a custom Markdown renderer):

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

<SearchAgent
  apiEndpoint="/api/search-agent"
  renderAssistantContent={(content) => (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  )}
/>
```

### Custom Tool Result Rendering

Use `toolResultRenderers` to provide custom renderers for specific tool outputs. Each renderer receives the tool's output and an action handler:

```tsx
import { SearchAgent, ToolResultRendererProps, FileResultCard } from '@rx-lab/dashboard-searching-ui'

// Custom renderer for file search results
const FileResultsRenderer = ({ output, onAction }: ToolResultRendererProps) => {
  const files = output as Array<{ id: string; title: string; fileType: string }>

  return (
    <div className="grid gap-2">
      {files.map((file) => (
        <FileResultCard
          key={file.id}
          file={file}
          onClick={() => onAction?.({ type: 'open', payload: file })}
        />
      ))}
    </div>
  )
}

// Custom renderer for a different tool
const WeatherRenderer = ({ output }: ToolResultRendererProps) => {
  const data = output as { temp: number; condition: string }
  return (
    <div className="p-3 rounded-lg bg-blue-50">
      <p>{data.temp}°F - {data.condition}</p>
    </div>
  )
}

<SearchAgent
  apiEndpoint="/api/search-agent"
  toolResultRenderers={{
    display_files: FileResultsRenderer,
    get_weather: WeatherRenderer,
  }}
  onToolAction={(action) => {
    if (action.type === 'open') {
      router.push(`/files/${action.payload.id}`)
    }
  }}
/>
```

#### ToolResultRendererProps

| Prop | Type | Description |
|------|------|-------------|
| `output` | `unknown` | The tool's output data |
| `toolCallId` | `string` | Unique identifier for the tool call |
| `onAction` | `(action: ToolAction) => void` | Trigger actions to parent |

#### ToolAction

```tsx
interface ToolAction {
  type: string    // Action type (e.g., 'open', 'download', 'select')
  payload: unknown // Action data
}
```

### Complete Message Override

For full control over message rendering, use `renderMessage` to override the entire message bubble:

```tsx
import { UIMessage } from '@rx-lab/dashboard-searching-ui'

<SearchAgent
  apiEndpoint="/api/search-agent"
  renderMessage={({ message, getTextContent, getToolCalls }) => {
    const content = getTextContent(message)
    const toolCalls = getToolCalls(message)

    return (
      <div className={message.role === 'user' ? 'text-right' : 'text-left'}>
        <div className="inline-block p-3 rounded-lg">
          <p>{content}</p>
          {toolCalls.map((tool) => (
            <div key={tool.toolCallId}>
              Tool: {tool.toolName}
            </div>
          ))}
        </div>
      </div>
    )
  }}
/>
```

### Custom Icons

Customize user and bot avatar icons in `MessageBubble`:

```tsx
import { User, Sparkles } from 'lucide-react'

<MessageBubble
  message={message}
  userIcon={User}
  botIcon={Sparkles}
/>
```

### Using with SearchCommand

When using `SearchCommand` with agent mode, pass custom renderers through `agentConfig`:

```tsx
<SearchCommand
  open={open}
  onOpenChange={setOpen}
  onSearch={onSearch}
  enableAgentMode
  agentConfig={{
    apiEndpoint: '/api/search-agent',
    renderUserContent: (content) => <strong>{content}</strong>,
    renderAssistantContent: (content) => <Markdown>{content}</Markdown>,
    toolResultRenderers: {
      display_files: FileResultsRenderer,
    },
    onToolAction: handleToolAction,
  }}
/>
```

## Styling

The library uses Tailwind CSS v4 and includes shadcn/ui components. Styles are automatically injected when importing components.

To customize the theme, add CSS variables to your root:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... other variables */
}
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun run test

# Build library
bun run build

# Run example app
bun run example:dev
```

## License

MIT
