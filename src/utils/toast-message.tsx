import { toast, ToastOptions } from "react-toastify";

export default class ToastMessage {
  static show(
    message: string,
    type: "success" | "error" = "success",
    duration: number = 2000,
    options?: ToastOptions
  ) {
    toast[type](message, { autoClose: duration, ...options });  }
}
