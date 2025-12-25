import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Transaction } from '@mysten/sui.js/transactions';

// Testnet configuration
const rpcUrl = getFullnodeUrl('testnet');
export const suiClient = new SuiClient({ url: rpcUrl });

// Smart Contract Package ID (cần deploy trước)
export const ATTENDANCE_PACKAGE_ID = '0x...'; // Replace sau khi deploy

// Module name
export const ATTENDANCE_MODULE = 'attendance_record';

// Object type
export const ATTENDANCE_TYPE = `${ATTENDANCE_PACKAGE_ID}::${ATTENDANCE_MODULE}::AttendanceRecord`;

interface AttendanceData {
  studentId: string;
  studentName: string;
  sessionId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Tạo transaction để ghi điểm danh lên Sui
 */
export const createAttendanceTransaction = (data: AttendanceData): Transaction => {
  const tx = new Transaction();

  // Chuyển đổi GPS coordinates
  const latScaled = Math.round(data.latitude * 1e6);
  const lonScaled = Math.round(data.longitude * 1e6);

  tx.moveCall({
    target: `${ATTENDANCE_PACKAGE_ID}::${ATTENDANCE_MODULE}::record_attendance`,
    arguments: [
      tx.pure.string(data.studentId),
      tx.pure.string(data.studentName),
      tx.pure.string(data.sessionId),
      tx.pure.u64(latScaled),
      tx.pure.u64(lonScaled),
      tx.pure.u64(data.accuracy),
    ],
  });

  return tx;
};

/**
 * Lấy attendance records từ blockchain
 */
export const getAttendanceRecords = async (sessionId: string) => {
  try {
    const objects = await suiClient.queryEvents({
      query: {
        MoveEventType: `${ATTENDANCE_TYPE}::AttendanceRecorded`,
      },
    });
    return objects.data;
  } catch (error) {
    console.error('Lỗi lấy attendance records:', error);
    throw error;
  }
};

/**
 * Kiểm tra xem đã điểm danh chưa
 */
export const checkAttendanceExists = async (
  sessionId: string,
  studentId: string
): Promise<boolean> => {
  try {
    const records = await getAttendanceRecords(sessionId);
    return records.some((record: any) => {
      const parsedData = JSON.parse(record.parsedJson as string);
      return (
        parsedData.student_id === studentId &&
        parsedData.session_id === sessionId
      );
    });
  } catch (error) {
    console.error('Lỗi kiểm tra điểm danh:', error);
    return false;
  }
};

/**
 * Lấy attendance record cụ thể
 */
export const getAttendanceRecord = async (
  sessionId: string,
  studentId: string
) => {
  try {
    const records = await getAttendanceRecords(sessionId);
    const record = records.find((record: any) => {
      const parsedData = JSON.parse(record.parsedJson as string);
      return (
        parsedData.student_id === studentId &&
        parsedData.session_id === sessionId
      );
    });
    return record ? JSON.parse(record.parsedJson as string) : null;
  } catch (error) {
    console.error('Lỗi lấy attendance record:', error);
    return null;
  }
};

/**
 * Format address Sui
 */
export const formatSuiAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Validate Sui address
 */
export const isValidSuiAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
