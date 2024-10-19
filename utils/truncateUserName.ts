export const getInitials = (name: string | undefined | null) => {
  if (!name || typeof name !== "string") {
    return "";
  }

  const nameParts = name.trim().split(" ");

  if (nameParts.length > 1) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }

  return `${nameParts[0][0]}.`.toUpperCase();
};
