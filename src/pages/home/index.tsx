import { useMemo, useState, useEffect, type JSX } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { generateUniqueId } from "../../functions";
import type { ClientType, OrderType } from "./types";
import Container from "../../components/container";
import DetailsDrawer from "./ui/details-drawer";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  TextField,
  IconButton,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { FileSpreadsheet, Plus } from "lucide-react";
import CreateClientDrawer from "./ui/create-client-drawer";
import ClientsListDrawer from "./ui/clients-list-drawer";
import CommentListDrawer from "./ui/comment-list-drawer";
import CommentCreateEditDrawer from "./ui/comment-create-edit-drawer";
import { useAuthStore } from "../../store/auth.store";
import {
  useCreateOrder,
  useGetAllOrders,
  useDeleteOrderById,
  useUpdateOrderAssignedIndex,
  useAddPaymentToOrderProduct,
  useUpdatePaymentOfOrderProduct,
} from "../../queries/useOrder";

import {
  useGetTodaysPayments,
  useGetUnfinishedPayments,
} from "../../queries/useClients";
import "./style.css";
import EditIcon from "@mui/icons-material/Edit";
import DoneIcon from "@mui/icons-material/Done";
import { useQueryClient } from "@tanstack/react-query";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Активный":
      return "bg-emerald-600 text-white border border-emerald-700";
    case "Завершен":
      return "bg-blue-600 text-white border border-blue-700";
    case "Ожидание":
      return "bg-amber-600 text-white border border-amber-700";
    case "Отменен":
      return "bg-rose-600 text-white border border-rose-700";
    default:
      return "bg-gray-600 text-white border border-gray-700";
  }
};

