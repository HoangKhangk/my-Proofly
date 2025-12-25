module attendance_record::attendance_record {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::String;

    /// Attendance Record Object
    public struct AttendanceRecord has key {
        id: UID,
        student_id: String,
        student_name: String,
        session_id: String,
        latitude: u64,
        longitude: u64,
        accuracy: u64,
        timestamp: u64,
    }

    /// Event emitted when attendance is recorded
    public struct AttendanceRecorded has copy, drop {
        student_id: String,
        student_name: String,
        session_id: String,
        latitude: u64,
        longitude: u64,
        accuracy: u64,
        timestamp: u64,
        recorded_by: address,
    }

    /// Record attendance for a student
    public fun record_attendance(
        student_id: String,
        student_name: String,
        session_id: String,
        latitude: u64,
        longitude: u64,
        accuracy: u64,
        ctx: &mut TxContext,
    ) {
        let timestamp = tx_context::epoch(ctx);
        let sender = tx_context::sender(ctx);

        let attendance = AttendanceRecord {
            id: object::new(ctx),
            student_id: student_id,
            student_name: student_name,
            session_id: session_id,
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy,
            timestamp: timestamp,
        };

        // Emit event
        event::emit(AttendanceRecorded {
            student_id: attendance.student_id,
            student_name: attendance.student_name,
            session_id: attendance.session_id,
            latitude: attendance.latitude,
            longitude: attendance.longitude,
            accuracy: attendance.accuracy,
            timestamp: attendance.timestamp,
            recorded_by: sender,
        });

        // Store the record on-chain
        sui::transfer::share_object(attendance);
    }

    /// View attendance record
    public fun get_student_id(record: &AttendanceRecord): String {
        record.student_id
    }

    public fun get_session_id(record: &AttendanceRecord): String {
        record.session_id
    }

    public fun get_timestamp(record: &AttendanceRecord): u64 {
        record.timestamp
    }
}
