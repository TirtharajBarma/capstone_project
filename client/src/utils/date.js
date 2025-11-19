export const pad2 = (n) => String(n).padStart(2, '0');

export const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  const day = pad2(date.getDate());
  const month = pad2(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad2(date.getHours());
  const mins = pad2(date.getMinutes());
  return `${day}/${month}/${year} ${hours}:${mins}`;
};
