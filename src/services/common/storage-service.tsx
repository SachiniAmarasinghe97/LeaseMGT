export default class StorageService {
  setItem(
    key: string,
    value: any,
    caster: (value: any) => string = (value: any) => {
      return JSON.stringify(value);
    }
  ): void {
    localStorage.setItem(key, caster(value));
  }

  getItem<T>(
    key: string,
    caster: (value: string) => T = (value: string) => {
      return JSON.parse(value) as T;
    }
  ): T | null {
    const value = localStorage.getItem(key);
    let obj = null;
    try {
      obj = value ? caster(value) : null;
    } catch (e) {
      console.log(e);
    }
    return obj;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  removeAll(): void {
    localStorage.clear();
  }
}
