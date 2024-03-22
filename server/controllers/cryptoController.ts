import { Request, Response, NextFunction } from 'express';
import CryptoJS from 'crypto-js';
import { CustomErrorHandler } from '../utils/CustomErrorHandler';

// Encryption controller
export const encryptDataController = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, secretKey } = req.body;

    if (!data || !secretKey) {
      return res.jsonResponse(false, 400, 'Data and secret key are required');
    }

    const encryptedData = CryptoJS.AES.encrypt(data, secretKey).toString();
    res.jsonResponse(true, 200, 'Data encrypted successfully', { encryptedData });
  } catch (error: any) {
    next(new CustomErrorHandler(500, 'Internal Server Error'));
  }
};

// Decryption controller
export const decryptDataController = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { encryptedData, secretKey } = req.body;

    if (!encryptedData || !secretKey) {
      return res.jsonResponse(false, 400, 'Encrypted data and secret key are required');
    }

    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
    res.jsonResponse(true, 200, 'Data decrypted successfully', { decryptedData });
  } catch (error: any) {
    next(new CustomErrorHandler(500, 'Internal Server Error'));
  }
};
