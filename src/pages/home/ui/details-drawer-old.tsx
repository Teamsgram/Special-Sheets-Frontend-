// // import Drawer from "../../../components/drawer";
// // import {
// //   MaterialReactTable,
// //   useMaterialReactTable,
// //   type MRT_ColumnDef,
// // } from "material-react-table";
// // import { useMemo } from "react";
// // import type { OrderType } from "../types";
// // import { salesItemData } from "../data";
// // import Avatar from "../../../components/avatar";
// // import { Button } from "@mui/material";
// // import { formatCurrency } from "../../../functions";

// // const DetailsDrawer = ({
// //   isOpen,
// //   onClose,
// //   saleId,
// // }: {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   saleId: string;
// // }) => {
// //   const arr = [1, 2, 3, 4, 5, 6];

// //   const columns = useMemo<MRT_ColumnDef<OrderType>[]>(
// //     () => [
// //       {
// //         id: "expander", // Accordion uchun checkbox
// //         header: "",
// //         enableColumnActions: false,
// //         enableSorting: false,
// //         enableColumnFilter: false,
// //         size: 50,
// //       },
// //       { accessorKey: "name", header: "Названия товара" },
// //       { accessorKey: "total", header: "Общая сумма" },
// //       { accessorKey: "prepayment", header: "Предоплата" },
// //       { accessorKey: "startDate", header: "Дата начало" },
// //       { accessorKey: "endDate", header: "Дата окончания" },
// //     ],
// //     []
// //   );

// //   const table = useMaterialReactTable({
// //     columns,
// //     data: salesItemData,
// //     enableTopToolbar: false, // 🔥 Search va toolbarni olib tashlaydi
// //     enableBottomToolbar: false, // footer yo‘q
// //     enablePagination: false, // pagination yo‘q
// //     enableTableFooter: false, // footer cells yo‘q
// //     enableSorting: false,
// //     enableColumnFilters: false,
// //     enableHiding: false,
// //     enableDensityToggle: false,
// //     enableFullScreenToggle: false,

// //     renderDetailPanel: ({ row }) => (
// //       <div className="flex flex-col gap-y-4">
// //         <div className="flex items-center gap-x-4">
// //           <div className="w-1/5 font-semibold">
// //             Названия товара:
// //             <br /> {row.original.name}
// //           </div>
// //           <div className="w-1/5 font-semibold">
// //             Сумма товара:
// //             <br /> {formatCurrency(+row.original.total || 0)}
// //           </div>
// //           <div className="w-1/5 font-semibold">
// //             Сумма предоплаты:
// //             <br /> {formatCurrency(+row.original.prepayment || 0)}
// //           </div>
// //           <div className="w-1/5 font-semibold py-2 text-center border border-green-300 rounded-md bg-green-50 text-green-700">
// //             {row.original.endDate}
// //           </div>
// //           <div className="w-1/5 font-semibold py-2 text-center border border-red-300 rounded-md bg-red-50 text-red-700">
// //             {row.original.startDate}
// //           </div>
// //         </div>
// //         <div className="flex flex-col gap-y-3">
// //           {arr.map((item) => (
// //             <div key={item} className="flex gap-x-4 items-center">
// //               <div className="w-7 h-7 border border-green-400 bg-green-100 rounded-full"></div>
// //               <div className="w-[calc(20%-28px)] py-2 text-center border border-gray-300 bg-gray-50 rounded-md font-semibold">
// //                 Оплата №{item}
// //               </div>
// //               <div className="w-1/5 py-2 text-center border border-gray-300 bg-gray-50 rounded-md font-semibold">
// //                 Дата: 15.11.2025
// //               </div>
// //               <div className="w-1/5 py-2 text-center border border-gray-300 bg-gray-50 rounded-md font-semibold">
// //                 Cумма: 1 000 000
// //               </div>
// //               <div className="w-1/5 py-2 text-center border border-red-300 bg-red-50 rounded-md font-semibold">
// //                 Оплачено: 500 000
// //               </div>
// //               <div className="w-1/5 py-2 text-center border border-violet-300 bg-violet-200 rounded-md font-semibold">
// //                 Дата оплаты: 25.11.2025
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     ),
// //   });

// //   return (
// //     <Drawer
// //       isOpen={isOpen}
// //       onClose={onClose}
// //       width="1400px"
// //       position="right"
// //       title={`Подробности продажи: ${saleId}`}
// //     >
// //       {/* details */}
// //       <div className="grid grid-cols-4 gap-4 mb-4">
// //         <div className="border border-gray-300 rounded-md flex items-center font-medium px-3">
// //           #BC-541236
// //         </div>
// //         <div className="flex items-center justify-between border border-gray-300 rounded-lg py-2 px-3">
// //           <Avatar fullName="Renatjon Sobirov" color="#10B981" />
// //         </div>
// //       </div>

