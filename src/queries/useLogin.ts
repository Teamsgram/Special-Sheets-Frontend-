import { useMutation } from "@tanstack/react-query";
import { api } from "../api/api.client";
import { useAuthStore } from "../store/auth.store";

interface LoginCredentials {
  login: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: any;
}

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const { data } = await api.post<LoginResponse>(
        "/login-into-account",
        credentials
      );
      if (!data.token) throw new Error("Token not received");
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
    onError: (error) => {
      console.error("Login error:", error.message);
    },
  });
};
