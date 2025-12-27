import Avatar from "../../../components/avatar";
import { Edit, UserPlus, Users } from "lucide-react";
import type { ClientType } from "../types";
import { useGetAllClients } from "../../../queries/useClients";
import { Button, CircularProgress } from "@mui/material";

const ClientsListDrawer = ({
  isOpen,
  onClose,
  openEdit,
  openCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  openEdit: (a: ClientType) => void;
  openCreate: (a: boolean) => void;
}) => {
  const { data: clients, isLoading } = useGetAllClients({
    enabled: isOpen,
  });

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }

          .client-card {
            animation: slideInRight 0.4s ease-out backwards;
          }

          // .client-card:hover {
          //   transform: translateX(-4px);
          //   box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
          // }
        `}
      </style>
      <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
          style={{ animation: isOpen ? "fadeIn 0.3s ease-out" : "none" }}
        />

        {/* Drawer */}
        <div
          className="absolute right-0 top-0 h-full w-[500px] bg-gradient-to-b from-gray-400 to-500 shadow-2xl border-l border-gray-700 transform transition-transform duration-300"
          style={{
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            animation: isOpen ? "slideInFromRight 0.3s ease-out" : "none",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700 bg-gray-400/30 backdrop-blur-sm sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-100/90">
              Список клиентов
            </h2>
            <button
              onClick={onClose}
              className="text-gray-700 cursor-pointer hover:text-white hover:bg-gray-600 rounded-lg p-2 transition-all duration-200 hover:rotate-90"
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
          <div className="overflow-y-auto h-[calc(100%-80px)] p-6">
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
              `}
            </style>
            {isLoading ? (
              <div
                className="flex flex-col items-center justify-center py-20 gap-y-4"
                style={{ animation: "fadeInScale 0.5s ease-out" }}
              >
                <CircularProgress sx={{ color: "#3b82f6" }} size={50} />
                <span className="text-gray-400 font-medium">
                  Загрузка клиентов...
                </span>
              </div>
            ) : clients && clients.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 gap-y-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
                style={{ animation: "fadeInScale 0.5s ease-out" }}
              >
                <div className="bg-blue-500/10 p-6 rounded-full">
                  <Users size={48} className="text-gray-400" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-white font-bold text-lg">Нет клиентов</h3>
                  <p className="text-gray-400 text-sm">
                    Создайте первого клиента для начала работы
                  </p>
                </div>
                <Button
                  variant="contained"
                  onClick={() => openCreate(true)}
                  startIcon={<UserPlus size={20} />}
                  sx={{
                    backgroundColor: "#3b82f6",
                    "&:hover": {
                      backgroundColor: "#2563eb",
                      transform: "translateY(-2px) scale(1.05)",
                      boxShadow: "0 10px 25px rgba(59, 130, 246, 0.5)",
                    },
                    "&:active": {
                      transform: "translateY(0) scale(0.98)",
                    },
                    textTransform: "none",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: "10px",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Создать клиента
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header Stats */}
                <div
                  className="bg-gradient-to-r from-gray-600/20 to-gray-500/20 border border-gray-500/30 rounded-xl p-4 mb-6"
                  style={{ animation: "fadeInScale 0.4s ease-out" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-100 text-sm font-medium">
                        Всего клиентов
                      </p>
                      <p className="text-white text-3xl font-bold">
                        {clients?.length || 0}
                      </p>
                    </div>
                    <Users size={40} className="text-gray-100" />
                  </div>
                </div>

                {/* Clients List */}
                <div className="space-y-3">
                  {clients &&
                    clients.map((item, index) => (
                      <div
                        key={item._id}
                        className="client-card flex items-center justify-between border-b border-slate-600 bg-gradient-to-r from-gray-900/20 to-gray-900/20 backdrop-blur-sm sticky top-0 p-4 transition-all duration-300 cursor-pointer"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar
                            fullName={`${item.client_name} ${item.client_surname}`}
                            color="#9099A5"
                          />
                        </div>
                        <button
                          onClick={() => openEdit(item)}
                          className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/40 hover:border-gray-400/50 text-gray-200 hover:text-blue-300 rounded-lg p-2.5 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Add New Client Button */}
                <div className="flex justify-end pt-4 sticky bottom-0  z-50bg-gradient-to-t from-black via-black to-transparent pb-2">
                  <Button
                    variant="contained"
                    onClick={() => openCreate(true)}
                    startIcon={<UserPlus size={20} />}
                    sx={{
                      backgroundColor: "#3b82f6",
                      zIndex: "999",
                      // "&:hover": {
                      //   backgroundColor: "#2563eb",
                      //   transform: "translateY(-2px) scale(1.05)",
                      //   boxShadow: "0 8px 20px rgba(59, 130, 246, 0.5)",
                      // },
                      "&:active": {
                        transform: "translateY(0) scale(0.98)",
                      },
                      textTransform: "none",
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: "10px",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    Новый клиент
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientsListDrawer;
