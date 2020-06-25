export interface CustomError {
  title: string
  message: string
  httpCode: number
}

export const DatabaseError = (reason: string): CustomError => {
  return {
    title: 'Database Error',
    message: reason,
    httpCode: 500
  }
}

export const EmailSudahDigunakan: CustomError = {
  title: 'Email Sudah Terdaftar',
  message: 'Email sudah terdaftar',
  httpCode: 400
}

export const NimSudahDigunakan: CustomError = {
  title: 'NIM Sudah Terdaftar',
  message: 'NIM sudah terdaftar',
  httpCode: 400
}

export const EmailAtauPasswordSalah: CustomError = {
  title: 'Email atau password salah',
  message: 'Email atau password salah',
  httpCode: 400
}

export const SesiTidakValid: CustomError = {
  title: 'Sesi tidak valid',
  message: 'Sesi tidak valid',
  httpCode: 401
}

export const ValidationError = (reason: string): CustomError => {
  return {
    title: 'Validation Error',
    message: reason,
    httpCode: 400
  }
}

export const LibraryError = (reason: string): CustomError => {
  return {
    title: 'Library Error',
    message: reason,
    httpCode: 500
  }
}

export const DataTidakDitemukan = (entity: string): CustomError => {
  return {
    title: `${entity} not found`,
    message: `${entity} tidak ditemukan`,
    httpCode: 404
  }
}