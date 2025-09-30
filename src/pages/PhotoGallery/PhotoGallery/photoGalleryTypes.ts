export type PhotoGallery = {
  id: number;
  title: string;
  mainImageUrl?: string;
  multipleImages?: string[];
};

export type PhotoGalleryFormData = {
  title: string;
};