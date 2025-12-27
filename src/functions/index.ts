// 000 000 000
export const formatCurrency = (amount: number) => {
  // return new Intl.NumberFormat("ru-RU", {
  //   style: "currency",
  //   currency: "USD",
  //   minimumFractionDigits: 0,
  // }).format(amount);

  return amount;
};

// unique ID
const existingIds = new Set();
export function generateUniqueId() {
  const getRandomLetter = () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26));
  let id;
  do {
    const prefix = getRandomLetter() + getRandomLetter();
    const number = Math.floor(100000 + Math.random() * 900000);
    id = `#${prefix}-${number}`;
  } while (existingIds.has(id));
  existingIds.add(id);
  return id;
}