// //       {/* products table */}
// //       <div className="font-medium text-xl mb-3 uppercase">Товары</div>

// //       <MaterialReactTable table={table} />

// //       {/* prices */}
// //       <div className="flex flex-col gap-y-2 items-end mt-4 pb-4">
// //         <div className="flex justify-end pb-6">
// //           <Button
// //             variant="contained"
// //             onClick={() => console.log("+++")}
// //             sx={{
// //               backgroundColor: "#3b82f6",
// //               "&:hover": { backgroundColor: "#2563eb" },
// //               textTransform: "none",
// //               fontWeight: 600,
// //               px: 2,
// //               py: 0.8,
// //             }}
// //           >
// //             + Добавить товар
// //           </Button>
// //         </div>
// //         <div className="w-2/5 flex justify-between font-medium text-xl">
// //           <span>Общая сумма: </span>
// //           <span>{formatCurrency(36000000)} UZS</span>
// //         </div>
// //         <div className="w-2/5 flex justify-between font-medium text-xl">
// //           <span>Общая сумма предоплаты: </span>
// //           <span>{formatCurrency(6000000)} UZS</span>
// //         </div>
// //         <div className="w-2/5 flex justify-between font-medium text-xl">
// //           <span>Общая сумма остатки: </span>
// //           <span>{formatCurrency(7000000)} UZS</span>
// //         </div>
// //       </div>
// //     </Drawer>
// //   );
// // };

// // export default DetailsDrawer;

// import Drawer from "../../../components/drawer";
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
//   type MRT_ColumnDef,
// } from "material-react-table";
// import { useMemo, useState } from "react";
// import type { OrderType } from "../types";
// import { salesItemData } from "../data";
// import Avatar from "../../../components/avatar";
// import { Button, IconButton, TextField } from "@mui/material";
// import { formatCurrency } from "../../../functions";
// import { useForm, Controller } from "react-hook-form";
// import CloseIcon from "@mui/icons-material/Close";
// import { useGetOrderById } from "../../../queries/useOrder";

// interface NewProductForm {
//   product_name: string;
//   product_selling_price: string;
//   product_pre_paid: string;
//   end_date: string;
//   start_date: string;
// }

// interface NewProductRow {
//   id: string;
//   data: NewProductForm;
// }

// const DetailsDrawer = ({
//   isOpen,
//   onClose,
//   saleId,
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   saleId: string;
// }) => {
//   const arr = [1, 2, 3, 4, 5, 6];
//   const [newRows, setNewRows] = useState<NewProductRow[]>([]);
//   const [showAddButtons, setShowAddButtons] = useState(false);
//   const { data: order, isLoading } = useGetOrderById(saleId);
//   console.log(isLoading, order);

//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm<Record<string, NewProductForm>>();

//   const columns = useMemo<MRT_ColumnDef<OrderType>[]>(
//     () => [
//       {
//         id: "expander",
//         header: "",
//         enableColumnActions: false,
//         enableSorting: false,
//         enableColumnFilter: false,
//         size: 50,
//       },
//       { accessorKey: "name", header: "Названия товара" },
//       { accessorKey: "total", header: "Общая сумма" },
//       { accessorKey: "prepayment", header: "Предоплата" },
//       { accessorKey: "startDate", header: "Дата начало" },
//       { accessorKey: "endDate", header: "Дата окончания" },
//     ],
//     []
//   );

//   const table = useMaterialReactTable({
//     columns,
//     data: order,
//     enableTopToolbar: false,
//     enableBottomToolbar: false,
//     enablePagination: false,
//     enableTableFooter: false,
//     enableSorting: false,
//     enableColumnFilters: false,
//     enableHiding: false,
//     enableDensityToggle: false,
//     enableFullScreenToggle: false,

