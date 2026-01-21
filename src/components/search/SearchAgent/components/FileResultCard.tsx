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
        "sui:w-full sui:text-left sui:p-3 sui:rounded-xl sui:border sui:bg-card hover:sui:bg-accent/50 sui:transition-colors sui:group",
        className,
      )}
    >
      <div className="sui:flex sui:items-start sui:gap-3">
        {renderIcon && (
          <div className="sui:shrink-0 sui:mt-0.5">
            {renderIcon(file.fileType, file.mimeType)}
          </div>
        )}
        <div className="sui:flex-1 sui:min-w-0">
          <div className="sui:flex sui:items-center sui:gap-2">
            <p className="sui:font-medium sui:text-sm sui:truncate">
              {file.title}
            </p>
            <ArrowRight className="sui:h-4 sui:w-4 sui:opacity-0 group-hover:sui:opacity-100 sui:transition-opacity sui:text-muted-foreground" />
          </div>
          {description && (
            <p className="sui:text-xs sui:text-muted-foreground sui:line-clamp-2 sui:mt-1">
              {description}
            </p>
          )}
          {file.folderName && (
            <p className="sui:text-xs sui:text-muted-foreground/70 sui:mt-1">
              in {file.folderName}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
