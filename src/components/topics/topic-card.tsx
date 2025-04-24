import type { TopicDto } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, FileText, FileStack, FolderClosed } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TopicCardProps {
  topic: TopicDto;
  onTopicClick: (topic: TopicDto) => void;
  onEditClick: (topic: TopicDto) => void;
  onDeleteClick: (topic: TopicDto) => void;
}

export function TopicCard({ topic, onTopicClick, onEditClick, onDeleteClick }: TopicCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onTopicClick(topic)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onTopicClick(topic);
          }
        }}
        className="outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-lg"
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FolderClosed className="h-5 w-5 mr-2 text-muted-foreground" />
              <span>{topic.name}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground text-sm">
              {topic.documents_count > 0 && (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{topic.documents_count}</span>
                </div>
              )}
              {topic.flashcards_count > 0 && (
                <div className="flex items-center">
                  <FileStack className="h-4 w-4 mr-1" />
                  <span>{topic.flashcards_count}</span>
                </div>
              )}
            </div>
          </CardTitle>
          {topic.description && <CardDescription className="line-clamp-2">{topic.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex justify-end space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(topic);
                    }}
                    aria-label={`Edytuj temat ${topic.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edytuj temat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(topic);
                    }}
                    aria-label={`Usuń temat ${topic.name}`}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Usuń temat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
