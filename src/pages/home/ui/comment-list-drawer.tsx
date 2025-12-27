import { useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Edit, Plus, Trash2 } from "lucide-react";
import {
  useGetAllComments,
  useDeleteCommentById,
} from "../../../queries/useOrder";

const CommentListDrawer = ({
  isOpen,
  onClose,
  openEdit,
  openCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  openEdit: (a: any) => void;
  openCreate: (a: boolean) => void;
}) => {
  const { data: comments, isLoading } = useGetAllComments({ enabled: isOpen });
  const deleteComment = useDeleteCommentById();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );

  const handleDeleteClick = (id: string) => {
    setSelectedCommentId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCommentId) return;
    try {
      await deleteComment.mutateAsync(selectedCommentId);
      setDeleteDialogOpen(false);
      setSelectedCommentId(null);
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedCommentId(null);
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        <div
          className="absolute right-0 top-0 h-full w-[500px] bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400 shadow-2xl border-l border-slate-600 transform transition-transform duration-300"
          style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-600 bg-gradient-to-r from-gray-500/20 to-gray-500/20 backdrop-blur-sm sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-100/90">
              Список комментариев
            </h2>
            <button
              onClick={onClose}
              className="text-slate-300 cursor-pointer hover:text-white hover:bg-slate-700 rounded-lg p-2 transition-all duration-200 hover:rotate-90"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-80px)] p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-y-4">
                <CircularProgress sx={{ color: "#3b82f6" }} size={50} />
                <span className="text-gray-400 font-medium">
                  Загрузка комментариев...
                </span>
              </div>
            ) : comments && comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-y-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <div className="bg-blue-500/10 p-6 rounded-full">
                  <Plus size={48} className="text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-white font-bold text-lg">
                    Нет комментариев
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Создайте первый комментарий
                  </p>
                </div>
                <Button
                  variant="contained"
                  onClick={() => openCreate(true)}
                  startIcon={<Plus size={20} />}
                  sx={{
                    backgroundColor: "#3b82f6",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: "10px",
                  }}
                >
                  Создать комментарий
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {comments &&
                    comments.map((item: any, index: number) => (
                      <div
                        key={item._id}
                        className=" flex items-center justify-between border-b border-slate-600 bg-gradient-to-r from-gray-900/10 to-gray-900/10 p-4 transition-all duration-300"
                        style={{ animationDelay: `${index * 0.02}s` }}
                      >
                        <div className="flex-1 pr-4">
                          <p className="text-white font-medium">
                            {item.comment_body}
                          </p>
                          {/* <p className="text-gray-200 text-sm mt-1">
                            {new Date(
                              item.created_at || item.createdAt || Date.now()
                            ).toLocaleString()}
                          </p> */}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="cursor-pointer bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/40 hover:border-gray-400/50 text-gray-200 hover:text-blue-300 rounded-lg p-2.5 transition-all duration-300"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item._id)}
                            className="cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 rounded-lg p-2.5 transition-all duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4 sticky bottom-0 pb-2">
                  <Button
                    variant="contained"
                    onClick={() => openCreate(true)}
                    startIcon={<Plus size={20} />}
                    sx={{
                      backgroundColor: "#3b82f6",
                      textTransform: "none",
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: "10px",
                    }}
                  >
                    Новый комментарий
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: {
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "8px",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#f1f5f9" }}>
          Удалить комментарий?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#cbd5e1" }}>
            Вы уверены, что хотите удалить этот комментарий? Это действие нельзя
            отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCancelDelete}
            disabled={deleteComment.isPending}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteComment.isPending}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            {deleteComment.isPending ? (
              <>
                <CircularProgress size={18} sx={{ color: "white", mr: 1 }} />
                Удаление...
              </>
            ) : (
              "Удалить"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommentListDrawer;
