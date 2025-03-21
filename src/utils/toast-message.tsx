import { toast } from "react-toastify";

export default class ToastMessage {
  static show(message: string, duration: number = 2000) {
    toast(message, { autoClose: duration });
  }
}
