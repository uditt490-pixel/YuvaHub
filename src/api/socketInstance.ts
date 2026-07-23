let ioInstance: any = null;

export function getSocketIO() {
  return ioInstance;
}

export function setSocketIO(io: any) {
  ioInstance = io;
}
