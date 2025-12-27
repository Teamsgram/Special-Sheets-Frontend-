import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api.client";
import type {
  AddPaymentDto,
  AddProductDto,
  AssignClientDto,
  OrderType,
} from "../pages/home/types";

// 🧭 GET: Barcha buyurtmalar
export const useGetAllOrders = (options?: { enabled?: boolean }) => {
  return useQuery<OrderType[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get("/order/get-all-orders");
      return data.data;
    },
    enabled: options?.enabled ?? true,
  });
};

// 🧭 GET: Bitta buyurtma ID orqali olish
export const useGetOrderById = (orderId: string | undefined) => {
  return useQuery<OrderType>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data } = await api.get(`/order/get-order-details/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });
};

// 🧩 POST: Yangi buyurtma yaratish
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      order_generated_id: string;
      order_assigned_index: number;
    }) => {
      const { data } = await api.post("/order/create-new-order", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Create order error:", error);
    },
  });
};

// 🧩 PATCH: Buyurtmaning tayinlangan indeksini yangilash
export const useUpdateOrderAssignedIndex = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      order_id: string;
      order_assigned_index: number;
    }) => {
      const { data } = await api.patch(
        `/order/update-order-assigned-index/${payload.order_id}`,
        {
          order_assigned_index: payload.order_assigned_index,
        }
      );
      return data;
    },

    onSuccess: () => {
      // Orders ro‘yxatini yangilash
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },

    onError: (error) => {
      console.error("Update order_assigned_index error:", error);
    },
  });
};

// 📝 PATCH: Buyurtmadagi mahsulotni yangilash
export const useUpdateProductInOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      orderId: string;
      productId: string;
      data: any;
    }) => {
      const { orderId, productId, data: payload } = params;
      const { data } = await api.put(
        `/order/update-order-assigned-product/${orderId}/${productId}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Update product error:", error);
    },
  });
};

// 🧨 DELETE: Buyurtmani o‘chirish
export const useDeleteOrderById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.delete(`/order/delete-order-by-id/${orderId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Delete order error:", error);
    },
  });
};

// 👤 PATCH: Buyurtmaga mijoz biriktirish
export const useAssignClientToOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: string; data: AssignClientDto }) => {
      const { orderId, data: payload } = params;
      const { data } = await api.patch(
        `/order/assign-client/${orderId}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Assign client error:", error);
    },
  });
};

// // 💰 POST: Buyurtmadagi mahsulotga to‘lov qo‘shish
// export const useAddPaymentToOrderProduct = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       order_id,
//       product_id,
//       payment_id,
//       amount,
//     }: {
//       order_id: string;
//       product_id: string;
//       payment_id: string;
//       amount: number;
//     }) => {
//       const { data } = await api.post(
//         `/order/add-payment-to-order/${order_id}/${product_id}/${payment_id}`,
//         { amount }
//       );
//       return data;
//     },
//     onSuccess: () => {
//       // 🔄 Buyurtmalar ro‘yxatini yangilaymiz
//       queryClient.invalidateQueries({ queryKey: ["orders"] });
//     },
//     onError: (error) => {
//       console.error("Add payment to order product error:", error);
//     },
//   });
// };

// 🛒 POST: Buyurtmaga mahsulot qo‘shish
export const useAddProductToOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: string; data: AddProductDto }) => {
      const { orderId, data: payload } = params;
      const { data } = await api.post(
        `/order/add-product-to-order/${orderId}`,
        payload
      );
      console.log("1++++", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Add product error:", error);
    },
  });
};

// ❌ DELETE: Buyurtmadan mahsulotni o‘chirish
export const useDeleteProductFromOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: string; productId: string }) => {
      const { orderId, productId } = params;
      const { data } = await api.delete(
        `/order/delete-product-from-order/${orderId}/${productId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Delete product error:", error);
    },
  });
};

export const useSendOrderProductPaymentGraphics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: string; productId: string }) => {
      const { orderId, productId } = params;
      const { data } = await api.post(
        `/order/send-notification-by-product-id/${orderId}/${productId}`
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Send order product payment graphics error:", error);
    },
  });
};

export const useCreateOrderProductPaymentGraphics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: string; productId: string }) => {
      const { orderId, productId } = params;
      const { data } = await api.post(
        `/order/generate-order-payment-graphics/${orderId}/${productId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Send order product payment graphics error:", error);
    },
  });
};
// 💵 POST: Buyurtmadagi mahsulotga to‘lov qo‘shish
export const useAddPaymentToOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      orderId: string;
      productId: string;
      paymentId: string;
      table_index: number;
      data: AddPaymentDto;
    }) => {
      const {
        orderId,
        productId,
        paymentId,
        table_index,
        data: payload,
      } = params;

      const { data } = await api.post(
        `/order/add-payment-to-order/${orderId}/${productId}/${paymentId}`,
        payload,
        {
          params: { table_index },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Add payment error:", error);
    },
  });
};

// 💳 PATCH: Buyurtmadagi mahsulot to‘lovini yangilash
export const useUpdatePaymentOfOrderProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      orderId: string;
      productId: string;
      paymentId: string;
      table_index: number;
      data: AddPaymentDto;
    }) => {
      const {
        orderId,
        productId,
        paymentId,
        table_index,
        data: payload,
      } = params;
      // console.log(table_index);
      const { data } = await api.patch(
        `/order/update-payment-details/${orderId}/${productId}/${paymentId}`,
        payload,
        {
          params: { table_index },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Update payment error:", error);
    },
  });
};

// ✅ PATCH: Buyurtmani yakunlangan holatga o‘tkazish
export const useSetOrderStatusToFinished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.patch(
        `/order/set-status-order-to-finish/${orderId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Set status to finished error:", error);
    },
  });
};

// 🚫 PATCH: Buyurtmani bekor qilingan holatga o‘tkazish
export const useSetOrderStatusToCanceled = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.patch(
        `/order/set-status-order-to-cancel/${orderId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Set status to canceled error:", error);
    },
  });
};

// ---------------------------
// Comments endpoints hooks
// ---------------------------

// 🧭 GET: Barcha kommentlar
export const useGetAllComments = (options?: { enabled?: boolean }) => {
  return useQuery<any[]>({
    queryKey: ["comments"],
    queryFn: async () => {
      const { data } = await api.get("/comment/get-all-comments");
      return data.data;
    },
    enabled: options?.enabled ?? true,
  });
};

// 🧩 POST: Yangi kommentar yaratish
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { comment_body: string }) => {
      const { data } = await api.post("/comment/create-comment", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error) => {
      console.error("Create comment error:", error);
    },
  });
};

// 🧩 PATCH: Kommentni yangilash by id
export const useUpdateCommentById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      data: { comment_body: string };
    }) => {
      const { id, data: payload } = params;
      const { data } = await api.patch(
        `/comment/update-comment/${id}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error) => {
      console.error("Update comment error:", error);
    },
  });
};

// 🧨 DELETE: Kommentni o'chirish by id
export const useDeleteCommentById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/comment/delete-comment/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (error) => {
      console.error("Delete comment error:", error);
    },
  });
};
