# Hướng Dẫn Tích Hợp Sui Blockchain

## 1. Chuẩn Bị

### Cài đặt Sui CLI
```bash
curl -sSL https://sui-releases.s3.us-east-1.amazonaws.com/sui-linux-x86_64.tar.gz | tar -xz
export PATH=$PATH:/path/to/sui/bin
sui --version
```

### Tạo Sui Wallet
```bash
sui client new
# Chọn mạng: testnet
```

### Kiểm tra balance
```bash
sui client balance
# Nếu không có SUI, request từ faucet:
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw "{
    \"FixedAmountRequest\": {
      \"recipient\": \"<YOUR_WALLET_ADDRESS>\"
    }
  }"
```

## 2. Deploy Smart Contract

### 1. Tạo project Sui
```bash
sui move new attendance_package
cd attendance_package
```

### 2. Copy file contract
- Copy `sui-contracts/sources/attendance.move` vào `sources/` folder

### 3. Build contract
```bash
sui move build
```

### 4. Deploy contract
```bash
sui client publish --gas-budget 100000000
```

Kết quả sẽ cho bạn **Package ID**. Lưu lại.

### 5. Cập nhật Package ID
Mở file `src/lib/sui-blockchain.ts` và thay:
```typescript
export const ATTENDANCE_PACKAGE_ID = '0x...'; // Thay bằng Package ID của bạn
```

## 3. Cấu Hình Web App

### 1. Cài đặt dependencies
```bash
npm install @mysten/sui.js @mysten/wallet-kit
```

### 2. Cài đặt Sui Wallet Extension
- Download: https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmilocjcilehmwajfc37d4eebae

### 3. Chuyển sang Testnet trong Sui Wallet
- Click vào Sui Wallet icon
- Settings → Network → Testnet

### 4. Test kết nối
- Mở web app
- Click "Connect Wallet"
- Chọn Sui Wallet
- Ký transaction khi điểm danh

## 4. Xem Transaction History

### Trên Sui Explorer
```
https://suiscan.xyz/testnet/tx/<DIGEST>
```

### Hoặc qua CLI
```bash
sui client call --function record_attendance \
  --package <PACKAGE_ID> \
  --module attendance_record \
  --args "student_001" "Nguyen Van A" "session_001" 101234567 106567890 15
```

## 5. Structure

```
my-Proofly/
├── src/
│   ├── contexts/
│   │   └── SuiContext.tsx          # Sui wallet context
│   ├── components/
│   │   └── SuiWalletConnect.tsx    # Wallet connect button
│   ├── lib/
│   │   └── sui-blockchain.ts       # Sui interactions
│   ├── pages/
│   │   └── AttendPage.tsx          # Attendance form (updated)
│   └── App.tsx                     # App setup (updated)
└── sui-contracts/
    └── sources/
        └── attendance.move          # Smart contract
```

## 6. Tính Năng Hiện Tại

✅ Kết nối Sui Wallet
✅ Ghi điểm danh lên blockchain
✅ Lưu GPS coordinates
✅ Hiển thị transaction digest
✅ Event emit khi điểm danh

## 7. Cải Tiến Tương Lai

- [ ] Thêm query attendance records
- [ ] Tích hợp graph database
- [ ] Multi-sig für approval
- [ ] NFT certificate for attendance

## 8. Troubleshooting

### "Lỗi: Package not found"
- Kiểm tra Package ID có đúng không
- Chắc chắn smart contract đã được deploy

### "Lỗi: Insufficient gas"
- Tăng gas budget khi deploy
- Request thêm SUI từ faucet

### "Lỗi: Wallet not connected"
- Cài đặt Sui Wallet extension
- Chuyển sang Testnet
- Refresh page

## 9. Tài Liệu Tham Khảo

- Sui Docs: https://docs.sui.io
- Move Language: https://move-language.github.io
- Sui Wallet Kit: https://github.com/MystenLabs/sui