//     renderDetailPanel: ({ row }) => (
//       <div className="flex flex-col gap-y-4">
//         <div className="flex items-center gap-x-4">
//           <div className="w-1/5 font-semibold">
//             Названия товара:
//             <br /> {row.original.name}
//           </div>
//           <div className="w-1/5 font-semibold">
//             Сумма товара:
//             <br /> {formatCurrency(+row.original.total || 0)}
//           </div>
//           <div className="w-1/5 font-semibold">
//             Сумма предоплаты:
//             <br /> {formatCurrency(+row.original.prepayment || 0)}
//           </div>
//           <div className="w-1/5 font-semibold py-2 text-center border border-green-300 rounded-md bg-green-50 text-green-700">
//             {row.original.endDate}
//           </div>
//           <div className="w-1/5 font-semibold py-2 text-center border border-red-300 rounded-md bg-red-50 text-red-700">
//             {row.original.startDate}
//           </div>
//         </div>
//         <div className="flex flex-col gap-y-3">
//           {arr.map((item) => (
//             <div key={item} className="flex gap-x-4 items-center">
//               <div className="w-7 h-7 border border-green-400 bg-green-100 rounded-full"></div>
//               <div className="w-[calc(20%-28px)] py-2 text-center border border-gray-300 bg-gray-50 rounded-md font-semibold">
//                 Оплата №{item}
//               </div>
//               <div className="w-1/5 py-2 text-center border border-gray-300 bg-gray-50 rounded-md font-semibold">
//                 Дата: 15.11.2025
//               </div>
//               <div className="w-1/5 py-2 text-center border border-gray-300 bg-gray-50 rounded-md font-semibold">
//                 Cумма: 1 000 000
//               </div>
//               <div className="w-1/5 py-2 text-center border border-red-300 bg-red-50 rounded-md font-semibold">
//                 Оплачено: 500 000
//               </div>
//               <div className="w-1/5 py-2 text-center border border-violet-300 bg-violet-200 rounded-md font-semibold">
//                 Дата оплаты: 25.11.2025
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     ),
//   });

//   const handleAddRow = () => {
//     const newRow: NewProductRow = {
//       id: `new-row-${Date.now()}`,
//       data: {
//         product_name: "",
//         product_selling_price: "",
//         product_pre_paid: "",
//         end_date: "",
//         start_date: "",
//       },
//     };
//     setNewRows([...newRows, newRow]);
//     setShowAddButtons(true);
//   };

//   const handleRemoveRow = (id: string) => {
//     const updatedRows = newRows.filter((row) => row.id !== id);
//     setNewRows(updatedRows);
//     if (updatedRows.length === 0) {
//       setShowAddButtons(false);
//     }
//   };

//   const handleCancel = () => {
//     setNewRows([]);
//     setShowAddButtons(false);
//     reset();
//   };

//   const onSubmit = (data: Record<string, NewProductForm>) => {
//     // Здесь будет API запрос
//     console.log("Submitted data:", data);

//     // После успешного создания очистить форму
//     setNewRows([]);
//     setShowAddButtons(false);
//     reset();
//   };

//   return (
//     <Drawer
//       isOpen={isOpen}
//       onClose={onClose}
//       width="1400px"
//       position="right"
//       title={`Подробности продажи: ${saleId}`}
//     >
//       <div className="grid grid-cols-4 gap-4 mb-4">
//         <div className="border border-gray-300 rounded-md flex items-center font-medium px-3">
//           #BC-541236
//         </div>
//         <div className="flex items-center justify-between border border-gray-300 rounded-lg py-2 px-3">
//           <Avatar fullName="Renatjon Sobirov" color="#10B981" />
//         </div>
//       </div>

//       <div className="font-medium text-xl mb-3 uppercase">Товары</div>

//       <MaterialReactTable table={table} />

//       {/* Новые строки для добавления товаров */}
//       {newRows.length > 0 && (
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="mt-4 border border-gray-300 rounded-md overflow-hidden shadow-sm shadow-gray-500">
//             <div className="bg-gray-100 grid grid-cols-5 gap-4 p-3 font-semibold text-sm">
//               <div>Названия товара</div>
//               <div>Общая сумма</div>
//               <div>Предоплата</div>
//               <div>Дата начало</div>
//               <div>Дата окончания</div>
//             </div>

//             {newRows.map((row) => (
//               <div
//                 key={row.id}
//                 className="grid grid-cols-5 gap-4 p-3 border-t border-gray-200 items-start"
//               >
//                 <Controller
//                   name={`${row.id}.product_name`}
//                   control={control}
//                   rules={{ required: "Название товара обязательно" }}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Название товара"
//                       size="small"
//                       fullWidth
//                       error={!!errors[row.id]?.product_name}
//                       helperText={errors[row.id]?.product_name?.message}
//                       placeholder="Введите название"
//                     />
//                   )}
//                 />

