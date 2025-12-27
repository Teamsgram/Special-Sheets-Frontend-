import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/api.client";
import type { ClientType } from "../pages/home/types";

export interface CreateClientDto {
  client_name: string;
  client_surname: string;
  client_phone_number: string;
  client_prefered_language: string;
}

export interface UpdateClientDto extends CreateClientDto {
  _id?: string;
}

// 🧭 GET: Barcha mijozlar
export const useGetAllClients = (options?: { enabled?: boolean }) => {
  return useQuery<ClientType[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await api.get("/client/get-all-clients");
      return data.data;
    },
    enabled: options?.enabled ?? true,
  });
};

// 🧭 GET: Bitta mijozni ID orqali olish
export const useGetClientById = (id: string | undefined) => {
  return useQuery<ClientType>({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data } = await api.get(`/client/get-client-details-by-id/${id}`);
      return data.data.client_details;
    },
    enabled: !!id, // id mavjud bo‘lmasa fetch qilinmaydi
  });
};

// 🧩 POST: Yangi mijoz yaratish
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (obj: CreateClientDto) => {
      const { data } = await api.post("/client/create-new-client", obj);
      return data;
    },
    onSuccess: () => {
      // Ma’lumot o‘zgarganda cache ni yangilaymiz
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => {
      console.error("Create client error:", error);
    },
  });
};

// 🧩 PUT: Mavjud mijozni yangilash
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { clientId: string; data: UpdateClientDto }) => {
      const { clientId, data: payload } = params;
      const { data } = await api.put(
        `/client/update-client-by-id/${clientId}`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error) => {
      console.error("Update client error:", error);
    },
  });
};

export const useGetTodaysPayments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get(`/order/get-todays-payments`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Get today's payments error:", error);
    },
  });
};

export const useGetUnfinishedPayments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get(`/order/get-unfinished-payments`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Get unfinished payments error:", error);
    },
  });
};