const StatCard = ({
  title,
  value,
  color,
  editable = false,
  onValueChange,
}: {
  title: string;
  value: string | number;
  color: string;
  editable?: boolean;
  onValueChange?: (val: string) => void;
}) => {
  return (
    <Card
      sx={{
        minWidth: 200,
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        flex: 1,
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#64748b",
            mb: 1.5,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </Typography>
        {editable ? (
          <TextField
            type="number"
            value={value}
            onChange={(e) => onValueChange?.(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              width: "100%",
              "& input": {
                fontSize: 24,
                fontWeight: 700,
                color: color,
                padding: "8px 12px",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#e2e8f0",
                },
                "&:hover fieldset": {
                  borderColor: "#cbd5e1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: color,
                },
              },
            }}
          />
        ) : (
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 700,
              color: color,
            }}
          >
            {typeof value === "number" ? value.toLocaleString("ru-RU") : value}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default function SalesTable() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateClient, setIsCreateClient] = useState(false);
  const [initial, setInitial] = useState<ClientType | null>(null);
  const [isListClient, setIsListClient] = useState(false);
  // Comments drawer state
  const [isListComment, setIsListComment] = useState(false);
  const [isCreateComment, setIsCreateComment] = useState(false);
  const [commentInitial, setCommentInitial] = useState<any | null>(null);
  const [saleId, setSaleId] = useState("");
  const [tableIndex, setTableIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [investment, setInvestment] = useState<string>("");
  // Custom profit state (persisted to localStorage). Default to "0" until user changes it.
  const [profitValue, setProfitValue] = useState<string>("0");
  const [orderIndexInputs, setOrderIndexInputs] = useState<{
    [key: string]: string;
  }>({});
  const [orderIndexEditModes, setOrderIndexEditModes] = useState<{
    [key: string]: boolean;
  }>({});

  // NEW: State for new order modal
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [newOrderIndex, setNewOrderIndex] = useState<string>("");

  const getTodaysPayments = useGetTodaysPayments();
  const getUnfinishedPayments = useGetUnfinishedPayments();

  // Payment functionality states
  const [paymentInputs, setPaymentInputs] = useState<{
    [key: string]: string;
  }>({});
  const [editModes, setEditModes] = useState<{ [key: string]: boolean }>({});
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [dialogPaymentData, setDialogPaymentData] = useState<any>(null);
  const [clientSearch, setClientSearch] = useState("");

  const queryClient = useQueryClient();
  const addPaymentMutation = useAddPaymentToOrderProduct();
  const updatePaymentMutation = useUpdatePaymentOfOrderProduct();

  const { logout } = useAuthStore();
  const { data: orders, isLoading } = useGetAllOrders();
  const createOrder = useCreateOrder();
  const updateOrderAssignedIndex = useUpdateOrderAssignedIndex();
  const deleteOrder = useDeleteOrderById();

  // Load investment from localStorage
  useEffect(() => {
    const savedInvestment = localStorage.getItem("investment");
    if (savedInvestment) {
      setInvestment(savedInvestment);
    }
  }, []);

  // Save investment to localStorage
  const handleInvestmentChange = (value: string) => {
    setInvestment(value);
    localStorage.setItem("investment", value);
  };

  // Save profit to localStorage
  const handleProfitChange = (value: string) => {
    setProfitValue(value);
    localStorage.setItem("profit", value);
  };

  // Load profit from localStorage on mount
  useEffect(() => {
    const savedProfit = localStorage.getItem("profit");
    if (savedProfit) {
      setProfitValue(savedProfit);
    } else {
      setProfitValue("0");
    }
  }, []);

  // Calculate metrics based on orders
  const metrics = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        investment: Number(investment) || 0,
        expenses: 0,
        payments: 0,
        profit: Number(profitValue) || 0,
        balance: Number(investment) || 0,
      };
    }

    // Jami Сумма (Total amount of all products)
    const totalAmount = orders.reduce((sum, order) => {
      return (
        sum +
        order.order_products.reduce((pSum, product) => {
          return pSum + product.product_full_amount;
        }, 0)
      );
    }, 0);

    // Jami Предоплаты (Total prepaid amount from all products)
    const totalPrepayment = orders.reduce((sum, order) => {
      return (
        sum +
        order.order_products.reduce((pSum, product) => {
          return pSum + (product.product_pre_paid_amount || 0);
        }, 0)
      );
    }, 0);

    // Затраты (Expenses) = Jami Сумма - Jami Предоплаты
    const expenses = totalAmount - totalPrepayment;

    // Оплаты (Payments) = Total paid amount across all orders
    const payments = orders.reduce((sum, order) => {
      return (
        sum +
        order.order_products.reduce((pSum, product) => {
          return (
            pSum +
            (product.payment_graphics || []).reduce((paySum, pay) => {
              return paySum + (pay.payment_paid_amount || 0);
            }, 0)
          );
        }, 0)
      );
    }, 0);

    // Note: profit is taken from the user-provided value (persisted), defaulting to 0.
    const investmentNum = Number(investment) || 0;
    const profitNum = Number(profitValue) || 0;
    const balance = investmentNum - expenses + payments - profitNum;

    return {
      investment: investmentNum,
      expenses,
      payments,
      profit: profitNum,
      balance,
    };
  }, [investment, orders, profitValue]);

  const handleRowClick = (id: string, tableId: number) => {
    setIsOpen(true);
    setSaleId(id);
    setTableIndex(tableId);
    // console.log(tableId);
  };

  // NEW: Open modal for new order
  const handleNewSaleClick = () => {
    setNewOrderIndex("0");
    setNewOrderModalOpen(true);
  };

  // NEW: Create order with custom index
  const handleCreateNewOrder = async () => {
    const order_generated_id = generateUniqueId();
    await createOrder.mutateAsync({
      order_generated_id,
      order_assigned_index: Number(newOrderIndex) || 0,
    });
    setNewOrderModalOpen(false);
    setNewOrderIndex("");
  };

  // NEW: Cancel new order modal
  const handleCancelNewOrder = () => {
    setNewOrderModalOpen(false);
    setNewOrderIndex("");
  };

  const handleOrderIndexEdit = async (orderId: string, value?: string) => {
    try {
      const indexValue = Number(value ?? orderIndexInputs[orderId] ?? 0) || 0;

      // update local input state so value persists in UI
      setOrderIndexInputs((prev) => ({
        ...prev,
        [orderId]: String(indexValue),
      }));

      // call API to patch order_assigned_index
      await updateOrderAssignedIndex.mutateAsync({
        order_id: orderId,
        order_assigned_index: indexValue,
      });
    } catch (err) {
      console.error("Failed to update order index:", err);
    }
  };

  const handleDeleteClick = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      setIsDeleting(true);
      try {
        await deleteOrder.mutateAsync(orderToDelete);
        setDeleteDialogOpen(false);
        setOrderToDelete(null);
      } catch (error) {
        console.error("Error deleting order:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleGetTodaysPayments = async () => {
    try {
      const res = await getTodaysPayments.mutateAsync();
      console.log("Платежи сегодня:", res);
    } catch (error) {
      console.error("Ошибка при получении оплат за сегодня:", error);
    }
  };

  const handleGetUnfinishedPayments = async () => {
    try {
      const res = await getUnfinishedPayments.mutateAsync();
      console.log("Должники:", res);
    } catch (error) {
      console.error("Ошибка при получении должников:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  // Payment handlers
  const handlePaymentChange = (paymentKey: string, value: string) => {
    setPaymentInputs((prev) => ({ ...prev, [paymentKey]: value }));
  };

  const handleEditClick = (paymentKey: string) => {
    setEditModes((prev) => ({
      ...prev,
      [paymentKey]: !prev[paymentKey],
    }));
  };

  const handleAddOrUpdatePayment = async (
    order: OrderType,
    payment: any,
    paymentKey: string,
    tableIndex: number
  ) => {
    const inputValue = Number(paymentInputs[paymentKey] || 0);

    try {
      const product = order.order_products[0];
      if (!product) return;

      if (editModes[paymentKey]) {
        await updatePaymentMutation.mutateAsync({
          orderId: order._id,
          productId: product._id,
          paymentId: payment._id,
          table_index: tableIndex,
          data: { amount: inputValue },
        });
      } else {
        await addPaymentMutation.mutateAsync({
          orderId: order._id,
          productId: product._id,
          paymentId: payment._id,
          table_index: tableIndex,
          data: { amount: inputValue },
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      setEditModes((prev) => ({ ...prev, [paymentKey]: false }));
      window.location.reload();
    } catch (err) {
      console.error("Ошибка при оплате:", err);
    }
  };

  const handlePaymentDialogConfirm = () => {
    if (!dialogPaymentData) return;
    const { paymentKey, payment } = dialogPaymentData;
    setPaymentInputs((prev) => ({
      ...prev,
      [paymentKey]: String(payment.payment_amount),
    }));
    setOpenPaymentDialog(false);
    setDialogPaymentData(null);
  };

  const handlePaymentDialogClose = () => {
    setOpenPaymentDialog(false);
    setDialogPaymentData(null);
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      let matches = true;

      // Model search
      if (modelSearch.trim()) {
        const modelName =
          order.order_products?.[0]?.product_name || "Не назначено";
        matches =
          matches &&
          modelName.toLowerCase().includes(modelSearch.toLowerCase());
      }

      // Client search
      if (clientSearch.trim()) {
        const clientName = order.order_assigned_client
          ? `${order.order_assigned_client.client_name} ${order.order_assigned_client.client_surname}`.toLowerCase()
          : "не назначен";
        matches = matches && clientName.includes(clientSearch.toLowerCase());
      }

      return matches;
    });
  }, [orders, modelSearch, clientSearch]);

  // console.log(orders);

  const columns = useMemo<MRT_ColumnDef<OrderType>[]>(() => {
    return [
      {
        accessorKey: "_id",
        header: "№",
        size: 60,
        minSize: 60,
        maxSize: 60,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        muiTableHeadCellProps: {
          sx: {
            width: "50px",
            minWidth: "50px",
            maxWidth: "50px",
            backgroundColor: "#e2e8f0",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            width: "50px",
            minWidth: "50px",
            maxWidth: "50px",
            textAlign: "center",
          },
        },
        Cell: ({ row }) => (
          <div
            className="font-medium text-[14px] text-gray-800 text-center p-1"
            onClick={() => handleRowClick(row.original._id, row.index + 1)}
          >
            {row.index + 1}
          </div>
        ),
      },
      {
        accessorKey: "order_generated_id",
        header: "ID ЗАКАЗА",
        size: 140,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div
            className="font-mono text-[14px] text-blue-700 font-bold cursor-pointer hover:text-blue-800 transition-colors duration-200"
            onClick={() =>
              handleRowClick(cell.row.original._id, cell.row.index + 1)
            }
          >
            {cell.getValue<string>()?.replace("#", "") || ""}
          </div>
        ),
      },
      {
        id: "order_assigned_index",
        header: "ИНДЕКС",
        size: 120,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }: any) => {
          const orderId = row.original._id;
          const inputValue =
            orderIndexInputs[orderId] ??
            String(row.original.order_assigned_index || 0);
          const isIndexEditing = orderIndexEditModes[orderId] || false;

          return (
            <Box className="flex items-center gap-1 w-full justify-center">
              <TextField
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setOrderIndexInputs((prev) => ({
                    ...prev,
                    [orderId]: value,
                  }));
                }}
                type="number"
                disabled={!isIndexEditing}
                variant="standard"
                size="small"
                sx={{
                  width: "60px",
                  "& input": {
                    padding: "2px 4px",
                    fontSize: "16px",
                    textAlign: "center",
                    color: "#0f172a",
                    "::placeholder": { color: "#9ca3af" },
                    backgroundColor: isIndexEditing ? "#e0f2fe" : "transparent",
                    borderRadius: "2px",
                  },
                  "& .Mui-disabled": {
                    WebkitTextFillColor: "#0f172a",
                  },
                }}
                InputProps={{
                  disableUnderline: true,
                }}
              />

              {!isIndexEditing ? (
                <IconButton
                  size="small"
                  onClick={() => {
                    setOrderIndexEditModes((prev) => ({
                      ...prev,
                      [orderId]: true,
                    }));
                  }}
                  sx={{
                    color: "#64748b",
                    padding: "2px",
                    "&:hover": {
                      backgroundColor: "#e2e8f0",
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => {
                    handleOrderIndexEdit(orderId, inputValue);
                    setOrderIndexEditModes((prev) => ({
                      ...prev,
                      [orderId]: false,
                    }));
                  }}
                  sx={{
                    color: "#047857",
                    padding: "2px",
                    "&:hover": {
                      backgroundColor: "#d1fae5",
                    },
                  }}
                >
                  <DoneIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>
          );
        },
      },
      {
        accessorFn: (row) =>
          row.order_assigned_client
            ? `${row.order_assigned_client.client_name} ${row.order_assigned_client.client_surname}`
            : "Не назначен",
        header: "КЛИЕНТ",
        size: 250,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        muiTableHeadCellProps: {
          sx: {
            width: "250px",
            minWidth: "250px",
            maxWidth: "250px",
            backgroundColor: "#e2e8f0",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            width: "250px",
            minWidth: "250px",
            maxWidth: "250px",
          },
        },
        Cell: ({ cell }) => (
          <div className="font-medium text-[14px] text-gray-800 px-2">
            {cell.getValue<string>()}
          </div>
        ),
      },
      {
        accessorFn: (row) =>
          row.order_products?.[0]?.product_name || "Не назначено",
        header: "МОДЕЛЬ",
        size: 450,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        muiTableHeadCellProps: {
          sx: {
            width: "350px",
            minWidth: "350px",
            maxWidth: "350px",
            backgroundColor: "#e2e8f0",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            width: "350px",
            minWidth: "350px",
            maxWidth: "350px",
            textAlign: "center",
          },
        },
        Cell: ({ cell }) => (
          <div className="font-medium text-[14px] text-gray-800">
            {cell.getValue<string>()}
          </div>
        ),
      },
      {
        accessorFn: (row) =>
          row.order_products.reduce((sum, p) => sum + p.product_full_amount, 0),
        header: "СУММА",
        size: 130,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div className="font-bold text-[14px] text-gray-900">
            {cell.getValue<number>()}
          </div>
        ),
      },
      {
        accessorFn: (row) =>
          row.order_products[0]?.payment_graphics?.[0]?.payment_amount || 0,
        header: "Оплата",
        size: 120,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div className="font-semibold text-[14px] text-gray-800">
            {cell.getValue<number>()}
          </div>
        ),
      },
      {
        accessorFn: (row) =>
          row.order_products[0]?.payment_graphics?.length || 0,
        header: "Срок",
        size: 90,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div className="font-semibold text-[14px] text-gray-800 text-center">
            {cell.getValue<number>()}
          </div>
        ),
      },
      {
        accessorKey: "order_created_date",
        header: "ДАТА",
        size: 120,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => (
          <div className="text-[14px] text-gray-800">
            {new Date(cell.getValue<string>()).toLocaleDateString("ru-RU")}
          </div>
        ),
      },

      {
        id: "payment_schedule",
        header: "Дата закрытия",
        size: 1200,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        muiTableHeadCellProps: {
          sx: {
            width: "2400px",
            minWidth: "200px",
            maxWidth: "1200",
            backgroundColor: "#e2e8f0",
          },
        },
        muiTableBodyCellProps: {
          sx: {
            width: "200px",
            minWidth: "2400px",
            maxWidth: "2400px",
            textAlign: "center",
          },
        },
        Cell: ({ row }: { row: any }) => {
          const payments =
            row.original.order_products[0]?.payment_graphics || [];
          const today = new Date();

          const paymentCells: JSX.Element[] = [];

          for (let i = 0; i < 12; i++) {
            const payment = payments[i];
            const paymentKey = `${row.original._id}-${i}`;

            const paymentAmount: number = payment?.payment_amount || 0;
            const paidAmount: number = payment?.payment_paid_amount || 0;
            const status: string | undefined = payment?.payment_status;

            const scheduled: Date | null = payment?.payment_schedualed_pay_day
              ? new Date(payment.payment_schedualed_pay_day)
              : null;

            const inProg = row.original.order_products.length === 0;

            const isFullyPaid =
              (status === "full-paid" || paidAmount >= paymentAmount) &&
              row.original.order_products.length !== 0;

            const isToday =
              scheduled && scheduled.toDateString() === today.toDateString();

            const isOverdue = scheduled && scheduled < today && !isFullyPaid;

            let bgColor = "";
            if (inProg) bgColor = "bg-gray-400";
            else if (isFullyPaid) bgColor = "bg-emerald-500";
            else if (isToday) bgColor = "bg-yellow-500";
            else if (isOverdue) bgColor = "bg-red-400";

            const inputValue =
              paymentInputs[paymentKey] ?? String(paidAmount ?? 0);
            const isEditing = editModes[paymentKey] || false;

            paymentCells.push(
              <div
                key={i}
                className={`font-medium text-[14px]  flex flex-col items-center justify-center text-center border-r border-slate-300 last:border-r-0 text-white transition-all duration-300 ${bgColor} p-1`}
                style={{
                  minWidth: "50px",
                  flex: "1 1 0",
                }}
              >
                {payment ? (
                  <Box className="flex items-center gap-1 w-full">
                    <TextField
                      value={inputValue}
                      onChange={(e) =>
                        handlePaymentChange(paymentKey, e.target.value)
                      }
                      type="number"
                      disabled={!isEditing || isFullyPaid}
                      variant="standard"
                      size="small"
                      sx={{
                        width: "70px",
                        "& input": {
                          padding: "2px 4px",
                          fontSize: "16px",
                          textAlign: "center",
                          color: "#000",
                          "::placeholder": { color: "#000" },
                          backgroundColor: isEditing
                            ? "rgba(255, 255, 255, 0.2)"
                            : "transparent",
                          borderRadius: "2px",
                        },
                        "& .Mui-disabled": {
                          WebkitTextFillColor: "#000",
                        },
                      }}
                      InputProps={{
                        disableUnderline: true,
                      }}
                    />

                    <Box className="flex items-center gap-3">
                      <IconButton
                        size="medium"
                        onClick={() => handleEditClick(paymentKey)}
                        disabled={isFullyPaid}
                        sx={{
                          color: "#6A7282",
                          padding: "2px",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                          },
                          "&:disabled": {
                            color: "rgba(255, 255, 255, 0.5)",
                          },
                        }}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>

                      <IconButton
                        onClick={() =>
                          handleAddOrUpdatePayment(
                            row.original,
                            payment,
                            paymentKey,
                            row.index + 1
                          )
                        }
                        disabled={
                          addPaymentMutation.isPending ||
                          updatePaymentMutation.isPending ||
                          isFullyPaid
                        }
                        size="medium"
                        sx={{
                          color: "#6A7282",
                          padding: "2px",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                          },
                          "&:disabled": {
                            color: "rgba(255, 255, 255, 0.5)",
                          },
                        }}
                      >
                        <DoneIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <span>-</span>
                )}
              </div>
            );
          }

          return <div className="flex w-full h-full">{paymentCells}</div>;
        },
      },
      {
        id: "payment_total",
        header: "Итого",
        size: 150,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }: any) => {
          const payments =
            row.original.order_products[0]?.payment_graphics || [];
          const totalPayments = payments.reduce(
            (sum: number, p: any) => sum + (p.payment_amount || 0),
            0
          );
          return (
            <div className="font-bold text-[14px] text-black flex items-center justify-center text-center  px-3 py-1.5 transition-all duration-200 hover:bg-gray-600 hover:text-white">
              {totalPayments}
            </div>
          );
        },
      },
      {
        accessorFn: (row) =>
          row.order_products?.[0]?.product_profit_amount || 0,
        header: "Прибыль",
        size: 150,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,

        Cell: ({ cell }) => (
          <div className="font-bold text-[14px] text-black flex items-center justify-center text-center  px-3 py-1.5 transition-all duration-200 ">
            {cell.getValue<number>()}
          </div>
        ),
      },
      {
        accessorKey: "order_status",
        header: "СТАТУС",
        size: 130,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => {
          const status = cell.getValue<string>();
          const displayStatus =
            status === "process"
              ? "Активный"
              : status === "finished"
              ? "Завершен"
              : status === "cancelled"
              ? "Отменен"
              : "Ожидание";
          return (
            <span
              className={`px-3 py-1.5 text-[14px] font-bold ${getStatusColor(
                displayStatus
              )} inline-block transition-all duration-200`}
            >
              {displayStatus}
            </span>
          );
        },
      },
      {
        accessorKey: "_id",
        header: "ДЕЙСТВИЯ",
        size: 130,
        grow: false,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => (
          <Button
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(cell.getValue<string>());
            }}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              py: 0.8,
              fontSize: "14px",
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c",
              },
              borderRadius: "2px",
              transition: "all 0.2s",
            }}
          >
            Удалить
          </Button>
        ),
      },
    ];
  }, [paymentInputs, editModes, orderIndexInputs, orderIndexEditModes]);

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <Container>
          <div className="">
            {isLoading ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="w-full h-[100vh] flex items-center justify-center"
              >
                <CircularProgress sx={{ color: "#1e40af" }} size={50} />
              </Box>
            ) : orders?.length === 0 ? (
              <div className="w-full h-[60vh] flex flex-col gap-y-4 items-center justify-center">
                <FileSpreadsheet size={64} className="text-gray-600" />
                <span className="text-gray-400 text-lg font-medium">
                  Заказов нет!
                </span>
                <Button
                  variant="contained"
                  onClick={handleNewSaleClick}
                  startIcon={<Plus size={20} />}
                  sx={{
                    backgroundColor: "#1e40af",
                    "&:hover": {
                      backgroundColor: "#1e3a8a",
                    },
                    textTransform: "none",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: "2px",
                  }}
                >
                  Создать первый заказ
                </Button>
              </div>
            ) : orders && orders?.length > 0 ? (
              <div className="mx-auto">
                <div className="bg-white border border-slate-300">
                  <MaterialReactTable
                    columns={columns}
                    data={filteredOrders}
                    enableColumnResizing={false}
                    enableStickyHeader
                    enablePagination={false}
                    enableRowNumbers={false}
                    enableColumnOrdering={false}
                    enableGlobalFilter={false}
                    enableFullScreenToggle={false}
                    enableDensityToggle={false}
                    enableColumnFilters={false}
                    enableColumnActions={false}
                    enableBottomToolbar={false}
                    enableSorting={false}
                    enableRowSelection={false}
                    layoutMode="grid"
                    muiTableContainerProps={{
                      sx: {
                        maxHeight: "calc(100vh - 180px)",
                        overflowX: "auto",
                        px: 0,
                        backgroundColor: "#ffffff",
                        "& td": {
                          padding: "0px 2px !important",
                        },
                        "&::-webkit-scrollbar": {
                          height: "8px",
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: "#e2e8f0",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#64748b",
                          borderRadius: "0px",
                        },
                      },
                    }}
                    muiTableProps={{
                      sx: {
                        tableLayout: "auto",
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        backgroundColor: "#ffffff",
                        "& .MuiTableCell-root": {
                          borderBottom: "1px solid #cbd5e1",
                          borderRight: "1px solid #cbd5e1",
                          color: "#0f172a",
                          fontWeight: 500,
                        },
                      },
                    }}
                    muiTableHeadCellProps={{
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
                    }}
                    muiTableBodyCellProps={{
                      sx: {
                        backgroundColor: "#ffffff",
                        color: "#0f172a",
                        borderBottom: "1px solid #cbd5e1",
                        borderRight: "1px solid #cbd5e1",
                      },
                    }}
                    muiTableBodyRowProps={{
                      sx: {
                        "&:hover": {
                          backgroundColor: "#e0f2fe !important",
                          "& .MuiTableCell-root": {
                            backgroundColor: "#e0f2fe !important",
                          },
                        },
                        cursor: "pointer",
                      },
                    }}
                    muiTablePaperProps={{
                      sx: {
                        backgroundColor: "#ffffff",
                        borderRadius: "0px",
                        border: "none",
                        boxShadow: "none",
                      },
                    }}
                    muiTopToolbarProps={{
                      sx: {
                        backgroundColor: "#f8fafc",
                        borderBottom: "1px solid #cbd5e1",
                      },
                    }}
                    renderTopToolbar={() => (
                      <div className="flex flex-col gap-y-5 my-5 mx-auto">
                        <div className="flex items-center justify-between px-4">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <FileSpreadsheet
                              size={22}
                              className="text-blue-700"
                            />
                            <h1 className="text-xl font-semibold text-slate-800">
                              SpecialSheets
                            </h1>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              flexWrap: "wrap",
                            }}
                          >
                            <Button
                              onClick={handleNewSaleClick}
                              sx={{
                                backgroundColor: "#1e40af",
                                "&:hover": { backgroundColor: "#1e3a8a" },
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "2px",
                              }}
                              variant="contained"
                            >
                              Новая продажа
                            </Button>

                            <Button
                              onClick={handleGetTodaysPayments}
                              sx={{
                                backgroundColor: "#047857",
                                "&:hover": { backgroundColor: "#065f46" },
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "2px",
                              }}
                              variant="contained"
                            >
                              Платежи сегодня
                            </Button>

                            <Button
                              onClick={handleGetUnfinishedPayments}
                              sx={{
                                backgroundColor: "#d97706",
                                "&:hover": { backgroundColor: "#b45309" },
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "2px",
                              }}
                              variant="contained"
                            >
                              Должники
                            </Button>

                            <Button
                              onClick={() => setIsListComment(true)}
                              variant="outlined"
                              sx={{
                                color: "#1e293b",
                                borderColor: "#64748b",
                                "&:hover": {
                                  backgroundColor: "#f1f5f9",
                                  borderColor: "#64748b",
                                },
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "2px",
                              }}
                            >
                              Список комментариев
                            </Button>

                            <Button
                              onClick={() => setIsListClient(true)}
                              variant="outlined"
                              sx={{
                                color: "#1e293b",
                                borderColor: "#64748b",
                                "&:hover": {
                                  backgroundColor: "#f1f5f9",
                                  borderColor: "#64748b",
                                },
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "2px",
                              }}
                            >
                              Список клиентов
                            </Button>

                            <Button
                              onClick={logout}
                              sx={{
                                backgroundColor: "#b91c1c",
                                "&:hover": { backgroundColor: "#991b1b" },
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "2px",
                              }}
                              variant="contained"
                            >
                              Выйти
                            </Button>
                          </Box>
                        </div>

                        <div className="flex flex-col bg-slate-100 border border-slate-300">
                          <Box sx={{ p: 2, display: "flex", gap: 2 }}>
                            <TextField
                              placeholder="Поиск по клиенту..."
                              value={clientSearch}
                              onChange={(e) => setClientSearch(e.target.value)}
                              size="small"
                              sx={{
                                flex: 1,
                                backgroundColor: "#ffffff",
                                borderRadius: "6px",
                                "& input": {
                                  color: "#0f172a",
                                  padding: "10px 14px",
                                },
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "6px",
                                  "& fieldset": {
                                    borderColor: "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#3b82f6",
                                    borderWidth: "2px",
                                  },
                                },
                              }}
                            />
                            <TextField
                              placeholder="Поиск по модели..."
                              value={modelSearch}
                              onChange={(e) => setModelSearch(e.target.value)}
                              size="small"
                              sx={{
                                flex: 1,
                                backgroundColor: "#ffffff",
                                borderRadius: "6px",
                                "& input": {
                                  color: "#0f172a",
                                  padding: "10px 14px",
                                },
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "6px",
                                  "& fieldset": {
                                    borderColor: "#cbd5e1",
                                  },
                                  "&:hover fieldset": {
                                    borderColor: "#94a3b8",
                                  },
                                  "&.Mui-focused fieldset": {
                                    borderColor: "#3b82f6",
                                    borderWidth: "2px",
                                  },
                                },
                              }}
                            />
                          </Box>

                          {/* Statistics Cards - Before Table */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              p: 2,
                              flexWrap: "wrap",
                              mb: 3,
                              // mt: 3,
                            }}
                          >
                            <StatCard
                              title="Вклад"
                              value={investment || "0"}
                              color="#1e40af"
                              editable={true}
                              onValueChange={handleInvestmentChange}
                            />
                            <StatCard
                              title="Затраты"
                              value={metrics.expenses}
                              color="#dc2626"
                            />
                            <StatCard
                              title="Оплаты"
                              value={metrics.payments}
                              color="#047857"
                            />
                            <StatCard
                              title="Остаток"
                              value={metrics.balance}
                              color="#d97706"
                            />

                            <StatCard
                              title="Прибыль"
                              value={profitValue || "0"}
                              color="#7c3aed"
                              editable={true}
                              onValueChange={handleProfitChange}
                            />
                          </Box>
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </Container>
      </div>

      {/* NEW: Modal for creating new order with index input */}
      <Dialog
        open={newOrderModalOpen}
        onClose={handleCancelNewOrder}
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            minWidth: "400px",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#0f172a",
            fontWeight: 700,
            fontSize: "1.25rem",
            borderBottom: "1px solid #cbd5e1",
          }}
        >
          Создать новый заказ
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <DialogContentText sx={{ color: "#475569", mb: 2 }}>
            Введите индекс для нового заказа:
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            type="number"
            label="Индекс заказа"
            value={newOrderIndex}
            onChange={(e) => setNewOrderIndex(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                "& fieldset": {
                  borderColor: "#cbd5e1",
                },
                "&:hover fieldset": {
                  borderColor: "#94a3b8",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1e40af",
                  borderWidth: "2px",
                },
              },
              "& input": {
                fontSize: "18px",
                fontWeight: 600,
                color: "#0f172a",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCancelNewOrder}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#64748b",
              "&:hover": {
                backgroundColor: "#f1f5f9",
              },
              borderRadius: "6px",
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleCreateNewOrder}
            variant="contained"
            disabled={createOrder.isPending}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              minWidth: "120px",
              backgroundColor: "#1e40af",
              "&:hover": {
                backgroundColor: "#1e3a8a",
              },
              borderRadius: "6px",
            }}
          >
            {createOrder.isPending ? (
              <>
                <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                Создание...
              </>
            ) : (
              "Создать"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Warning Dialog */}
      <Dialog
        open={openPaymentDialog}
        onClose={handlePaymentDialogClose}
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
            onClick={handlePaymentDialogConfirm}
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

      {/* Delete Order Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "2px",
            minWidth: "400px",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#0f172a",
            fontWeight: 700,
            fontSize: "1.25rem",
            borderBottom: "1px solid #cbd5e1",
          }}
        >
          Удаление заказа
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ color: "#475569" }}>
            Вы уверены, что хотите удалить этот заказ? Это действие нельзя
            отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCancelDelete}
            disabled={isDeleting}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#64748b",
              "&:hover": {
                backgroundColor: "#f1f5f9",
              },
              borderRadius: "2px",
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            autoFocus
            disabled={isDeleting}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              minWidth: "120px",
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c",
              },
              borderRadius: "2px",
            }}
          >
            {isDeleting ? (
              <>
                <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                Удаление...
              </>
            ) : (
              "Удалить"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <DetailsDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        saleId={saleId}
        tableIndex={tableIndex}
      />

      <CommentListDrawer
        isOpen={isListComment}
        onClose={() => {
          setIsListComment(false);
        }}
        openEdit={(c: any) => {
          setCommentInitial(c);
          setIsCreateComment(true);
        }}
        openCreate={(b: boolean) => setIsCreateComment(b)}
      />

      <CommentCreateEditDrawer
        isOpen={isCreateComment}
        onClose={() => {
          setIsCreateComment(false);
          setCommentInitial(null);
        }}
        initial={commentInitial}
      />

      <ClientsListDrawer
        isOpen={isListClient}
        onClose={() => {
          setIsListClient(false);
          setInitial(null);
        }}
        openEdit={(client: ClientType) => {
          setInitial(client);
          setIsCreateClient(true);
        }}
        openCreate={setIsCreateClient}
      />

      <CreateClientDrawer
        isOpen={isCreateClient}
        onClose={() => {
          setIsCreateClient(false);
          setInitial(null);
        }}
        initial={initial}
      />
    </>
  );
}
