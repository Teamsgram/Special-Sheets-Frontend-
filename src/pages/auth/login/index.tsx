import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Lock, Eye, EyeOff, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../../queries/useLogin";
import { useAuthStore } from "../../../store/auth.store";

interface LoginFormData {
  credential: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { mutate: login, isPending, error } = useLogin();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const validateCredential = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (emailRegex.test(value) || phoneRegex.test(value)) return true;
    return "Введите адрес электронной почты или номер телефона";
  };

  const onSubmit = (data: LoginFormData) => {
    login({
      login: data.credential,
      password: data.password,
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-500 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Добро пожаловать
          </h1>
          <p className="text-gray-200">Войдите в систему, чтобы продолжить</p>
        </div>

        {/* Форма входа с blur эффектом */}
        <div className="backdrop-blur-xl bg-black/40 rounded-3xl shadow-2xl p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Поле логина */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Email или Телефон
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register("credential", {
                    required: "Это поле обязательно для заполнения",
                    validate: validateCredential,
                  })}
                  type="text"
                  placeholder="Введите email или телефон"
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all bg-gray-50 text-gray-900 placeholder-gray-400 ${
                    errors.credential ? "border-red-500" : "border-gray-200"
                  }`}
                />
              </div>
              {errors.credential && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  ⚠ {errors.credential.message}
                </p>
              )}
            </div>

            {/* Поле пароля */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Пароль
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  {...register("password", {
                    required: "Пароль обязателен для заполнения",
                    minLength: {
                      value: 8,
                      message: "Пароль должен содержать минимум 8 символов",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-14 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all bg-gray-50 text-gray-900 placeholder-gray-400 ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  ⚠ {errors.password.message}
                </p>
              )}
            </div>

            {/* Ошибка при авторизации */}
            {error && (
              <p className="text-red-500 text-center text-sm">
                {error.message}
              </p>
            )}

            {/* Кнопка входа */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transform transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg mt-8 ${
                isPending ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isPending ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>

        {/* Политика и условия */}
        <p className="mt-6 text-center text-xs text-gray-200">
          Входя в систему, вы соглашаетесь с{" "}
          <button className="text-blue-500 hover:underline">
            Условиями использования
          </button>{" "}
          и{" "}
          <button className="text-blue-500 hover:underline">
            Политикой конфиденциальности
          </button>
        </p>
      </div>
    </div>
  );
}
