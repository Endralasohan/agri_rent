import axios from 'axios';

export function extractError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    return error.response.data.message;
  }
  return 'Request failed';
}

export function getApiErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
