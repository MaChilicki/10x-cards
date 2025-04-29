import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TopicFormModal } from "./topic-form-modal";
import { DeleteTopicDialog } from "./delete-topic-dialog";
import { TopicsList } from "./topics-list";
import { TopicsSorter } from "./topics-sorter";
import { useTopics } from "./hooks/use-topics";
import type { TopicDto, TopicCreateDto } from "@/types";
import { ErrorAlert } from "@/components/ui/error-alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "@/lib/hooks/use-navigate";
import { Pagination } from "@/components/ui/pagination";
import type { TopicsSortModel } from "./types";

export function TopicsListView() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sort, setSort] = useState<TopicsSortModel>({
    sortBy: "name",
    sortOrder: "asc",
  });

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

  const handleSortChange = (newSort: TopicsSortModel) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const sortedTopics = [...topics].sort((a, b) => {
    const aValue = a[sort.sortBy];
    const bValue = b[sort.sortBy];

    if (sort.sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(sortedTopics.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTopics = sortedTopics.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" withCard message="Ładowanie tematów..." />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error instanceof Error ? error.message : String(error)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Tematy</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <TopicsSorter
          currentSort={sort}
          onChange={handleSortChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
        <Button onClick={handleOpenAddModal}>Dodaj temat</Button>
      </div>

      <TopicsList
        topics={paginatedTopics}
        onTopicClick={handleTopicClick}
        onEditClick={handleOpenEditModal}
        onDeleteClick={handleOpenDeleteDialog}
      />

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

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
    </div>
  );
}
