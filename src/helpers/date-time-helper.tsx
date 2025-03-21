export default class DateTimeHelper {
  static convertToLocalDateTimeString(date: Date): string {
    return date?.toLocaleString("en-us", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }

  static convertToLocalDateString(date: Date): string {
    return date?.toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  static formatDateTime(dateInput: Date | string | number, format: string = "YYYY-MM-DD HH:mm:ss"): string {
    // Parse input into a Date object
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    // Helper function to add leading zeros
    const padZero = (num: number, size: number = 2): string => num.toString().padStart(size, "0");

    // Extract date components
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1); // Months are zero-indexed
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());

    // Replace format tokens
    return format.replace("YYYY", year.toString()).replace("MM", month).replace("DD", day).replace("HH", hours).replace("mm", minutes).replace("ss", seconds);
  }

  static isDateWithinLastTwoDays(date: Date): boolean {
    const currentDate = new Date();

    // Create a date that represents 2 days ago from the current date
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(currentDate.getDate() - 2);

    // Compare if the given date is after or equal to 2 days ago and before or equal to today
    return date >= threeDaysAgo && date <= currentDate;
  }
}
