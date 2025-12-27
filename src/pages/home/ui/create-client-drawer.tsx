import { useForm, Controller } from "react-hook-form";
import { User, Phone, Save, UserPlus, AlertCircle } from "lucide-react";
import type { ClientType } from "../types";
import { useEffect } from "react";
import { useCreateClient, useUpdateClient } from "../../../queries/useClients";

interface ClientFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  preferredLanguage: "russian" | "uzbek";
}

const CreateClientDrawer = ({
  isOpen,
  onClose,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  initial: ClientType | null;
}) => {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      preferredLanguage: "russian",
    },
  });

  const validatePhoneNumber = (value: string) => {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (phoneRegex.test(value)) return true;
    return "Введите корректный номер телефона";
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (initial) {
        await updateClient.mutateAsync({
          clientId: initial._id || "",
          data: {
            _id: initial._id,
            client_name: data.firstName,
            client_surname: data.lastName,
            client_phone_number: data.phoneNumber,
            client_prefered_language: data.preferredLanguage,
          },
        });
      } else {
        await createClient.mutateAsync({
          client_name: data.firstName,
          client_surname: data.lastName,
          client_phone_number: data.phoneNumber,
          client_prefered_language: data.preferredLanguage,
        });
      }

      reset();
      onClose();
    } catch (err) {
      console.error("Ошибка:", err);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  useEffect(() => {
    if (initial) {
      const language = initial.client_prefered_language as
        | "russian"
        | "uzbek"
        | undefined;
      reset({
        firstName: initial.client_name || "",
        lastName: initial.client_surname || "",
        phoneNumber: initial.client_phone_number || "",
        preferredLanguage: language === "uzbek" ? "uzbek" : "russian",
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        preferredLanguage: "russian",
      });
    }
  }, [initial, reset]);

  const isLoading = createClient.isPending || updateClient.isPending;

  return (
    <>
      <style>
        {`
          @keyframes slideInFromRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shake {
            0%, 100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            75% {
              transform: translateX(5px);
            }
          }

          .input-field:focus-within {
            transform: translateY(-2px);
          }

          .error-shake {
            animation: shake 0.3s ease-in-out;
          }

          /* Language Toggle Switch */
          .language-toggle-container {
            position: relative;
            display: inline-flex;
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            border-radius: 12px;
            padding: 4px;
            width: 100%;
          }

          .language-toggle-option {
            flex: 1;
            padding: 12px 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .language-toggle-option:not(.active) {
            color: #cbd5e1;
          }

          .language-toggle-option:not(.active):hover {
            color: #f1f5f9;
            background: rgba(255, 255, 255, 0.1);
          }

          .language-toggle-option.active {
            color: white;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.5);
          }

          .language-flag {
            font-size: 16px;
          }
        `}
      </style>

      <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleClose}
          style={{ animation: isOpen ? "fadeIn 0.3s ease-out" : "none" }}
        />

        {/* Drawer */}
        <div
          className="absolute right-0 top-0 h-full w-[500px] bg-gradient-to-b from-gray-400 via-gray-500 to-gray-400 shadow-2xl border-l border-slate-600 transform transition-transform duration-300"
          style={{
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            animation: isOpen ? "slideInFromRight 0.3s ease-out" : "none",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-600 bg-gradient-to-r from-gray-500/20 to-gray-500/20 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {initial ? (
                <div className="bg-gray-400/30 p-2 rounded-lg">
                  <User size={24} className="text-gray-200/90" />
                </div>
              ) : (
                <div className="bg-gray-600/30 p-2 rounded-lg">
                  <UserPlus size={24} className="text-gray-200/90" />
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-200/90">
                {initial ? "Редактировать клиента" : "Добавить клиента"}
              </h2>
            </div>
            <button
              onClick={handleClose}
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

          {/* Content */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col justify-between h-[calc(100%-80px)] p-6"
          >
            <div className="space-y-6">
              {/* Имя */}
              <div
                className="input-field transition-all duration-300"
                style={{ animation: "slideUp 0.4s ease-out" }}
              >
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Имя
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-emerald-400">
                    <User
                      className={`w-5 h-5 ${
                        errors.firstName
                          ? "text-red-400"
                          : "text-slate-400 group-focus-within:text-white"
                      }`}
                    />
                  </div>
                  <input
                    {...register("firstName", {
                      required: "Имя обязательно для заполнения",
                      minLength: {
                        value: 2,
                        message: "Имя должно содержать минимум 2 символа",
                      },
                      pattern: {
                        value: /^[a-zA-Zа-яА-ЯёЁ\s]+$/,
                        message: "Можно использовать только буквы",
                      },
                    })}
                    type="text"
                    placeholder="Введите имя"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-700 border-2 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all duration-300 ${
                      errors.firstName
                        ? "border-red-400 focus:border-red-400 error-shake"
                        : "border-slate-600 focus:border-gray-400 hover:border-slate-500"
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 animate-fadeIn">
                    <AlertCircle size={16} />
                    <span>{errors.firstName.message}</span>
                  </div>
                )}
              </div>

              {/* Фамилия */}
              <div
                className="input-field transition-all duration-300"
                style={{ animation: "slideUp 0.5s ease-out" }}
              >
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Фамилия
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-emerald-400">
                    <User
                      className={`w-5 h-5 ${
                        errors.lastName
                          ? "text-red-400"
                          : "text-slate-400 group-focus-within:text-white"
                      }`}
                    />
                  </div>
                  <input
                    {...register("lastName", {
                      required: "Фамилия обязательна для заполнения",
                      minLength: {
                        value: 2,
                        message: "Фамилия должна содержать минимум 2 символа",
                      },
                      pattern: {
                        value: /^[a-zA-Zа-яА-ЯёЁ\s]+$/,
                        message: "Можно использовать только буквы",
                      },
                    })}
                    type="text"
                    placeholder="Введите фамилию"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-700 border-2 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all duration-300 ${
                      errors.lastName
                        ? "border-red-400 focus:border-red-400 error-shake"
                        : "border-slate-600 focus:border-gray-400 hover:border-slate-500"
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 animate-fadeIn">
                    <AlertCircle size={16} />
                    <span>{errors.lastName.message}</span>
                  </div>
                )}
              </div>

              {/* Номер телефона */}
              <div
                className="input-field transition-all duration-300"
                style={{ animation: "slideUp 0.6s ease-out" }}
              >
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Номер телефона
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-emerald-400">
                    <Phone
                      className={`w-5 h-5 ${
                        errors.phoneNumber
                          ? "text-red-400"
                          : "text-slate-400 group-focus-within:text-white"
                      }`}
                    />
                  </div>
                  <input
                    {...register("phoneNumber", {
                      required: "Номер телефона обязателен для заполнения",
                      validate: validatePhoneNumber,
                      minLength: {
                        value: 9,
                        message:
                          "Номер телефона должен содержать минимум 9 цифр",
                      },
                    })}
                    type="text"
                    placeholder="+998 90 123 45 67"
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-700 border-2 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 transition-all duration-300 ${
                      errors.phoneNumber
                        ? "border-red-400 focus:border-red-400 error-shake"
                        : "border-slate-600 focus:border-gray-400 hover:border-slate-500"
                    }`}
                  />
                </div>
                {errors.phoneNumber && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 animate-fadeIn">
                    <AlertCircle size={16} />
                    <span>{errors.phoneNumber.message}</span>
                  </div>
                )}
              </div>

              {/* Preferred Language */}
              <div
                className="input-field transition-all duration-300"
                style={{ animation: "slideUp 0.7s ease-out" }}
              >
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Предпочитаемый язык
                </label>
                <Controller
                  name="preferredLanguage"
                  control={control}
                  rules={{ required: "Выберите язык" }}
                  render={({ field }) => (
                    <div className="language-toggle-container">
                      <div
                        className={`language-toggle-option ${
                          field.value === "russian" ? "active" : ""
                        }`}
                        onClick={() => field.onChange("russian")}
                      >
                        <span className="language-flag">🇷🇺</span>
                        <span>Русский</span>
                      </div>
                      <div
                        className={`language-toggle-option ${
                          field.value === "uzbek" ? "active" : ""
                        }`}
                        onClick={() => field.onChange("uzbek")}
                      >
                        <span className="language-flag">🇺🇿</span>
                        <span>O'zbek</span>
                      </div>
                    </div>
                  )}
                />
                {errors.preferredLanguage && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 animate-fadeIn">
                    <AlertCircle size={16} />
                    <span>{errors.preferredLanguage.message}</span>
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div
                className="bg-gray-300/20 border border-gray-200/30 rounded-xl p-4 mt-6"
                style={{ animation: "slideUp 0.8s ease-out" }}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="bg-gray-500/30 p-2 rounded-lg">
                      <AlertCircle size={20} className="text-gray-300" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-200 font-semibold text-sm mb-1">
                      Совет
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Выберите предпочитаемый язык клиента для
                      персонализированных уведомлений и общения
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-white to-gray-500 text-black py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 mt-6 ${
                isLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:from-white hover:to-gray-500 hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]"
              }`}
              style={{ animation: "slideUp 0.9s ease-out" }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Сохранение...</span>
                </>
              ) : initial ? (
                <>
                  <Save size={20} />
                  <span>Сохранить изменения</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>Добавить клиента</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateClientDrawer;