//                 <Controller
//                   name={`${row.id}.product_selling_price`}
//                   control={control}
//                   rules={{
//                     required: "Общая сумма обязательна",
//                     pattern: {
//                       value: /^[0-9]+$/,
//                       message: "Только числа",
//                     },
//                   }}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Общая сумма"
//                       size="small"
//                       fullWidth
//                       type="number"
//                       error={!!errors[row.id]?.product_selling_price}
//                       helperText={
//                         errors[row.id]?.product_selling_price?.message
//                       }
//                       placeholder="0"
//                     />
//                   )}
//                 />

//                 <Controller
//                   name={`${row.id}.product_pre_paid`}
//                   control={control}
//                   rules={{
//                     required: "Предоплата обязательна",
//                     pattern: {
//                       value: /^[0-9]+$/,
//                       message: "Только числа",
//                     },
//                   }}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Предоплата"
//                       size="small"
//                       fullWidth
//                       type="number"
//                       error={!!errors[row.id]?.product_pre_paid}
//                       helperText={errors[row.id]?.product_pre_paid?.message}
//                       placeholder="0"
//                     />
//                   )}
//                 />

//                 <Controller
//                   name={`${row.id}.start_date`}
//                   control={control}
//                   rules={{ required: "Дата начала обязательна" }}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Дата начала"
//                       size="small"
//                       fullWidth
//                       type="date"
//                       error={!!errors[row.id]?.start_date}
//                       helperText={errors[row.id]?.start_date?.message}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   )}
//                 />

//                 <div className="flex items-center gap-x-3">
//                   <div className="w-[calc(100%-40px)]">
//                     <Controller
//                       name={`${row.id}.end_date`}
//                       control={control}
//                       rules={{ required: "Дата окончания обязательна" }}
//                       render={({ field }) => (
//                         <TextField
//                           {...field}
//                           label="Дата окончания"
//                           size="small"
//                           fullWidth
//                           type="date"
//                           error={!!errors[row.id]?.end_date}
//                           helperText={errors[row.id]?.end_date?.message}
//                           InputLabelProps={{ shrink: true }}
//                         />
//                       )}
//                     />
//                   </div>
//                   <div className="w-10">
//                     <IconButton
//                       onClick={() => handleRemoveRow(row.id)}
//                       size="small"
//                       sx={{ color: "#ef4444" }}
//                     >
//                       <CloseIcon />
//                     </IconButton>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </form>
//       )}

//       {/* Кнопки управления */}
//       <div className="flex justify-end gap-3 mt-4 pb-6">
//         <Button
//           variant="contained"
//           onClick={handleAddRow}
//           sx={{
//             backgroundColor: "#3b82f6",
//             "&:hover": { backgroundColor: "#2563eb" },
//             textTransform: "none",
//             fontWeight: 600,
//             px: 2,
//             py: 0.8,
//           }}
//         >
//           + Добавить товар
//         </Button>
//         {showAddButtons && (
//           <>
//             <Button
//               variant="outlined"
//               onClick={handleCancel}
//               sx={{
//                 borderColor: "#9ca3af",
//                 color: "#374151",
//                 "&:hover": {
//                   borderColor: "#6b7280",
//                   backgroundColor: "#f3f4f6",
//                 },
//                 textTransform: "none",
//                 fontWeight: 600,
//                 px: 2,
//                 py: 0.8,
//               }}
//             >
//               Отмена
//             </Button>
//             <Button
//               variant="contained"
//               onClick={handleSubmit(onSubmit)}
//               sx={{
//                 backgroundColor: "#10b981",
//                 "&:hover": { backgroundColor: "#059669" },
//                 textTransform: "none",
//                 fontWeight: 600,
//                 px: 2,
//                 py: 0.8,
//               }}
//             >
//               Создать
//             </Button>
//           </>
//         )}
//       </div>

//       {/* Итоговые суммы */}
//       <div className="flex flex-col gap-y-2 items-end pb-4">
//         <div className="w-2/5 flex justify-between font-medium text-xl">
//           <span>Общая сумма: </span>
//           <span>{formatCurrency(36000000)} UZS</span>
//         </div>
//         <div className="w-2/5 flex justify-between font-medium text-xl">
//           <span>Общая сумма предоплаты: </span>
//           <span>{formatCurrency(6000000)} UZS</span>
//         </div>
//         <div className="w-2/5 flex justify-between font-medium text-xl">
//           <span>Общая сумма остатки: </span>
//           <span>{formatCurrency(7000000)} UZS</span>
//         </div>
//       </div>
//     </Drawer>
//   );
// };

// export default DetailsDrawer;
