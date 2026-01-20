import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * File data for the FileResultCard
 */
export interface FileData {
  /** Unique identifier for the file */
  id: string | number;

  /** Display title */
  title: string;

  /** File type (e.g., "document", "image", "video") */
  fileType?: string;

  /** MIME type */
  mimeType?: string;

  /** Folder ID if file is in a folder */
  folderId?: string | number | null;

  /** Folder name for display */
  folderName?: string;
}

/**
 * Props for the FileResultCard component
 */
export interface FileResultCardProps {
  /** File data to display */
  file: FileData;

  /** Optional description text */
  description?: string;

  /** Click handler */
  onClick?: () => void;

  /** Custom icon renderer */
  renderIcon?: (fileType?: string, mimeType?: string) => ReactNode;

  /** Additional class name */
  className?: string;
}

/**
 * A clickable card for displaying a file result.
 * Supports custom icon rendering via the renderIcon prop.
 */
export function FileResultCard({
  file,
  description,
  onClick,
  renderIcon,
  className,
}: FileResultCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors group",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {renderIcon && (
          <div className="flex-shrink-0 mt-0.5">
            {renderIcon(file.fileType, file.mimeType)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{file.title}</p>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
          </div>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          )}
          {file.folderName && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              in {file.folderName}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
