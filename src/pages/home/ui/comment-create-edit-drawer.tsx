import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  useCreateComment,
  useUpdateCommentById,
  useDeleteCommentById,
} from "../../../queries/useOrder";

const CommentCreateEditDrawer = ({
  isOpen,
  onClose,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  initial?: any | null;
}) => {
  const [body, setBody] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const createComment = useCreateComment();
  const updateComment = useUpdateCommentById();
  const deleteComment = useDeleteCommentById();

  useEffect(() => {
    if (initial) setBody(initial.comment_body || "");
    else setBody("");
  }, [initial, isOpen]);

  const handleSave = async () => {
    try {
      if (initial && initial._id) {
        await updateComment.mutateAsync({
          id: initial._id,
          data: { comment_body: body },
        });
      } else {
        await createComment.mutateAsync({ comment_body: body });
      }
      onClose();
    } catch (err) {
      console.error("Save comment failed", err);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!initial?._id) return;
    try {
      await deleteComment.mutateAsync(initial._id);
      setDeleteDialogOpen(false);
      onClose();
    } catch (err) {
      console.error("Delete comment failed", err);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        <div
          className="absolute right-0 top-0 h-full w-[480px] bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400 shadow-2xl border-l border-slate-600 transform transition-transform duration-300"
          style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-600 bg-gradient-to-r from-gray-500/20 to-gray-500/20 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-gray-100/90">
              {initial ? "Редактировать комментарий" : "Новый комментарий"}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-300 cursor-pointer hover:text-white hover:bg-slate-700 rounded-lg p-2 transition-all duration-200 hover:rotate-90"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            <TextField
              label="Текст комментария"
              multiline
              rows={4}
              fullWidth
              value={body}
              onChange={(e) => setBody(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(51, 65, 85, 0.3)",
                  "& fieldset": {
                    borderColor: "rgba(100, 116, 139, 0.5)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100, 116, 139, 0.8)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#10b981",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#f1f5f9",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#94a3b8",
                  opacity: 0.7,
                },
                "& .MuiInputLabel-root": {
                  color: "#cbd5e1",
                },
              }}
            />

            <div className="flex items-center justify-end gap-2 mt-4">
              {initial && (
                <Button
                  onClick={handleDeleteClick}
                  variant="outlined"
                  color="error"
                  disabled={deleteComment.isPending}
                >
                  {deleteComment.isPending ? (
                    <CircularProgress size={18} />
                  ) : (
                    "Удалить"
                  )}
                </Button>
              )}

              <Button onClick={onClose} className="!bg-rose-600 !text-white" variant="contained">
                Отмена
              </Button>

              <Button
                onClick={handleSave}
                variant="contained"
                disabled={createComment.isPending || updateComment.isPending}
              >
                {createComment.isPending || updateComment.isPending ? (
                  <>
                    <CircularProgress
                      size={18}
                      sx={{ color: "white", mr: 1 }}
                    />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить"
                )}
              </Button>
            </div>
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

export default CommentCreateEditDrawer;
