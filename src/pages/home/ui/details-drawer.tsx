import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

import { useEffect, useMemo, useState } from "react";
import type { OrderType } from "../types";
import {
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import { formatCurrency } from "../../../functions";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import {
  Package,
  Plus,
  Calendar,
  User,
  FileText,
  // DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  useGetOrderById,
  useAddProductToOrder,
  useAssignClientToOrder,
  useAddPaymentToOrderProduct,
  useUpdatePaymentOfOrderProduct,
  useDeleteProductFromOrder,
  useCreateOrderProductPaymentGraphics,
  useUpdateProductInOrder,
} from "../../../queries/useOrder";

import { useQueryClient } from "@tanstack/react-query";
import { useGetAllClients } from "../../../queries/useClients";

interface NewProductForm {
  product_name: string;
  product_full_amount: string;
  product_pre_paid_amount: string;
  product_payment_period_start_date: string;
  product_payment_period_end_date: string;
  product_profit_amount: string;
}

interface AddProductDto {
  product_name: string;
  product_full_amount: number;
  product_pre_paid_amount: number;
  product_payment_period_start_date: string;
  product_payment_period_end_date: string;
  product_profit_amount: string;
}

interface NewProductRow {
  id: string;
  data: NewProductForm;
}

const DetailsDrawer = ({
  isOpen,
  onClose,
  saleId,
  tableIndex,
}: {
  isOpen: boolean;
  onClose: () => void;
  saleId: string;
  tableIndex: number;
}) => {
  const [newRows, setNewRows] = useState<NewProductRow[]>([]);
  const [showAddButtons, setShowAddButtons] = useState(false);
  const { data: response, isLoading } = useGetOrderById(saleId);
  const queryClient = useQueryClient();
  const addProductMutation = useAddProductToOrder();
  const sendOrderProductPaymentGraphics =
    useCreateOrderProductPaymentGraphics();
  const order = response?.data as OrderType | undefined;

  const { data: clients } = useGetAllClients({
    enabled: isOpen,
  });
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<Record<string, NewProductForm>>();

  const assignClientMutation = useAssignClientToOrder();
  const deleteProductMutation = useDeleteProductFromOrder();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [showActionButtons, setShowActionButtons] = useState(false);
  const [openGraphicConfirmDialog, setOpenGraphicConfirmDialog] =
    useState(false);
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(
    null
  );
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<NewProductForm | null>(null);
  const updateProductMutation = useUpdateProductInOrder();

  const handleEditProduct = (product: OrderType["order_products"][0]) => {
    setEditingProductId(product._id);
    setEditFormData({
      product_name: product.product_name,
      product_full_amount: String(product.product_full_amount),
      product_pre_paid_amount: String(product.product_pre_paid_amount),
      product_payment_period_start_date:
        product.product_payment_period_start_date.split("T")[0],
      product_payment_period_end_date:
        product.product_payment_period_end_date.split("T")[0],
      product_profit_amount: String(product.product_profit_amount || ""),
    });
    setShowEditForm(true); // Bu qo'shildi
    setShowActionButtons(false); // Action buttonlarni yashirish
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId || !editFormData) return;

    try {
      await updateProductMutation.mutateAsync({
        orderId: saleId,
        productId: editingProductId,
        data: {
          product_name: editFormData.product_name,
          product_full_amount: Number(editFormData.product_full_amount),
          product_pre_paid_amount: Number(editFormData.product_pre_paid_amount),
          product_payment_period_start_date:
            editFormData.product_payment_period_start_date,
          product_payment_period_end_date:
            editFormData.product_payment_period_end_date,
          product_profit_amount: String(
            editFormData.product_profit_amount || ""
          ),
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["order", saleId] });

      setEditingProductId(null);
      setEditFormData(null);
      setShowEditForm(false); // Bu qo'shildi
      setShowActionButtons(true); // Action buttonlarni qaytarish
    } catch (error) {
      console.error("Mahsulotni yangilashda xatolik:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditFormData(null);
    setShowEditForm(false);
    setShowActionButtons(true); // Action buttonlarni qaytarish
  };

  const handleCloseDrawer = () => {
    setShowActionButtons(false);
    setLastAddedProductId(null);
    setShowEditForm(false);
    setEditingProductId(null);
    setEditFormData(null);
    setNewRows([]);
    setShowAddButtons(false);
    onClose();
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProductMutation.mutateAsync({
        orderId: order?._id!,
        productId: selectedProduct._id,
      });

      await queryClient.invalidateQueries({ queryKey: ["order", saleId] });

      setOpenDeleteDialog(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Ошибка при удалении продукта:", error);
    }
  };

  const columns = useMemo<MRT_ColumnDef<OrderType["order_products"][0]>[]>(
    () => [
      {
        id: "expander",
        header: "",
        enableColumnActions: false,
        enableSorting: false,
        enableColumnFilter: false,
        // enableHiding: false,
        size: 50,
      },
      {
        accessorKey: "product_name",
        header: "Названия товара",
        size: 200,
      },
      {
        accessorKey: "product_full_amount",
        header: "Общая сумма",
        size: 150,
        Cell: ({ cell }) => formatCurrency(cell.getValue<number>()),
      },
      {
        accessorKey: "product_pre_paid_amount",
        header: "Предоплата",
        size: 150,
        Cell: ({ cell }) => formatCurrency(cell.getValue<number>()),
      },
      {
        accessorKey: "product_profit_amount",
        header: "Укажите сумма прибыли по продукту",
        size: 150,
        Cell: ({ cell }) => formatCurrency(cell.getValue<number>()),
      },
      {
        accessorKey: "product_payment_period_start_date",
        header: "Дата начало",
        size: 140,
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleDateString("ru-RU"),
      },
      {
        accessorKey: "product_payment_period_end_date",
        header: "Дата окончания",
        size: 140,
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleDateString("ru-RU"),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: order?.order_products || [],
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enablePagination: false,
    enableTableFooter: false,
    enableSorting: false,
    enableColumnFilters: false,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableExpandAll: false,
    enableColumnActions: false,
    // enableExpanding: false,
    mrtTheme: () => ({
      baseBackgroundColor: "#ffffff",
    }),
    muiTablePaperProps: {
      sx: {
        backgroundColor: "#ffffff",
        boxShadow: "none",
      },
    },
    muiTableProps: {
      sx: {
        backgroundColor: "#ffffff",
        "& .MuiTableCell-root": {
          borderBottom: "1px solid #cbd5e1",
          borderRight: "1px solid #cbd5e1",
          color: "#0f172a",
          fontWeight: 500,
        },
      },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: "#e2e8f0",
        color: "#1e293b",
        fontWeight: 700,
        fontSize: "0.75rem",
        borderBottom: "2px solid #94a3b8",
        borderRight: "1px solid #cbd5e1",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: "#ffffff",
        color: "#0f172a",
        borderBottom: "1px solid #cbd5e1",
        borderRight: "1px solid #cbd5e1",
      },
    },
    muiTableBodyRowProps: {
      sx: {
        "&:hover": {
          backgroundColor: "#fff !important",
          "& .MuiTableCell-root": {
            backgroundColor: "#fff !important",
          },
        },
        cursor: "pointer",
      },
    },

    renderDetailPanel: ({ row }) => {
      const product = row.original;
      const queryClient = useQueryClient();
      const addPaymentMutation = useAddPaymentToOrderProduct();
      const updatePaymentMutation = useUpdatePaymentOfOrderProduct();

      const [paymentInputs, setPaymentInputs] = useState<{
        [key: string]: string;
      }>({});
      const [editModes, setEditModes] = useState<{ [key: string]: boolean }>(
        {}
      );

      const [openDialog, setOpenDialog] = useState(false);
      const [dialogPayment, setDialogPayment] = useState<any>(null);

      const handlePaymentChange = (paymentId: string, value: string) => {
        setPaymentInputs((prev) => ({ ...prev, [paymentId]: value }));
      };

      const handleEditClick = (paymentId: string) => {
        setEditModes((prev) => ({
          ...prev,
          [paymentId]: !prev[paymentId],
        }));
      };

      const handleAddOrUpdatePayment = async (payment: any) => {
        const inputValue = Number(paymentInputs[payment._id] || 0);
        // const maxAmount = payment.payment_amount;

        // if (inputValue > maxAmount) {
        //   setDialogPayment(payment);
        //   setOpenDialog(true);
        //   return;
        // }

        try {
          if (editModes[payment._id]) {
            await updatePaymentMutation.mutateAsync({
              orderId: order?._id!,
              productId: product._id,
              paymentId: payment._id,
              table_index: tableIndex,
              data: { amount: inputValue },
            });
          } else {
            await addPaymentMutation.mutateAsync({
              orderId: order?._id!,
              productId: product._id,
              paymentId: payment._id,
              table_index: tableIndex,
              data: { amount: inputValue },
            });
          }
          await queryClient.invalidateQueries({
            queryKey: ["order", order?._id],
          });

          setEditModes((prev) => ({ ...prev, [payment._id]: false }));
        } catch (err) {
          console.error("Ошибка при оплате:", err);
        }
      };

      const handleDialogConfirm = () => {
        if (!dialogPayment) return;
        setPaymentInputs((prev) => ({
          ...prev,
          [dialogPayment._id]: String(dialogPayment.payment_amount),
        }));
        setOpenDialog(false);
        setDialogPayment(null);
      };

      const handleDialogClose = () => {
        setOpenDialog(false);
        setDialogPayment(null);
      };

      return (
        <>
          <Dialog
            open={openDialog}
            onClose={handleDialogClose}
            PaperProps={{
              sx: {
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "2px",
              },
            }}
          >
            <DialogTitle sx={{ color: "#dc2626", fontWeight: 700 }}>
              Предупреждение
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ color: "#475569" }}>
                Оплата не может превышать сумму платежа!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleDialogConfirm}
                variant="contained"
                sx={{
                  backgroundColor: "#dc2626",
                  "&:hover": { backgroundColor: "#b91c1c" },
                  borderRadius: "2px",
                }}
              >
                OK
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            PaperProps={{
              sx: {
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "2px",
              },
            }}
          >
            <DialogTitle sx={{ color: "#0f172a", fontWeight: 700 }}>
              Удаление товара
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ color: "#475569" }}>
                Вы уверены, что хотите удалить этот товар из заказа?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenDeleteDialog(false)}
                sx={{ color: "#64748b", borderRadius: "2px" }}
              >
                Отмена
              </Button>
              <Button
                onClick={handleConfirmDelete}
                variant="contained"
                disabled={deleteProductMutation.isPending}
                sx={{
                  backgroundColor: "#dc2626",
                  "&:hover": { backgroundColor: "#b91c1c" },
                  borderRadius: "2px",
                }}
              >
                Удалить
              </Button>
            </DialogActions>
          </Dialog>

          <div className="bg-white border border-slate-300">
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "0px",
                boxShadow: "none",
              }}
            >
              <Table
                sx={{
                  backgroundColor: "#ffffff",
                  minWidth: 650,
                  "& td, & th": {
                    border: "1px solid #cbd5e1",
                    padding: "8px 12px !important",
                    color: "#0f172a",
                    height: "auto",
                    lineHeight: "1.5",
                    fontSize: "14px",
                  },
                  "& th": {
                    backgroundColor: "#e2e8f0",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  },
                  // "& tbody tr:hover": {
                  //   backgroundColor: "#e0f2fe",
                  // },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "60px" }}>№</TableCell>
                    <TableCell align="right">Дата</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                    <TableCell align="center" sx={{ width: "200px" }}>
                      Оплата
                    </TableCell>
                    <TableCell align="right">Оплачено</TableCell>
                    <TableCell align="right">Статус</TableCell>
                    <TableCell sx={{ width: "60px" }}></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {product.payment_graphics.map((payment, index) => {
                    const inputValue =
                      paymentInputs[payment._id] ??
                      String(payment.payment_paid_amount ?? 0);
                    const isFullyPaid =
                      payment.payment_paid_amount >= payment.payment_amount;
                    const isEditing = editModes[payment._id] || false;

                    return (
                      <TableRow
                        key={payment._id}
                        className={`transition-all duration-200 ${
                          isFullyPaid && !isEditing ? "opacity-50" : ""
                        }`}
                      >
                        <TableCell>{"№ " + String(index + 1)}</TableCell>

                        <TableCell align="right">
                          {new Date(
                            payment.payment_schedualed_pay_day
                          ).toLocaleDateString("ru-RU")}
                        </TableCell>

                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(payment.payment_amount)}
                        </TableCell>

                        <TableCell align="center">
                          <Box className="flex items-center gap-x-2 justify-center">
                            <TextField
                              value={inputValue}
                              onChange={(e) =>
                                handlePaymentChange(payment._id, e.target.value)
                              }
                              type="number"
                              disabled={!isEditing}
                              variant="standard"
                              sx={{
                                width: "120px",
                                "& input": {
                                  padding: "4px 8px",
                                  fontSize: "14px",
                                  textAlign: "right",
                                  color: "#0f172a",
                                  "::placeholder": { color: "#64748b" },
                                  backgroundColor: isEditing
                                    ? "#f1f5f9"
                                    : "transparent",
                                  borderRadius: "2px",
                                },
                                "& .Mui-disabled": {
                                  WebkitTextFillColor: "#64748b",
                                },
                              }}
                              InputProps={{
                                disableUnderline: true,
                              }}
                            />

                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(payment._id)}
                              sx={{
                                color: isEditing ? "#1e40af" : "#64748b",
                                "&:hover": {
                                  backgroundColor: "#e0f2fe",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600, color: "#047857" }}
                        >
                          {formatCurrency(payment.payment_paid_amount)}
                        </TableCell>

                        <TableCell align="right">
                          {payment.payment_completed_date ? (
                            <span className="text-emerald-600 flex items-center justify-end gap-1">
                              <CheckCircle size={16} />
                              {new Date(
                                payment.payment_completed_date
                              ).toLocaleDateString("ru-RU")}
                            </span>
                          ) : (
                            <span className="text-gray-500 flex items-center justify-end gap-1">
                              <XCircle size={16} />
                              Не оплачено
                            </span>
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Button
                            onClick={() => handleAddOrUpdatePayment(payment)}
                            disabled={
                              addPaymentMutation.isPending ||
                              updatePaymentMutation.isPending ||
                              isFullyPaid
                            }
                            variant="contained"
                            size="small"
                            sx={{
                              minWidth: "40px",
                              padding: "6px 12px",
                              backgroundColor: "#047857",
                              "&:hover": {
                                backgroundColor: "#065f46",
                              },
                              "&:disabled": {
                                backgroundColor: "#cbd5e1",
                                color: "#64748b",
                              },
                              transition: "all 0.2s",
                              borderRadius: "2px",
                            }}
                          >
                            <DoneIcon fontSize="small" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </>
      );
    },
  });

  const handleAddRow = () => {
    // Agar allaqachon row mavjud bo'lsa, yangi row qo'shmaslik
    if (newRows.length > 0) {
      return;
    }

    const newRow: NewProductRow = {
      id: `new-row-${Date.now()}`,
      data: {
        product_name: "",
        product_full_amount: "",
        product_pre_paid_amount: "",
        product_payment_period_start_date: "",
        product_payment_period_end_date: "",
        product_profit_amount: "",
      },
    };
    setNewRows([newRow]);
    setShowAddButtons(true);
  };

  const handleRemoveRow = (id: string) => {
    const updatedRows = newRows.filter((row) => row.id !== id);
    setNewRows(updatedRows);
    if (updatedRows.length === 0) {
      setShowAddButtons(false);
    }
  };

  const handleCancel = () => {
    setNewRows([]);
    setShowAddButtons(false);
    reset();
  };

  const onSubmit = async (data: Record<string, NewProductForm>) => {
    try {
      let addedProductId: string | null = null;

      for (const rowId of Object.keys(data)) {
        const formData = data[rowId];

        const productData: AddProductDto = {
          product_name: formData.product_name,
          product_full_amount: Number(formData.product_full_amount),
          product_pre_paid_amount: Number(formData.product_pre_paid_amount),
          product_payment_period_start_date:
            formData.product_payment_period_start_date,
          product_payment_period_end_date:
            formData.product_payment_period_end_date,
          product_profit_amount: formData.product_profit_amount,
        };

        const addedProduct = await addProductMutation.mutateAsync({
          orderId: saleId,
          data: productData,
        });

        if (addedProduct?.data?.order_products) {
          addedProductId =
            addedProduct.data.order_products[
              addedProduct.data.order_products.length - 1
            ]._id;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["order", saleId] });

      setLastAddedProductId(addedProductId);
      setShowActionButtons(true); // Buttonlarni ko'rsatish
      setNewRows([]);
      setShowAddButtons(false);
      reset();
    } catch (error) {
      console.error("Mahsulot qo'shishda xatolik:", error);
    }
  };

  const handleCreateGraphic = async () => {
    if (!lastAddedProductId) return;

    try {
      await sendOrderProductPaymentGraphics.mutateAsync({
        orderId: saleId,
        productId: lastAddedProductId,
      });
      await queryClient.refetchQueries({ queryKey: ["order", saleId] });
      await new Promise((resolve) => setTimeout(resolve, 500));

      setOpenGraphicConfirmDialog(false);
      setShowActionButtons(false); // ✅ Bu muhim
      setLastAddedProductId(null); // ✅ Bu muhim

      setTimeout(async () => {
        await queryClient.invalidateQueries({ queryKey: ["order", saleId] });
        setShowActionButtons(false);
        setLastAddedProductId(null);
      }, 300);
    } catch (error) {
      console.error("Grafik yaratishda xatolik:", error);
    }
  };

  useEffect(() => {
    if (isOpen && order?.order_products) {
      const lastProduct = order.order_products[order.order_products.length - 1];
      if (
        lastProduct &&
        (!lastProduct.payment_graphics ||
          lastProduct.payment_graphics.length === 0)
      ) {
        setShowActionButtons(true);
        setLastAddedProductId(lastProduct._id);
      } else {
        setShowActionButtons(false);
        setLastAddedProductId(null);
      }
    }
  }, [isOpen, order?.order_products]);

  return (
    <>
      <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleCloseDrawer}
        />

        <div
          className="absolute right-0 top-0 h-full w-350 bg-white shadow-2xl border-l border-slate-300"
          style={{
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-out",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-300 bg-slate-50 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2">
                <FileText size={24} className="text-blue-700" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                Подробности продажи: {order?.order_generated_id || saleId}
              </h2>
            </div>
            <button
              onClick={handleCloseDrawer}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-200 p-2 transition-all duration-200"
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

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100%-80px)] p-1 bg-slate-50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <CircularProgress sx={{ color: "#1e40af" }} size={50} />
                <span className="text-slate-600 font-medium">Загрузка...</span>
              </div>
            ) : (
              <>
                {/* Info Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-white border border-slate-300 p-4 flex items-center gap-3">
                    <FileText className="text-blue-700" size={24} />
                    <div>
                      <p className="text-slate-600 text-xs">ID Заказа</p>
                      <p className="text-slate-900 font-bold">
                        {order?.order_generated_id || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-300 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-blue-700" size={18} />
                      <p className="text-slate-600 text-xs">Клиент</p>
                    </div>
                    <Select
                      fullWidth
                      size="small"
                      displayEmpty
                      disabled={assignClientMutation.isPending}
                      value={order?.order_assigned_client?._id || ""}
                      onChange={async (e) => {
                        const selectedClient = clients?.find(
                          (c) => c._id === e.target.value
                        );

                        if (!selectedClient) return;

                        try {
                          await assignClientMutation.mutateAsync({
                            orderId: saleId,
                            data: {
                              client_id: selectedClient._id ?? "",
                            },
                          });

                          await queryClient.invalidateQueries({
                            queryKey: ["order", saleId],
                          });
                        } catch (err) {
                          console.error("Ошибка при назначении клиента:", err);
                        }
                      }}
                      renderValue={(selected) => {
                        if (!selected) {
                          if (assignClientMutation.isPending) {
                            return (
                              <Box className="flex items-center gap-2">
                                <CircularProgress size={16} />
                                <span className="text-slate-500 text-sm">
                                  Назначение...
                                </span>
                              </Box>
                            );
                          }
                          return (
                            <span className="text-slate-500 text-sm">
                              Клиент не назначен
                            </span>
                          );
                        }
                        const client = clients?.find((c) => c._id === selected);
                        return (
                          <span className="text-slate-900 font-semibold text-sm">
                            {client?.client_name} {client?.client_surname}
                          </span>
                        );
                      }}
                      sx={{
                        backgroundColor: "#ffffff",
                        color: "#0f172a",
                        borderRadius: "2px",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#cbd5e1",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1e40af",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "#64748b",
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            "& .MuiMenuItem-root": {
                              color: "#0f172a",
                              "&:hover": {
                                backgroundColor: "#e0f2fe",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "#1e40af",
                                color: "#ffffff",
                                "&:hover": {
                                  backgroundColor: "#1e3a8a",
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem disabled value="">
                        <em>Выберите клиента</em>
                      </MenuItem>
                      {clients?.map((client) => (
                        <MenuItem key={client._id} value={client._id}>
                          {client.client_name} {client.client_surname}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>

                  <div className="bg-white border border-slate-300 p-4 flex items-center gap-3">
                    <Calendar className="text-blue-700" size={24} />
                    <div>
                      <p className="text-slate-600 text-xs">Дата создания</p>
                      <p className="text-slate-900 font-bold">
                        {order?.order_created_date
                          ? new Date(
                              order.order_created_date
                            ).toLocaleDateString("ru-RU")
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-300 p-4 flex items-center gap-3">
                    <AlertCircle className="text-blue-700" size={24} />
                    <div>
                      <p className="text-slate-600 text-xs">Статус</p>
                      <p className="text-slate-900 font-bold">
                        {order?.order_status === "process"
                          ? "Активный"
                          : order?.order_status === "finished"
                          ? "Завершен"
                          : order?.order_status === "canceled"
                          ? "Отменен"
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white border border-slate-300 p-1 mb-6">
                  <MaterialReactTable table={table} />
                </div>

                {/* New Product Rows */}
                {newRows.length > 0 && (
                  <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
                    <div className="bg-white border border-slate-300 overflow-hidden">
                      <div className="bg-slate-100 grid grid-cols-6 gap-4 p-1 font-semibold text-sm text-slate-700">
                        <div>Названия товара</div>
                        <div>Общая сумма</div>
                        <div>Предоплата</div>
                        <div>Сумма прибыли от продукта</div>
                        <div>Дата начало</div>
                        <div>Дата окончания</div>
                      </div>

                      {newRows.map((row, _idx) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-6 gap-4 p-4 border-t border-slate-300"
                        >
                          <Controller
                            name={`${row.id}.product_name`}
                            control={control}
                            rules={{ required: "Название товара обязательно" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Название товара"
                                size="small"
                                fullWidth
                                error={!!errors[row.id]?.product_name}
                                helperText={
                                  errors[row.id]?.product_name?.message
                                }
                                placeholder="Введите название"
                                sx={{
                                  "& .MuiInputBase-root": {
                                    backgroundColor: "#ffffff",
                                    color: "#0f172a",
                                    borderRadius: "2px",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#cbd5e1",
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#1e40af",
                                  },
                                  "& .MuiInputLabel-root": {
                                    color: "#64748b",
                                  },
                                }}
                              />
                            )}
                          />
                          <Controller
                            name={`${row.id}.product_full_amount`}
                            control={control}
                            rules={{
                              required: "Общая сумма обязательна",
                              pattern: {
                                value: /^[0-9]+$/,
                                message: "Только числа",
                              },
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Общая сумма"
                                size="small"
                                fullWidth
                                type="number"
                                error={!!errors[row.id]?.product_full_amount}
                                helperText={
                                  errors[row.id]?.product_full_amount?.message
                                }
                                placeholder="0"
                                sx={{
                                  "& .MuiInputBase-root": {
                                    backgroundColor: "#ffffff",
                                    color: "#0f172a",
                                    borderRadius: "2px",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#cbd5e1",
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#1e40af",
                                  },
                                  "& .MuiInputLabel-root": {
                                    color: "#64748b",
                                  },
                                }}
                              />
                            )}
                          />

                          <Controller
                            name={`${row.id}.product_pre_paid_amount`}
                            control={control}
                            rules={{
                              required: "Предоплата обязательна",
                              pattern: {
                                value: /^[0-9]+$/,
                                message: "Только числа",
                              },
                            }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Предоплата"
                                size="small"
                                fullWidth
                                type="number"
                                error={
                                  !!errors[row.id]?.product_pre_paid_amount
                                }
                                helperText={
                                  errors[row.id]?.product_pre_paid_amount
                                    ?.message
                                }
                                placeholder="0"
                                sx={{
                                  "& .MuiInputBase-root": {
                                    backgroundColor: "#ffffff",
                                    color: "#0f172a",
                                    borderRadius: "2px",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#cbd5e1",
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#1e40af",
                                  },
                                  "& .MuiInputLabel-root": {
                                    color: "#64748b",
                                  },
                                }}
                              />
                            )}
                          />

                          <Controller
                            name={`${row.id}.product_profit_amount`}
                            control={control}
                            rules={{
                              required:
                                "Указание сумма прибыли по продукту обязательно",
                              validate: (value: string | number) => {
                                const profit = Number(value);
                                const fullAmount = Number(
                                  getValues(`${row.id}.product_full_amount`)
                                );

                                if (isNaN(profit)) {
                                  return "Введите число";
                                }

                                if (profit < 0) {
                                  return "Значение не может быть меньше 0";
                                }

                                if (profit > fullAmount) {
                                  return `Сумма не может превышать ${fullAmount}`;
                                }

                                return true;
                              },
                            }}
                            render={({ field }) => {
                              const maxValue =
                                Number(
                                  getValues(`${row.id}.product_full_amount`)
                                ) || 100;

                              return (
                                <TextField
                                  {...field}
                                  label="Сумма прибыли"
                                  size="small"
                                  fullWidth
                                  type="number"
                                  inputProps={{
                                    min: 0,
                                    max: maxValue,
                                  }}
                                  error={
                                    !!errors?.[row.id]?.product_profit_amount
                                  }
                                  helperText={
                                    errors?.[row.id]?.product_profit_amount
                                      ?.message as string
                                  }
                                  placeholder="0"
                                  sx={{
                                    "& .MuiInputBase-root": {
                                      backgroundColor: "#ffffff",
                                      color: "#0f172a",
                                      borderRadius: "2px",
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                      borderColor: "#cbd5e1",
                                    },
                                    "&:hover .MuiOutlinedInput-notchedOutline":
                                      {
                                        borderColor: "#1e40af",
                                      },
                                    "& .MuiInputLabel-root": {
                                      color: "#64748b",
                                    },
                                  }}
                                />
                              );
                            }}
                          />

                          <Controller
                            name={`${row.id}.product_payment_period_start_date`}
                            control={control}
                            rules={{ required: "Дата начала обязательна" }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Дата начала"
                                size="small"
                                fullWidth
                                type="date"
                                error={
                                  !!errors[row.id]
                                    ?.product_payment_period_start_date
                                }
                                helperText={
                                  errors[row.id]
                                    ?.product_payment_period_start_date?.message
                                }
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                  "& .MuiInputBase-root": {
                                    backgroundColor: "#ffffff",
                                    color: "#0f172a",
                                    borderRadius: "2px",
                                  },
                                  "& .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#cbd5e1",
                                  },
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: "#1e40af",
                                  },
                                  "& .MuiInputLabel-root": {
                                    color: "#64748b",
                                  },
                                }}
                              />
                            )}
                          />

                          <div className="flex items-center gap-x-3">
                            <div className="flex-1">
                              <Controller
                                name={`${row.id}.product_payment_period_end_date`}
                                control={control}
                                rules={{
                                  required: "Дата окончания обязательна",
                                }}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label="Дата окончания"
                                    size="small"
                                    fullWidth
                                    type="date"
                                    error={
                                      !!errors[row.id]
                                        ?.product_payment_period_end_date
                                    }
                                    helperText={
                                      errors[row.id]
                                        ?.product_payment_period_end_date
                                        ?.message
                                    }
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                      "& .MuiInputBase-root": {
                                        backgroundColor: "#ffffff",
                                        color: "#0f172a",
                                        borderRadius: "2px",
                                      },
                                      "& .MuiOutlinedInput-notchedOutline": {
                                        borderColor: "#cbd5e1",
                                      },
                                      "&:hover .MuiOutlinedInput-notchedOutline":
                                        {
                                          borderColor: "#1e40af",
                                        },
                                      "& .MuiInputLabel-root": {
                                        color: "#64748b",
                                      },
                                    }}
                                  />
                                )}
                              />
                            </div>
                            <IconButton
                              onClick={() => handleRemoveRow(row.id)}
                              size="small"
                              sx={{
                                color: "#dc2626",
                                "&:hover": {
                                  backgroundColor: "#fee2e2",
                                },
                              }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </form>
                )}

                {/* Action Buttons */}
                {(order?.order_products?.length ?? 0) < 1 && (
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="contained"
                      onClick={handleAddRow}
                      disabled={
                        newRows.length > 0 || !order?.order_assigned_client?._id
                      } // Client tanlanmagan bo'lsa disabled
                      startIcon={<Plus size={18} />}
                      sx={{
                        backgroundColor: "#1e40af",
                        "&:hover": {
                          backgroundColor: "#1e3a8a",
                        },
                        "&:disabled": {
                          // Bu qo'shildi
                          backgroundColor: "#cbd5e1",
                          color: "#64748b",
                        },
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        py: 1.2,
                        borderRadius: "2px",
                      }}
                    >
                      Добавить товар
                    </Button>
                    {showAddButtons && (
                      <>
                        <Button
                          variant="outlined"
                          onClick={handleCancel}
                          sx={{
                            borderColor: "#64748b",
                            color: "#0f172a",
                            "&:hover": {
                              borderColor: "#64748b",
                              backgroundColor: "#f1f5f9",
                            },
                            textTransform: "none",
                            fontWeight: 700,
                            px: 3,
                            py: 1.2,
                            borderRadius: "2px",
                          }}
                        >
                          Отмена
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleSubmit(onSubmit)}
                          disabled={
                            addProductMutation.isPending ||
                            !order?.order_assigned_client?._id
                          } // Client tanlanmagan bo'lsa disabled
                          startIcon={<Package size={18} />}
                          sx={{
                            backgroundColor: "#047857",
                            "&:hover": {
                              backgroundColor: "#065f46",
                            },
                            "&:disabled": {
                              backgroundColor: "#cbd5e1",
                              color: "#64748b",
                            },
                            textTransform: "none",
                            fontWeight: 700,
                            px: 3,
                            py: 1.2,
                            borderRadius: "2px",
                          }}
                        >
                          {addProductMutation.isPending ? (
                            <>
                              <CircularProgress
                                size={18}
                                sx={{ color: "white", mr: 1 }}
                              />
                              Сохранение...
                            </>
                          ) : (
                            "Создать"
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {/* Grafik yaratish uchun tasdiqlash modali */}
                <Dialog
                  open={openGraphicConfirmDialog}
                  onClose={() => setOpenGraphicConfirmDialog(false)}
                  PaperProps={{
                    sx: {
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "2px",
                    },
                  }}
                >
                  <DialogTitle sx={{ color: "#0f172a", fontWeight: 700 }}>
                    Построение графика
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText sx={{ color: "#475569" }}>
                      После построения графика данные изменить повторно будет
                      невозможно.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => setOpenGraphicConfirmDialog(false)}
                      sx={{ color: "#64748b", borderRadius: "2px" }}
                    >
                      Нет
                    </Button>
                    <Button
                      onClick={handleCreateGraphic}
                      variant="contained"
                      disabled={sendOrderProductPaymentGraphics.isPending}
                      sx={{
                        backgroundColor: "#047857",
                        "&:hover": { backgroundColor: "#065f46" },
                        borderRadius: "2px",
                      }}
                    >
                      Да
                    </Button>
                  </DialogActions>
                </Dialog>

                {/* Edit Form - mahsulotni tahrirlash */}
                {showEditForm && editFormData && (
                  <div className="bg-white border border-slate-300 overflow-hidden mb-6">
                    <div className="bg-blue-50 border-b border-blue-200 p-4">
                      <h3 className="text-blue-900 font-bold flex items-center gap-2">
                        <EditIcon />
                        Редактирование товара
                      </h3>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <TextField
                          label="Название товара"
                          size="small"
                          fullWidth
                          value={editFormData.product_name}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              product_name: e.target.value,
                            })
                          }
                          sx={{
                            "& .MuiInputBase-root": {
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              borderRadius: "2px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#cbd5e1",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1e40af",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#64748b",
                            },
                          }}
                        />

                        <TextField
                          label="Общая сумма"
                          size="small"
                          fullWidth
                          type="number"
                          value={editFormData.product_full_amount}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              product_full_amount: e.target.value,
                            })
                          }
                          sx={{
                            "& .MuiInputBase-root": {
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              borderRadius: "2px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#cbd5e1",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1e40af",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#64748b",
                            },
                          }}
                        />

                        <TextField
                          label="Предоплата"
                          size="small"
                          fullWidth
                          type="number"
                          value={editFormData.product_pre_paid_amount}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              product_pre_paid_amount: e.target.value,
                            })
                          }
                          sx={{
                            "& .MuiInputBase-root": {
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              borderRadius: "2px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#cbd5e1",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1e40af",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#64748b",
                            },
                          }}
                        />

                        <TextField
                          label="Сумма прибыли"
                          size="small"
                          fullWidth
                          type="number"
                          value={editFormData.product_profit_amount}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              product_profit_amount: e.target.value,
                            })
                          }
                          sx={{
                            "& .MuiInputBase-root": {
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              borderRadius: "2px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#cbd5e1",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1e40af",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#64748b",
                            },
                          }}
                        />

                        <TextField
                          label="Дата начала"
                          size="small"
                          fullWidth
                          type="date"
                          value={editFormData.product_payment_period_start_date}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              product_payment_period_start_date: e.target.value,
                            })
                          }
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiInputBase-root": {
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              borderRadius: "2px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#cbd5e1",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1e40af",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#64748b",
                            },
                          }}
                        />

                        <TextField
                          label="Дата окончания"
                          size="small"
                          fullWidth
                          type="date"
                          value={editFormData.product_payment_period_end_date}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              product_payment_period_end_date: e.target.value,
                            })
                          }
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiInputBase-root": {
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              borderRadius: "2px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#cbd5e1",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#1e40af",
                            },
                            "& .MuiInputLabel-root": {
                              color: "#64748b",
                            },
                          }}
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-4">
                        <Button
                          variant="outlined"
                          onClick={handleCancelEdit}
                          sx={{
                            borderColor: "#64748b",
                            color: "#0f172a",
                            "&:hover": {
                              borderColor: "#64748b",
                              backgroundColor: "#f1f5f9",
                            },
                            textTransform: "none",
                            fontWeight: 700,
                            px: 3,
                            py: 1.2,
                            borderRadius: "2px",
                          }}
                        >
                          Отмена
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleUpdateProduct}
                          disabled={updateProductMutation.isPending}
                          startIcon={<DoneIcon />}
                          sx={{
                            backgroundColor: "#1e40af",
                            "&:hover": {
                              backgroundColor: "#1e3a8a",
                            },
                            "&:disabled": {
                              backgroundColor: "#cbd5e1",
                              color: "#64748b",
                            },
                            textTransform: "none",
                            fontWeight: 700,
                            px: 3,
                            py: 1.2,
                            borderRadius: "2px",
                          }}
                        >
                          {updateProductMutation.isPending ? (
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
                )}

                {/* Action buttonlar - mahsulot qo'shilgandan keyin */}
                {showActionButtons && (
                  <div className="flex justify-end gap-3 mb-6">
                    <Button
                      variant="outlined"
                      onClick={() =>
                        order?.order_products?.[
                          order.order_products.length - 1
                        ] &&
                        handleEditProduct(
                          order?.order_products?.[
                            order.order_products.length - 1
                          ]
                        )
                      }
                      startIcon={<EditIcon />}
                      sx={{
                        borderColor: "#1e40af",
                        color: "#1e40af",
                        "&:hover": {
                          borderColor: "#1e3a8a",
                          backgroundColor: "#dbeafe",
                        },
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        py: 1.2,
                        borderRadius: "2px",
                      }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setOpenGraphicConfirmDialog(true)}
                      startIcon={<Calendar size={18} />}
                      sx={{
                        backgroundColor: "#047857",
                        "&:hover": {
                          backgroundColor: "#065f46",
                        },
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        py: 1.2,
                        borderRadius: "2px",
                      }}
                    >
                      Создать график
                    </Button>
                  </div>
                )}

                {/* Summary Cards */}
                {/* {order?.order_products && order.order_products.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-50 border border-blue-200 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-700 text-sm font-medium mb-1">
                            Общая сумма
                          </p>
                          <p className="text-slate-900 text-3xl font-bold">
                            {formatCurrency(totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-700 text-sm font-medium mb-1">
                            Предоплата
                          </p>
                          <p className="text-slate-900 text-3xl font-bold">
                            {formatCurrency(totalPrepayment)}
                          </p>
                        </div>
                        <CheckCircle size={40} className="text-emerald-700" />
                      </div>
                    </div>
                  </div>
                )} */}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailsDrawer;
