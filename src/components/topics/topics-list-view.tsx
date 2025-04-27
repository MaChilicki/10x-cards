import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopicFormModal } from "./topic-form-modal";
import { DeleteTopicDialog } from "./delete-topic-dialog";
import { TopicsList } from "./topics-list";
import { useTopics } from "./hooks/use-topics";
import type { TopicDto, TopicCreateDto } from "@/types";
import { ErrorAlert } from "@/components/ui/error-alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "@/lib/hooks/use-navigate";

export function TopicsListView() {
  const navigate = useNavigate();
  const { topics, loading, error, addTopic, updateTopic, deleteTopic, fetchTopics } = useTopics();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleOpenAddModal = () => {
    setSelectedTopic(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (topic: TopicDto) => {
    setSelectedTopic(topic);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTopic(null);
    setIsEditMode(false);
  };

  const handleOpenDeleteDialog = (topic: TopicDto) => {
    setSelectedTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedTopic(null);
  };

  const handleTopicClick = (topic: TopicDto) => {
    navigate(`/topics/${topic.id}`);
  };

  const handleSubmit = async (data: TopicCreateDto) => {
    try {
      if (isEditMode && selectedTopic) {
        await updateTopic(selectedTopic.id, data);
      } else {
        await addTopic(data);
      }
      handleCloseModal();
      await fetchTopics();
    } catch {
      throw new Error("Nie udało się zapisać tematu. Spróbuj ponownie później.");
    }
  };

  const handleDelete = async () => {
    if (!selectedTopic) return;

    try {
      await deleteTopic(selectedTopic.id);
      handleCloseDeleteDialog();
      await fetchTopics();
    } catch {
      throw new Error("Nie udało się usunąć tematu. Spróbuj ponownie później.");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error instanceof Error ? error.message : String(error)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tematy</CardTitle>
          <Button onClick={handleOpenAddModal}>Dodaj temat</Button>
        </CardHeader>
        <CardContent>
          <TopicsList
            topics={topics}
            onTopicClick={handleTopicClick}
            onEditClick={handleOpenEditModal}
            onDeleteClick={handleOpenDeleteDialog}
          />
        </CardContent>

        <TopicFormModal
          isOpen={isModalOpen}
          isEditMode={isEditMode}
          initialData={selectedTopic}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />

        <DeleteTopicDialog
          isOpen={isDeleteDialogOpen}
          topic={selectedTopic}
          deleting={false}
          error={null}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleDelete}
        />
      </Card>
    </div>
  );
}
