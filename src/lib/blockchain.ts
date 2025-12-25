import { ethers } from 'ethers';

/**
 * ABI của Smart Contract Attendance
 * Đây là interface cơ bản - bạn cần update với ABI thực tế
 */
const ATTENDANCE_ABI = [
  'function recordAttendance(string studentId, string studentName, string sessionId, uint256 latitude, uint256 longitude, uint256 accuracy) public',
  'function getAttendanceRecord(string sessionId, string studentId) public view returns (tuple(string studentId, string studentName, uint256 timestamp, uint256 latitude, uint256 longitude))',
  'function isAttended(string sessionId, string studentId) public view returns (bool)',
];

interface AttendanceData {
  studentId: string;
  studentName: string;
  sessionId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Ghi điểm danh lên blockchain
 */
export const recordAttendanceOnChain = async (
  signer: ethers.Signer,
  contractAddress: string,
  data: AttendanceData
) => {
  try {
    const contract = new ethers.Contract(contractAddress, ATTENDANCE_ABI, signer);

    // Chuyển đổi tọa độ GPS sang uint256 (lưu với độ chính xác)
    const latScaled = Math.round(data.latitude * 1e6);
    const lonScaled = Math.round(data.longitude * 1e6);

    const tx = await contract.recordAttendance(
      data.studentId,
      data.studentName,
      data.sessionId,
      latScaled,
      lonScaled,
      data.accuracy
    );

    // Chờ transaction được confirm
    const receipt = await tx.wait(1);
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Lỗi ghi điểm danh lên blockchain:', error);
    throw error;
  }
};

/**
 * Kiểm tra xem đã điểm danh chưa
 */
export const checkAttendanceOnChain = async (
  provider: ethers.BrowserProvider,
  contractAddress: string,
  sessionId: string,
  studentId: string
) => {
  try {
    const contract = new ethers.Contract(contractAddress, ATTENDANCE_ABI, provider);
    const isAttended = await contract.isAttended(sessionId, studentId);
    return isAttended;
  } catch (error) {
    console.error('Lỗi kiểm tra điểm danh:', error);
    return false;
  }
};

/**
 * Lấy bằng chứng điểm danh từ blockchain
 */
export const getAttendanceProof = async (
  provider: ethers.BrowserProvider,
  contractAddress: string,
  sessionId: string,
  studentId: string
) => {
  try {
    const contract = new ethers.Contract(contractAddress, ATTENDANCE_ABI, provider);
    const record = await contract.getAttendanceRecord(sessionId, studentId);
    
    return {
      studentId: record.studentId,
      studentName: record.studentName,
      timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
      latitude: Number(record.latitude) / 1e6,
      longitude: Number(record.longitude) / 1e6,
    };
  } catch (error) {
    console.error('Lỗi lấy bằng chứng:', error);
    throw error;
  }
};

/**
 * Ký thông báo xác thực
 */
export const signAttendanceData = async (
  signer: ethers.Signer,
  message: string
): Promise<string> => {
  try {
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    console.error('Lỗi ký thông báo:', error);
    throw error;
  }
};
