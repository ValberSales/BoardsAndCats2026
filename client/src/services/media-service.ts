import { api } from "@/lib/axios";

const upload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await api.post("/admin/media/upload", formData);
  
  return response.data.filename;
};

const MediaService = {
  upload,
};

export default MediaService;
