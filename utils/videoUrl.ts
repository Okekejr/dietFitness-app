export const getYouTubeVideoId = (url: string): string => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([^&?\/\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : "";
};
