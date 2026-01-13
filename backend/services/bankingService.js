const axios = require('axios');

class BankingService {
    constructor() {
        // Thông tin API ngân hàng - nên lưu vào .env
        this.apiUrl = process.env.BANK_API_URL || 'https://api.sieuthicode.net/historyapimbv3';
        this.password = process.env.BANK_PASSWORD || '';
        this.accountNumber = process.env.BANK_ACCOUNT_NUMBER || '';
        this.token = process.env.BANK_TOKEN || '';
    }

    /**
     * Lấy lịch sử giao dịch từ API ngân hàng
     */
    async getTransactionHistory() {
        try {
            const url = `${this.apiUrl}/${this.password}/${this.accountNumber}/${this.token}`;
            const response = await axios.get(url);
            
            if (response.data.status === 'success') {
                return response.data.transactions || [];
            }
            
            return [];
        } catch (error) {
            console.error('Error fetching bank transactions:', error.message);
            return [];
        }
    }

    /**
     * Chuẩn hóa nội dung chuyển khoản để so sánh
     * Loại bỏ khoảng trắng, dấu, chuyển về lowercase
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');
    }

    /**
     * Kiểm tra xem description có chứa nội dung mong đợi không
     */
    matchTransaction(description, expectedContent) {
        const normalizedDesc = this.normalizeText(description);
        const normalizedExpected = this.normalizeText(expectedContent);
        
        return normalizedDesc.includes(normalizedExpected);
    }

    /**
     * Tìm giao dịch khớp với booking
     * @param {Object} booking - Thông tin booking
     * @param {Array} transactions - Danh sách giao dịch
     * @returns {Object|null} - Giao dịch khớp hoặc null
     */
    findMatchingTransaction(booking, transactions) {
        // Sử dụng mã đơn làm nội dung chuyển khoản
        const expectedContent = booking.bookingCode;
        
        console.log(`Looking for transaction with booking code: ${expectedContent}`);
        
        // Tìm giao dịch khớp
        for (const transaction of transactions) {
            if (transaction.type === 'IN') { // Chỉ xét giao dịch tiền vào
                // Kiểm tra số tiền khớp
                const transAmount = parseFloat(transaction.amount);
                if (Math.abs(transAmount - booking.totalPrice) < 100) { // Cho phép sai lệch < 100đ
                    // Kiểm tra nội dung chứa mã đơn
                    if (this.matchTransaction(transaction.description, expectedContent)) {
                        console.log(`Found matching transaction: ${transaction.transactionID}`);
                        return transaction;
                    }
                }
            }
        }
        
        return null;
    }
}

module.exports = new BankingService();
