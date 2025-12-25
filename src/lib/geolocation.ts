import { Location } from '@/types';

/**
 * Lấy vị trí GPS hiện tại của thiết bị
 */
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Trình duyệt không hỗ trợ Geolocation'));
      return;
    }

    let watchId: number | null = null;
    let resolved = false;

    const handlePosition = (position: GeolocationPosition) => {
      if (!resolved) {
        resolved = true;
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        });
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (!resolved) {
        resolved = true;
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        const errorMessages: Record<number, string> = {
          1: 'Bạn đã từ chối quyền truy cập vị trị. Vui lòng cấp quyền trong cài đặt trình duyệt.',
          2: 'Không thể lấy vị trị. Vui lòng đảm bảo GPS được bật trên thiết bị của bạn.',
          3: 'Yêu cầu vị trị hết thời gian chờ. Vui lòng thử lại.',
        };
        reject(new Error(errorMessages[error.code] || 'Lỗi không xác định'));
      }
    };

    // Sử dụng watchPosition với timeout tự định nghĩa (30 giây)
    watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 30000, // 30 giây (tăng từ 10 giây)
      maximumAge: 0,
    });

    // Fallback: nếu watchPosition không hoạt động, dùng getCurrentPosition
    setTimeout(() => {
      if (!resolved) {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        navigator.geolocation.getCurrentPosition(
          handlePosition,
          handleError,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    }, 100);
  });
};

/**
 * Tính khoảng cách giữa 2 điểm GPS (theo km) sử dụng công thức Haversine
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Khoảng cách tính bằng km
};

/**
 * Chuyển đổi độ sang radian
 */
const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Kiểm tra xem sinh viên có trong phạm vi lớp không
 * @param studentLat - Vị trí latitude của sinh viên
 * @param studentLon - Vị trí longitude của sinh viên
 * @param classLat - Vị trí latitude của lớp
 * @param classLon - Vị trí longitude của lớp
 * @param radiusKm - Bán kính phạm vi (mặc định 1 km)
 */
export const isWithinClassRadius = (
  studentLat: number,
  studentLon: number,
  classLat: number,
  classLon: number,
  radiusKm: number = 1
): boolean => {
  const distance = calculateDistance(studentLat, studentLon, classLat, classLon);
  return distance <= radiusKm;
};

/**
 * Format vị trí để hiển thị
 */
export const formatLocation = (location: Location): string => {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
};

/**
 * Format khoảng cách để hiển thị
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(2)}km`;
};
