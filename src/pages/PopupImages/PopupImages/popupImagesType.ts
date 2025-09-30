export type PopupImageType = "Home" | "Wall";
export type PopupImageShowType = "One time" | "Recurring";

export interface PopupImage {
  id: number;
  imageUrl: string;
  popupImageType: PopupImageType;
  popupImageShowType: PopupImageShowType;
}

export interface PopupImageFormData {
  popupImageType: PopupImageType;
  popupImageShowType: PopupImageShowType;
}